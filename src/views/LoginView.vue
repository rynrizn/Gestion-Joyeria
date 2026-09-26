<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute, RouterLink } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import InputTexto from '../components/common/InputTexto.vue'
import BotonPrincipal from '../components/common/BotonPrincipal.vue'
import ModalAlerta from '../components/common/ModalAlerta.vue'
import IconoLucide from '../components/common/IconoLucide.vue'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const identificador = ref('')
const password = ref('')
const mostrarPassword = ref(false)
const cargando = ref(false)

// Modales de error / alerta
const modalErrorVisible = ref(false)
const modalTitulo = ref('')
const modalMensaje = ref('')
const modalDetalles = ref('')

// Temporizador para actualización de cuenta regresiva
let intervaloTimer = null

onMounted(() => {
  intervaloTimer = setInterval(() => {
    // Provoca reactividad en el tiempo restante de bloqueo
    if (authStore.estaBloqueado) {
      // Fuerza reevaluación si es necesario
    }
  }, 1000)
})

onUnmounted(() => {
  if (intervaloTimer) clearInterval(intervaloTimer)
})

const procesarLogin = async () => {
  if (authStore.estaBloqueado) {
    modalTitulo.value = 'Acceso Bloqueado Temporalmente'
    modalMensaje.value = `Se ha alcanzado el límite de 5 intentos fallidos consecutivos.`
    modalDetalles.value = `Por favor, espera ${authStore.minutosRestantesBloqueo} minuto(s) antes de intentar nuevamente.`
    modalErrorVisible.value = true
    return
  }

  if (!identificador.value.trim() || !password.value.trim()) {
    modalTitulo.value = 'Campos Incompletos'
    modalMensaje.value = 'Por favor ingresa tu usuario o correo electrónico y tu contraseña.'
    modalDetalles.value = ''
    modalErrorVisible.value = true
    return
  }

  cargando.value = true

  try {
    const resultado = await authStore.iniciarSesion(identificador.value, password.value)

    if (resultado.exito) {
      const rutaDestino = route.query.redirect || '/admin/dashboard'
      router.push(rutaDestino)
    } else {
      if (resultado.bloqueado) {
        modalTitulo.value = 'Acceso Bloqueado (5 Intentos)'
        modalMensaje.value = 'Has superado el límite permitido de intentos erróneos.'
        modalDetalles.value = `El sistema se mantendrá bloqueado durante ${resultado.minutosRestantes} minutos para proteger la seguridad de la tienda.`
      } else {
        modalTitulo.value = 'Credenciales Incorrectas'
        modalMensaje.value = 'El correo/usuario o la contraseña ingresada no son válidos.'
        modalDetalles.value = `Te quedan ${resultado.intentosRestantes} de 5 intentos antes del bloqueo temporal.`
      }
      modalErrorVisible.value = true
    }
  } catch (err) {
    modalTitulo.value = 'Error Inesperado'
    modalMensaje.value = 'Ocurrió un error al procesar el inicio de sesión.'
    modalDetalles.value = err.message || ''
    modalErrorVisible.value = true
  } finally {
    cargando.value = false
  }
}
</script>

