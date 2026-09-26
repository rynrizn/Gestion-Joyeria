<script setup>
defineProps({
  variante: {
    type: String,
    default: 'primario',
    validator: (v) => ['primario', 'secundario', 'peligro', 'whatsapp', 'fantasma'].includes(v),
  },
  anchoCompleto: {
    type: Boolean,
    default: false,
  },
  deshabilitado: {
    type: Boolean,
    default: false,
  },
  cargando: {
    type: Boolean,
    default: false,
  },
  tipo: {
    type: String,
    default: 'button',
  },
})

defineEmits(['click'])
</script>

<template>
  <button
    :type="tipo"
    class="boton-base"
    :class="[
      `boton-${variante}`,
      { 'ancho-completo': anchoCompleto, 'esta-cargando': cargando }
    ]"
    :disabled="deshabilitado || cargando"
    @click="$emit('click', $event)"
  >
    <!-- Indicador de carga -->
    <span v-if="cargando" class="spinner"></span>

    <!-- Icono a la izquierda -->
    <span v-if="$slots.iconoIzquierda && !cargando" class="slot-icono">
      <slot name="iconoIzquierda" />
    </span>

    <!-- Texto o contenido principal -->
    <span class="texto-boton">
      <slot />
    </span>

    <!-- Icono a la derecha -->
    <span v-if="$slots.iconoDerecha && !cargando" class="slot-icono">
      <slot name="iconoDerecha" />
    </span>
  </button>
</template>

<style scoped>
.boton-base {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px 16px;
  border-radius: var(--radio-md);
  font-size: var(--tamano-cuerpo);
  font-weight: 600;
  line-height: 1.25;
  transition: all var(--transicion-rapida);
  cursor: pointer;
  user-select: none;
  border: 1px solid transparent;
}

.boton-base:active:not(:disabled) {
  transform: scale(0.98);
}

.ancho-completo {
  width: 100%;
}

.boton-base:disabled {
  opacity: 0.55;
  cursor: not-allowed;
  transform: none;
}

/* Variante Primaria: Borgoña Moonstone (#3E1218) */
.boton-primario {
  background-color: var(--color-primario);
  color: var(--color-blanco);
}
.boton-primario:hover:not(:disabled) {
  background-color: var(--color-primario-hover);
}

/* Variante Secundaria: Blanco con borde */
.boton-secundario {
  background-color: var(--color-blanco);
  color: var(--color-neutral-900);
  border-color: var(--color-neutral-200);
}
.boton-secundario:hover:not(:disabled) {
  background-color: var(--color-neutral-50);
  border-color: #d1d5db;
}

/* Variante WhatsApp (#25D366) */
.boton-whatsapp {
  background-color: var(--color-whatsapp);
  color: var(--color-blanco);
}
.boton-whatsapp:hover:not(:disabled) {
  background-color: var(--color-whatsapp-hover);
}

/* Variante Peligro (#DC2626) */
.boton-peligro {
  background-color: var(--color-peligro);
  color: var(--color-blanco);
}
.boton-peligro:hover:not(:disabled) {
  background-color: #b91c1c;
}

/* Variante Fantasma: Sin fondo */
.boton-fantasma {
  background-color: transparent;
  color: var(--color-neutral-600);
}
.boton-fantasma:hover:not(:disabled) {
  background-color: var(--color-neutral-200);
  color: var(--color-neutral-900);
}

.slot-icono {
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

/* Animación del spinner de carga */
.spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: currentColor;
  border-radius: 50%;
  animation: girar 0.6s linear infinite;
}

@keyframes girar {
  to {
    transform: rotate(360deg);
  }
}
</style>
