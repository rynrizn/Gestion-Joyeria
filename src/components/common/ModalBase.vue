<script setup>
import { onMounted, onUnmounted, watch } from 'vue'
import IconoLucide from './IconoLucide.vue'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
  titulo: {
    type: String,
    default: '',
  },
  anchoMaximo: {
    type: String,
    default: '520px',
  },
})

const emit = defineEmits(['cerrar'])

// Cerrar con tecla Escape
const manejarTeclaEsc = (evento) => {
  if (evento.key === 'Escape' && props.visible) {
    emit('cerrar')
  }
}

// Bloquear el scroll del body cuando el modal está abierto
watch(
  () => props.visible,
  (estaAbierto) => {
    if (estaAbierto) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
  }
)

onMounted(() => {
  window.addEventListener('keydown', manejarTeclaEsc)
})

onUnmounted(() => {
  window.removeEventListener('keydown', manejarTeclaEsc)
  document.body.style.overflow = ''
})
</script>

<template>
  <Teleport to="body">
    <Transition name="fade-modal">
      <div v-if="visible" class="telon-fondo" @click.self="emit('cerrar')">
        <div class="caja-modal" :style="{ maxWidth: anchoMaximo }">
          <!-- Cabecera del modal -->
          <div class="cabecera-modal">
            <h2 class="titulo-modal">{{ titulo }}</h2>
            <button
              type="button"
              class="boton-cerrar"
              aria-label="Cerrar ventana"
              @click="emit('cerrar')"
            >
              <IconoLucide nombre="X" :tamano="18" />
            </button>
          </div>

          <!-- Contenido dinámico -->
          <div class="cuerpo-modal">
            <slot />
          </div>

          <!-- Pie opcional para botones de acción -->
          <div v-if="$slots.pie" class="pie-modal">
            <slot name="pie" />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.telon-fondo {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  background-color: rgba(17, 24, 39, 0.6);
  backdrop-filter: blur(2px);
}

.caja-modal {
  width: 100%;
  background-color: var(--color-blanco);
  border-radius: var(--radio-lg);
  box-shadow: var(--sombra-modal);
  display: flex;
  flex-direction: column;
  max-height: 90vh;
  overflow: hidden;
  border: 1px solid var(--color-neutral-200);
}

.cabecera-modal {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid var(--color-neutral-200);
}

.titulo-modal {
  font-size: var(--tamano-h2);
  font-weight: 600;
  color: var(--color-neutral-900);
}

.boton-cerrar {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: var(--radio-sm);
  color: var(--color-neutral-600);
  transition: all var(--transicion-rapida);
}

.boton-cerrar:hover {
  background-color: var(--color-neutral-200);
  color: var(--color-neutral-900);
}

.cuerpo-modal {
  padding: 20px;
  overflow-y: auto;
  flex: 1;
}

.pie-modal {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 20px;
  border-top: 1px solid var(--color-neutral-200);
  background-color: var(--color-neutral-50);
}

/* Transiciones de apertura y cierre */
.fade-modal-enter-active,
.fade-modal-leave-active {
  transition: opacity var(--transicion-rapida);
}

.fade-modal-enter-active .caja-modal,
.fade-modal-leave-active .caja-modal {
  transition: transform var(--transicion-rapida);
}

.fade-modal-enter-from,
.fade-modal-leave-to {
  opacity: 0;
}

.fade-modal-enter-from .caja-modal,
.fade-modal-leave-to .caja-modal {
  transform: scale(0.96);
}
</style>
