<script setup>
import IconoLucide from '../common/IconoLucide.vue'

defineProps({
  modelValue: {
    type: String,
    default: 'EFECTIVO',
    validator: (v) => ['EFECTIVO', 'QR'].includes(v),
  },
})

defineEmits(['update:modelValue'])
</script>

<template>
  <div class="contenedor-selector-pago">
    <!-- Opción Efectivo -->
    <button
      type="button"
      class="boton-toggle-pago"
      :class="{ activo: modelValue === 'EFECTIVO' }"
      @click="$emit('update:modelValue', 'EFECTIVO')"
    >
      <IconoLucide nombre="Banknote" :tamano="22" />
      <div class="textos-opcion">
        <span class="titulo-opcion">Efectivo</span>
        <span class="subtexto-opcion">Cobro físico en mano</span>
      </div>
    </button>

    <!-- Opción QR / Transferencia -->
    <button
      type="button"
      class="boton-toggle-pago"
      :class="{ activo: modelValue === 'QR' }"
      @click="$emit('update:modelValue', 'QR')"
    >
      <IconoLucide nombre="QrCode" :tamano="22" />
      <div class="textos-opcion">
        <span class="titulo-opcion">Código QR / Transferencia</span>
        <span class="subtexto-opcion">Verificación en comprobante</span>
      </div>
    </button>
  </div>
</template>

<style scoped>
.contenedor-selector-pago {
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;
  width: 100%;
}

@media (min-width: 480px) {
  .contenedor-selector-pago {
    grid-template-columns: 1fr 1fr;
  }
}

.boton-toggle-pago {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  border-radius: var(--radio-md);
  border: 2px solid var(--color-neutral-200);
  background-color: var(--color-blanco);
  color: var(--color-neutral-600);
  cursor: pointer;
  transition: all var(--transicion-rapida);
  text-align: left;
}

.boton-toggle-pago:hover:not(.activo) {
  border-color: #d1d5db;
  background-color: var(--color-neutral-50);
  color: var(--color-neutral-900);
}

.boton-toggle-pago.activo {
  border-color: var(--color-neutral-900);
  background-color: var(--color-neutral-900);
  color: var(--color-blanco);
  box-shadow: var(--sombra-sutil);
}

.textos-opcion {
  display: flex;
  flex-direction: column;
}

.titulo-opcion {
  font-size: 14px;
  font-weight: 700;
  line-height: 1.2;
}

.subtexto-opcion {
  font-size: 11px;
  opacity: 0.8;
  margin-top: 2px;
}
</style>
