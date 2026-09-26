import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useAuthStore = defineStore('auth', () => {
  // Estado reactivo con datos de demostración
  const usuario = ref({
    id: 1,
    nombre: 'Sofía Valdivia',
    email: 'admin@moonstone.bo',
    rol: 'ADMINISTRADORA',
    turno: 'Turno Tarde',
  })

  const estaAutenticado = computed(() => !!usuario.value)
  const esAdmin = computed(() => usuario.value?.rol === 'ADMINISTRADORA')
  const cargando = ref(false)
  const error = ref('')

  // Acción mock para iniciar sesión
  const iniciarSesion = async (email, password) => {
    cargando.value = true
    error.value = ''

    try {
      // Simulación de autenticación local
      usuario.value = {
        id: 1,
        nombre: 'Sofía Valdivia',
        email: email || 'admin@moonstone.bo',
        rol: 'ADMINISTRADORA',
        turno: 'Turno Tarde',
      }
      return true
    } catch (err) {
      error.value = 'Credenciales no válidas'
      return false
    } finally {
      cargando.value = false
    }
  }

  // Acción mock para cerrar sesión
  const cerrarSesion = () => {
    usuario.value = null
  }

  return {
    usuario,
    estaAutenticado,
    esAdmin,
    cargando,
    error,
    iniciarSesion,
    cerrarSesion,
  }
})