<template>
  <div class="pantalla-login">
    <div class="tarjeta-login">
      <!-- Marca y Cabecera Oficial Moonstone -->
      <div class="cabecera-login">
        <h1 class="logo-marca">MOONSTONE</h1>
        <h2 class="titulo-login">Acceso al Sistema</h2>
        <p class="subtitulo-login">Gestión de inventario y ventas</p>
      </div>

      <!-- Alerta si la cuenta está bloqueada -->
      <div v-if="authStore.estaBloqueado" class="alerta-bloqueo">
        <IconoLucide nombre="ShieldAlert" :tamano="20" />
        <div class="texto-bloqueo">
          <strong>Acceso temporalmente restringido</strong>
          <span>Reintenta en aproximadamente {{ authStore.minutosRestantesBloqueo }} minuto(s).</span>
        </div>
      </div>

      <!-- Formulario de Acceso -->
      <form class="formulario-login" @submit.prevent="procesarLogin">
        <!-- Input de Identificador -->
        <InputTexto
          v-model="identificador"
          etiqueta="Correo electrónico o usuario"
          tipo="text"
          placeholder="ej. duena@moonstone.com o duena"
          :deshabilitado="authStore.estaBloqueado"
          requerido
        >
          <template #iconoIzquierda>
            <IconoLucide nombre="Mail" :tamano="18" />
          </template>
        </InputTexto>

        <!-- Input de Contraseña con Toggle Ojo -->
        <InputTexto
          v-model="password"
          etiqueta="Contraseña de acceso"
          :tipo="mostrarPassword ? 'text' : 'password'"
          placeholder="••••••••"
          :deshabilitado="authStore.estaBloqueado"
          requerido
        >
          <template #iconoIzquierda>
            <IconoLucide nombre="Lock" :tamano="18" />
          </template>
          <template #iconoDerecha>
            <button
              type="button"
              class="boton-toggle-ojo"
              aria-label="Alternar visibilidad de contraseña"
              @click="mostrarPassword = !mostrarPassword"
            >
              <IconoLucide :nombre="mostrarPassword ? 'EyeOff' : 'Eye'" :tamano="18" />
            </button>
          </template>
        </InputTexto>

        <!-- Botón de Envío -->
        <BotonPrincipal
          tipo="submit"
          ancho-completo
          :cargando="cargando"
          :deshabilitado="authStore.estaBloqueado"
        >
          {{ authStore.estaBloqueado ? 'Acceso Bloqueado' : 'Iniciar Sesión' }}
        </BotonPrincipal>
      </form>

      <!-- Pie con Enlace al Catálogo Público -->
      <div class="pie-login">
        <RouterLink to="/" class="enlace-volver-catalogo">
          <IconoLucide nombre="ArrowLeft" :tamano="16" />
          <span>Volver al Catálogo Público</span>
        </RouterLink>
      </div>
    </div>

    <!-- Modal Centralizado de Error / Alerta -->
    <ModalAlerta
      :visible="modalErrorVisible"
      tipo="error"
      :titulo="modalTitulo"
      :mensaje="modalMensaje"
      :detalles="modalDetalles"
      texto-boton="Entendido"
      @cerrar="modalErrorVisible = false"
    />
  </div>
</template>

<style scoped>
.pantalla-login {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--color-fondo-principal);
  padding: 20px;
}

.tarjeta-login {
  width: 100%;
  max-width: 420px;
  background-color: var(--color-blanco);
  border: 1px solid var(--color-neutral-200);
  border-radius: var(--radio-lg);
  box-shadow: var(--sombra-modal);
  padding: 36px 30px;
  display: flex;
  flex-direction: column;
  gap: 22px;
}

.cabecera-login {
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.logo-marca {
  font-size: 24px;
  font-weight: 800;
  color: var(--color-primario);
  letter-spacing: 0.14em;
}

.titulo-login {
  font-size: 16px;
  font-weight: 700;
  color: var(--color-neutral-900);
}

.subtitulo-login {
  font-size: 13px;
  color: var(--color-neutral-600);
}

.alerta-bloqueo {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px 14px;
  background-color: var(--color-peligro-fondo);
  border: 1px solid var(--color-peligro-borde);
  border-radius: var(--radio-md);
  color: var(--color-peligro);
  font-size: 13px;
}

.texto-bloqueo {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.formulario-login {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.boton-toggle-ojo {
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-neutral-600);
  padding: 4px;
  border-radius: var(--radio-sm);
  transition: color var(--transicion-rapida);
}

.boton-toggle-ojo:hover {
  color: var(--color-neutral-900);
}

.pie-login {
  text-align: center;
  padding-top: 14px;
  border-top: 1px solid var(--color-neutral-200);
}

.enlace-volver-catalogo {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: var(--color-neutral-600);
  font-weight: 500;
  transition: color var(--transicion-rapida);
}

.enlace-volver-catalogo:hover {
  color: var(--color-primario);
}
</style>
