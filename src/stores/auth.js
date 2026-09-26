import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

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
      return guardado ? JSON.parse(guardado) : null
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

  // Registros autorizados en Supabase (configuracion-supabase.txt)
  const USUARIOS_VALIDOS = [
    {
      identificadores: ['duena@moonstone.com', 'duena'],
      password: 'admin1234',
      datos: {
        id: 1,
        nombre: 'Dueña del Negocio',
        username: 'duena',
        email: 'duena@moonstone.com',
        rol: 'ADMINISTRADORA',
        id_rol: 1,
        turno: 'Todos los Turnos',
      },
    },
    {
      identificadores: ['manana@moonstone.com', 'vendedoramanana', 'manana'],
      password: 'mañana2026',
      datos: {
        id: 2,
        nombre: 'Vendedora Mañana',
        username: 'vendedoramanana',
        email: 'manana@moonstone.com',
        rol: 'PERSONAL_TIENDA',
        id_rol: 2,
        turno: 'Turno Mañana',
      },
    },
    {
      identificadores: ['tarde@moonstone.com', 'vendedoratarde', 'tarde'],
      password: 'tarde2026',
      datos: {
        id: 3,
        nombre: 'Vendedora Tarde',
        username: 'vendedoratarde',
        email: 'tarde@moonstone.com',
        rol: 'PERSONAL_TIENDA',
        id_rol: 2,
        turno: 'Turno Tarde',
      },
    },
  ]

  // Iniciar sesión con validación de credenciales e intentos
  const iniciarSesion = async (identificador, contrasena) => {
    cargando.value = true
    error.value = ''

    // 1. Verificar si el usuario está bloqueado temporalmente
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

    const idLimpio = identificador.trim().toLowerCase()
    const passLimpio = contrasena.trim()

    // 2. Buscar coincidencia con las credenciales oficiales de Supabase
    const usuarioEncontrado = USUARIOS_VALIDOS.find(
      (u) => u.identificadores.includes(idLimpio) && u.password === passLimpio
    )

    if (usuarioEncontrado) {
      // Éxito: Guardar sesión y resetear intentos
      usuario.value = { ...usuarioEncontrado.datos }
      localStorage.setItem(CLAVE_SESION, JSON.stringify(usuario.value))
      
      // Limpiar contadores de intentos fallidos
      intentosFallidos.value = 0
      tiempoBloqueoHasta.value = 0
      localStorage.removeItem(CLAVE_INTENTOS)
      localStorage.removeItem(CLAVE_BLOQUEO)

      cargando.value = false
      return { exito: true }
    } else {
      // Fallo: Incrementar contador de intentos fallidos
      intentosFallidos.value += 1
      localStorage.setItem(CLAVE_INTENTOS, String(intentosFallidos.value))

      if (intentosFallidos.value >= MAX_INTENTOS) {
        // Bloquear por 15 minutos
        tiempoBloqueoHasta.value = Date.now() + TIEMPO_BLOQUEO_MS
        localStorage.setItem(CLAVE_BLOQUEO, String(tiempoBloqueoHasta.value))

        error.value = `Has superado el límite de 5 intentos fallidos. El acceso ha sido bloqueado por 15 minutos por seguridad.`
        cargando.value = false
        return {
          exito: false,
          bloqueado: true,
          mensaje: error.value,
          minutosRestantes: 15,
        }
      } else {
        const restantes = MAX_INTENTOS - intentosFallidos.value
        error.value = `Credenciales incorrectas. Te queda${restantes > 1 ? 'n' : ''} ${restantes} intento${restantes > 1 ? 's' : ''} antes de bloquear temporalmente el acceso.`
        cargando.value = false
        return {
          exito: false,
          bloqueado: false,
          mensaje: error.value,
          intentosRestantes: restantes,
        }
      }
    }
  }

  // Cerrar sesión
  const cerrarSesion = () => {
    usuario.value = null
    localStorage.removeItem(CLAVE_SESION)
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
