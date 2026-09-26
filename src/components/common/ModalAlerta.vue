<script setup>
import { computed } from 'vue'
import IconoLucide from './IconoLucide.vue'
import BotonPrincipal from './BotonPrincipal.vue'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
  tipo: {
    type: String,
    default: 'error',
    validator: (v) => ['error', 'advertencia', 'exito', 'confirmacion'].includes(v),
  },
  titulo: {
    type: String,
    required: true,
  },
  mensaje: {
    type: String,
    required: true,
  },
  detalles: {
    type: String,
    default: '',
  },
  textoBoton: {
    type: String,
    default: 'Entendido',
  },
  textoCancelar: {
    type: String,
    default: 'Cancelar',
  },
  mostrarCancelar: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['cerrar', 'confirmar'])

const configTipo = computed(() => {
  switch (props.tipo) {
    case 'error':
      return {
        icono: 'AlertCircle',
        claseIcono: 'icono-error',
        varianteBoton: 'peligro',
      }
    case 'advertencia':
      return {
        icono: 'AlertTriangle',
        claseIcono: 'icono-advertencia',
        varianteBoton: 'primario',
      }
    case 'exito':
      return {
        icono: 'CheckCircle2',
        claseIcono: 'icono-exito',
        varianteBoton: 'primario',
      }
    case 'confirmacion':
      return {
        icono: 'HelpCircle',
        claseIcono: 'icono-confirmacion',
        varianteBoton: 'primario',
      }
    default:
      return {
        icono: 'AlertCircle',
        claseIcono: 'icono-error',
        varianteBoton: 'peligro',
      }
  }
})
</script>

<template>
  <Teleport to="body">
    <Transition name="fade-alerta">
      <div v-if="visible" class="telon-alerta" @click.self="emit('cerrar')">
        <div class="caja-modal-alerta" role="alertdialog" aria-modal="true">
          <!-- Icono Temático -->
          <div class="contenedor-icono-alerta" :class="configTipo.claseIcono">
            <IconoLucide :nombre="configTipo.icono" :tamano="32" />
          </div>

          <!-- Contenido de Texto -->
          <div class="textos-alerta">
            <h3 class="titulo-alerta">{{ titulo }}</h3>
            <p class="mensaje-alerta">{{ mensaje }}</p>
            <div v-if="detalles" class="caja-detalles">
              <span>{{ detalles }}</span>
            </div>
          </div>

          <!-- Acciones -->
          <div class="acciones-alerta">
            <button
              v-if="mostrarCancelar"
              type="button"
              class="boton-cancelar-alerta"
              @click="emit('cerrar')"
            >
              {{ textoCancelar }}
            </button>
            <BotonPrincipal
              :variante="configTipo.varianteBoton"
              :ancho-completo="!mostrarCancelar"
              @click="mostrarCancelar ? emit('confirmar') : emit('cerrar')"
            >
              {{ textoBoton }}
            </BotonPrincipal>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.telon-alerta {
  position: fixed;
  inset: 0;
  background-color: rgba(35, 22, 23, 0.65);
  backdrop-filter: blur(3px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  z-index: 2000;
}

.caja-modal-alerta {
  width: 100%;
  max-width: 420px;
  background-color: var(--color-blanco);
  border-radius: var(--radio-lg);
  box-shadow: var(--sombra-modal);
  border: 1px solid var(--color-neutral-200);
  padding: 24px 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 16px;
}

.contenedor-icono-alerta {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.icono-error {
  background-color: var(--color-peligro-fondo);
  color: var(--color-peligro);
  border: 1px solid var(--color-peligro-borde);
}

.icono-advertencia {
  background-color: var(--color-alerta-fondo);
  color: var(--color-alerta);
  border: 1px solid var(--color-alerta-borde);
}

.icono-exito {
  background-color: var(--color-exito-fondo);
  color: var(--color-exito);
  border: 1px solid var(--color-exito-borde);
}

.icono-confirmacion {
  background-color: var(--color-primario-fondo);
  color: var(--color-primario);
  border: 1px solid rgba(62, 18, 24, 0.15);
}

.textos-alerta {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.titulo-alerta {
  font-size: 17px;
  font-weight: 700;
  color: var(--color-neutral-900);
  line-height: 1.3;
}

.mensaje-alerta {
  font-size: 13.5px;
  color: var(--color-neutral-600);
  line-height: 1.45;
}

.caja-detalles {
  background-color: var(--color-neutral-50);
  border: 1px dashed var(--color-neutral-200);
  border-radius: var(--radio-sm);
  padding: 8px 12px;
  font-size: 12px;
  color: var(--color-neutral-800);
  font-family: monospace;
  word-break: break-word;
  margin-top: 4px;
}

.acciones-alerta {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  width: 100%;
  margin-top: 6px;
}

.boton-cancelar-alerta {
  padding: 10px 16px;
  border-radius: var(--radio-md);
  border: 1px solid var(--color-neutral-200);
  background-color: var(--color-neutral-50);
  color: var(--color-neutral-800);
  font-size: var(--tamano-cuerpo);
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transicion-rapida);
}

.boton-cancelar-alerta:hover {
  background-color: var(--color-neutral-100);
  border-color: var(--color-neutral-300);
}

/* Transiciones */
.fade-alerta-enter-active,
.fade-alerta-leave-active {
  transition: opacity 180ms ease, transform 180ms ease;
}

.fade-alerta-enter-from,
.fade-alerta-leave-to {
  opacity: 0;
  transform: scale(0.96);
}
</style>
