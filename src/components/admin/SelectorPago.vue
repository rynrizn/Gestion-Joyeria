<script setup>
import IconoLucide from '../common/IconoLucide.vue'

defineProps({
  modelValue: {
    type: String,
    default: 'EFECTIVO',
    validator: (v) => ['EFECTIVO', 'QR', 'HIBRIDO'].includes(v),
  },
})

defineEmits(['update:modelValue'])
</script>

<template>
  <div class="contenedor-selector-pago">
    <!-- Opción 1: Efectivo -->
    <button
      type="button"
      class="boton-toggle-pago"
      :class="{ activo: modelValue === 'EFECTIVO' }"
      @click="$emit('update:modelValue', 'EFECTIVO')"
    >
      <IconoLucide nombre="Banknote" :tamano="20" />
      <div class="textos-opcion">
        <span class="titulo-opcion">Efectivo</span>
        <span class="subtexto-opcion">Pago en mano</span>
      </div>
    </button>

    <!-- Opción 2: QR / Transferencia -->
    <button
      type="button"
      class="boton-toggle-pago"
      :class="{ activo: modelValue === 'QR' }"
      @click="$emit('update:modelValue', 'QR')"
    >
      <IconoLucide nombre="QrCode" :tamano="20" />
      <div class="textos-opcion">
        <span class="titulo-opcion">Código QR</span>
        <span class="subtexto-opcion">Transferencia</span>
      </div>
    </button>

    <!-- Opción 3: Híbrido (Efectivo + QR) -->
    <button
      type="button"
      class="boton-toggle-pago"
      :class="{ activo: modelValue === 'HIBRIDO' }"
      @click="$emit('update:modelValue', 'HIBRIDO')"
    >
      <IconoLucide nombre="Split" :tamano="20" />
      <div class="textos-opcion">
        <span class="titulo-opcion">Híbrido</span>
        <span class="subtexto-opcion">Efectivo + QR</span>
      </div>
    </button>
  </div>
</template>

<style scoped>
.contenedor-selector-pago {
  display: grid;
  grid-template-columns: 1fr;
  gap: 10px;
  width: 100%;
}

@media (min-width: 520px) {
  .contenedor-selector-pago {
    grid-template-columns: repeat(3, 1fr);
  }
}

.boton-toggle-pago {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 14px;
  border-radius: var(--radio-md);
  border: 2px solid var(--color-neutral-200);
  background-color: var(--color-blanco);
  color: var(--color-neutral-600);
  cursor: pointer;
  transition: all var(--transicion-rapida);
  text-align: left;
}

.boton-toggle-pago:hover:not(.activo) {
  border-color: var(--color-neutral-300);
  background-color: var(--color-neutral-50);
  color: var(--color-neutral-900);
}

.boton-toggle-pago.activo {
  border-color: var(--color-primario);
  background-color: var(--color-primario);
  color: var(--color-blanco);
  box-shadow: var(--sombra-sutil);
}

.textos-opcion {
  display: flex;
  flex-direction: column;
}

.titulo-opcion {
  font-size: 13px;
  font-weight: 700;
  line-height: 1.2;
}

.subtexto-opcion {
  font-size: 10px;
  opacity: 0.85;
  margin-top: 2px;
}
</style>
