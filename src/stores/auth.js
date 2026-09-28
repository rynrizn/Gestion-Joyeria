import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase, isSupabaseConfigured } from '../supabase/client'

const CLAVE_SESION = 'moonstone_usuario'
const CLAVE_INTENTOS = 'moonstone_intentos_login'
const CLAVE_BLOQUEO = 'moonstone_bloqueo_hasta'
const MAX_INTENTOS = 5
const TIEMPO_BLOQUEO_MS = 15 * 60 * 1000 // 15 minutos

export const useAuthStore = defineStore('auth', () => {
  // Inicialización de sesión desde localStorage (si existe)
  const cargarSesionInicial = () => {
    try {
      const guardado = localStorage.getItem(CLAVE_SESION)
      if (!guardado) return null
      const parsed = JSON.parse(guardado)
      return parsed
    } catch {
      return null
    }
  }

  const usuario = ref(cargarSesionInicial())
  const cargando = ref(false)
  const error = ref('')

  // Control de intentos y bloqueo por fuerza bruta
  const intentosFallidos = ref(Number(localStorage.getItem(CLAVE_INTENTOS) || 0))
  const tiempoBloqueoHasta = ref(Number(localStorage.getItem(CLAVE_BLOQUEO) || 0))

  // Computados de sesión
  const estaAutenticado = computed(() => !!usuario.value)
  const esAdmin = computed(() => usuario.value?.rol === 'ADMINISTRADORA')
  const rolVisual = computed(() => {
    if (!usuario.value) return 'Sin sesión'
    return usuario.value.rol === 'ADMINISTRADORA' ? 'Administradora' : 'Personal de Tienda'
  })

  // Computados de bloqueo
  const estaBloqueado = computed(() => {
    return tiempoBloqueoHasta.value > Date.now()
  })

  const minutosRestantesBloqueo = computed(() => {
    if (!estaBloqueado.value) return 0
    return Math.ceil((tiempoBloqueoHasta.value - Date.now()) / (60 * 1000))
  })

  const segundosRestantesBloqueo = computed(() => {
    if (!estaBloqueado.value) return 0
    return Math.max(0, Math.ceil((tiempoBloqueoHasta.value - Date.now()) / 1000))
  })

  const intentosRestantes = computed(() => {
    return Math.max(0, MAX_INTENTOS - intentosFallidos.value)
  })

  // Determinar turno operativo según rol y datos del usuario
  const deducirTurno = (nombreUsuario = '', nombre = '', rol = '') => {
    if (rol === 'ADMINISTRADORA') return 'Todos los Turnos'
    const texto = `${nombreUsuario} ${nombre}`.toLowerCase()
    if (texto.includes('mañana') || texto.includes('manana')) return 'Turno Mañana'
    if (texto.includes('tarde')) return 'Turno Tarde'
    return 'Turno General'
  }

  // Registrar un intento fallido y aplicar bloqueo si corresponde
  const registrarIntentoFallido = (mensajeError) => {
    intentosFallidos.value += 1
    localStorage.setItem(CLAVE_INTENTOS, String(intentosFallidos.value))

    if (intentosFallidos.value >= MAX_INTENTOS) {
      tiempoBloqueoHasta.value = Date.now() + TIEMPO_BLOQUEO_MS
      localStorage.setItem(CLAVE_BLOQUEO, String(tiempoBloqueoHasta.value))
      error.value = 'Has superado el límite de 5 intentos fallidos. El acceso ha sido bloqueado por 15 minutos por seguridad.'
      return {
        exito: false,
        bloqueado: true,
        mensaje: error.value,
        minutosRestantes: 15,
      }
    }

    const restantes = MAX_INTENTOS - intentosFallidos.value
    error.value = mensajeError || `Credenciales incorrectas. Te queda${restantes > 1 ? 'n' : ''} ${restantes} intento${restantes > 1 ? 's' : ''} antes de bloquear temporalmente el acceso.`
    return {
      exito: false,
      bloqueado: false,
      mensaje: error.value,
      intentosRestantes: restantes,
    }
  }

  // Limpiar intentos tras un login exitoso
  const limpiarIntentos = () => {
    intentosFallidos.value = 0
    tiempoBloqueoHasta.value = 0
    localStorage.removeItem(CLAVE_INTENTOS)
    localStorage.removeItem(CLAVE_BLOQUEO)
  }

  /**
   * Iniciar sesión real autenticando contra Supabase Auth (auth.users)
   * y obteniendo el perfil y rol desde la base de datos (public.usuario + public.rol)
   */
  const iniciarSesion = async (identificador, contrasena) => {
    cargando.value = true
    error.value = ''

    // 1. Verificar bloqueo por fuerza bruta
    if (estaBloqueado.value) {
      cargando.value = false
      const mins = minutosRestantesBloqueo.value
      error.value = `Acceso bloqueado por demasiados intentos fallidos. Intenta nuevamente en ${mins} minuto${mins > 1 ? 's' : ''}.`
      return {
        exito: false,
        bloqueado: true,
        mensaje: error.value,
        minutosRestantes: mins,
      }
    }

    const idLimpio = identificador.trim()
    const passLimpio = contrasena.trim()

    try {
      let emailAAutenticar = idLimpio.toLowerCase()

      // 2. Si no es un email directo, resolver el correo asociado desde la base de datos (public.usuario)
      if (!emailAAutenticar.includes('@')) {
        const { data: usuarioEncontrado } = await supabase
          .from('usuario')
          .select('correo')
          .ilike('nombre_usuario', emailAAutenticar)
          .maybeSingle()

        if (usuarioEncontrado?.correo) {
          emailAAutenticar = usuarioEncontrado.correo.toLowerCase()
        } else {
          // Búsqueda flexible por nombre si el identificador no coincide directamente con nombre_usuario
          const { data: usuarioPorNombre } = await supabase
            .from('usuario')
            .select('correo')
            .ilike('nombre', `%${emailAAutenticar}%`)
            .maybeSingle()

          if (usuarioPorNombre?.correo) {
            emailAAutenticar = usuarioPorNombre.correo.toLowerCase()
          }
        }
      }

      // 3. Autenticación contra Supabase Auth (auth.users)
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: emailAAutenticar,
        password: passLimpio,
      })

      if (authError || !authData?.user) {
        cargando.value = false
        return registrarIntentoFallido('Correo, usuario o contraseña incorrectos.')
      }

      const authUser = authData.user

      // 4. Consultar perfil en public.usuario mediante auth_id o correo con su rol
      let { data: perfilUsuario, error: errorPerfil } = await supabase
        .from('usuario')
        .select(`
          id_usuario,
          nombre,
          nombre_usuario,
          correo,
          auth_id,
          activo,
          id_rol,
          rol:id_rol (
            id_rol,
            nombre
          )
        `)
        .eq('auth_id', authUser.id)
        .maybeSingle()

      // Respaldo: si por alguna razón no coincidiera auth_id exacto, buscar por correo
      if (!perfilUsuario) {
        const { data: perfilPorCorreo } = await supabase
          .from('usuario')
          .select(`
            id_usuario,
            nombre,
            nombre_usuario,
            correo,
            auth_id,
            activo,
            id_rol,
            rol:id_rol (
              id_rol,
              nombre
            )
          `)
          .ilike('correo', authUser.email)
          .maybeSingle()

        if (perfilPorCorreo) {
          perfilUsuario = perfilPorCorreo
          // Sincronizar automáticamente el auth_id en la base de datos
          try {
            await supabase
              .from('usuario')
              .update({ auth_id: authUser.id })
              .eq('id_usuario', perfilPorCorreo.id_usuario)
          } catch (syncErr) {
            console.warn('No se pudo actualizar auth_id en usuario:', syncErr)
          }
        }
      }

      // 5. Verificar si el usuario está activo en la tienda
      if (perfilUsuario && perfilUsuario.activo === false) {
        await supabase.auth.signOut()
        cargando.value = false
        error.value = 'Este usuario se encuentra inactivo. Consulta con la administradora.'
        return {
          exito: false,
          bloqueado: false,
          mensaje: error.value,
        }
      }

      // 6. Determinar rol y estructura de datos para la aplicación
      const rolNombre = perfilUsuario?.rol?.nombre || (perfilUsuario?.id_rol === 1 ? 'ADMINISTRADORA' : 'PERSONAL_TIENDA')
      const turnoCalculado = deducirTurno(
        perfilUsuario?.nombre_usuario || '',
        perfilUsuario?.nombre || '',
        rolNombre
      )

      const usuarioFinal = {
        id: perfilUsuario?.id_usuario || 1,
        id_usuario: perfilUsuario?.id_usuario || 1,
        nombre: perfilUsuario?.nombre || (rolNombre === 'ADMINISTRADORA' ? 'Belen' : 'Personal de Tienda'),
        username: perfilUsuario?.nombre_usuario || emailAAutenticar.split('@')[0],
        email: authUser.email,
        correo: authUser.email,
        rol: rolNombre,
        id_rol: perfilUsuario?.id_rol || (rolNombre === 'ADMINISTRADORA' ? 1 : 2),
        turno: turnoCalculado,
        auth_id: authUser.id,
      }

      // 7. Establecer sesión y persistencia
      usuario.value = usuarioFinal
      localStorage.setItem(CLAVE_SESION, JSON.stringify(usuarioFinal))
      limpiarIntentos()

      cargando.value = false
      return { exito: true }
    } catch (err) {
      cargando.value = false
      error.value = err.message || 'Error de conexión con el servicio de autenticación.'
      return {
        exito: false,
        bloqueado: false,
        mensaje: error.value,
        intentosRestantes: Math.max(0, MAX_INTENTOS - intentosFallidos.value),
      }
    }
  }

  // Cerrar sesión tanto en el cliente local como en Supabase Auth
  const cerrarSesion = async () => {
    usuario.value = null
    localStorage.removeItem(CLAVE_SESION)
    try {
      await supabase.auth.signOut()
    } catch (err) {
      console.error('Error al cerrar sesión en Supabase:', err)
    }
  }

  return {
    usuario,
    cargando,
    error,
    estaAutenticado,
    esAdmin,
    rolVisual,
    estaBloqueado,
    intentosFallidos,
    intentosRestantes,
    minutosRestantesBloqueo,
    segundosRestantesBloqueo,
    iniciarSesion,
    cerrarSesion,
  }
})
