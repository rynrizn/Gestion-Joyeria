<script setup>
import { ref } from 'vue'
import { useRouter, RouterLink } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import InputTexto from '../components/common/InputTexto.vue'
import BotonPrincipal from '../components/common/BotonPrincipal.vue'
import IconoLucide from '../components/common/IconoLucide.vue'

const router = useRouter()
const authStore = useAuthStore()

const email = ref('admin@moonstone.bo')
const password = ref('moonstone123')
const mostrarPassword = ref(false)
const cargando = ref(false)
const error = ref('')

const procesarLogin = async () => {
  if (!email.value.trim() || !password.value.trim()) {
    error.value = 'Por favor, ingresa tu correo y contraseña.'
    return
  }

  cargando.value = true
  error.value = ''

  try {
    const exito = await authStore.iniciarSesion(email.value, password.value)
    if (exito) {
      router.push('/admin/dashboard')
    } else {
      error.value = 'Credenciales no válidas. Revisa tus datos.'
    }
  } catch (err) {
    error.value = 'Ocurrió un error al intentar acceder.'
  } finally {
    cargando.value = false
  }
}
</script>

<template>
  <div class="pantalla-login">
    <div class="tarjeta-login">
      <!-- Marca y Cabecera -->
      <div class="cabecera-login">
        <h1 class="logo-marca">Moonstone</h1>
        <h2 class="titulo-login">Acceso al Sistema de Gestión</h2>
        <p class="subtitulo-login">Exclusivo para la administradora y vendedoras</p>
      </div>

      <!-- Formulario de Acceso -->
      <form class="formulario-login" @submit.prevent="procesarLogin">
        <!-- Input de Correo -->
        <InputTexto
          v-model="email"
          etiqueta="Correo electrónico o usuario"
          tipo="email"
          placeholder="ejemplo@moonstone.bo"
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

        <!-- Alerta de Error -->
        <div v-if="error" class="alerta-error">
          <IconoLucide nombre="AlertCircle" :tamano="16" />
          <span>{{ error }}</span>
        </div>

        <!-- Botón de Envío -->
        <BotonPrincipal
          tipo="submit"
          ancho-completo
          :cargando="cargando"
        >
          Iniciar Sesión
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
  </div>
</template>

<style scoped>
.pantalla-login {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--color-neutral-50);
  padding: 20px;
}

.tarjeta-login {
  width: 100%;
  max-width: 420px;
  background-color: var(--color-blanco);
  border: 1px solid var(--color-neutral-200);
  border-radius: var(--radio-lg);
  box-shadow: var(--sombra-tarjeta);
  padding: 32px 28px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.cabecera-login {
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.logo-marca {
  font-size: 26px;
  font-weight: 800;
  color: var(--color-neutral-900);
  letter-spacing: -0.03em;
}

.titulo-login {
  font-size: var(--tamano-h2);
  font-weight: 600;
  color: var(--color-neutral-900);
}

.subtitulo-login {
  font-size: 13px;
  color: var(--color-neutral-600);
}

.formulario-login {
  display: flex;
  flex-direction: column;
  gap: 16px;
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

.alerta-error {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  background-color: var(--color-peligro-fondo);
  border: 1px solid rgba(220, 38, 38, 0.2);
  border-radius: var(--radio-sm);
  color: var(--color-peligro);
  font-size: 13px;
  font-weight: 500;
}

.pie-login {
  text-align: center;
  padding-top: 12px;
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
  color: var(--color-neutral-900);
}
</style>
