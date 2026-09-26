<script setup>
import IconoLucide from '../common/IconoLucide.vue'

defineProps({
  modelValue: {
    type: String,
    default: '',
  },
  placeholder: {
    type: String,
    default: 'Buscar por anillo, collar, piercing...',
  },
})

defineEmits(['update:modelValue'])
</script>

<template>
  <div class="contenedor-buscador">
    <span class="icono-lupa">
      <IconoLucide nombre="Search" :tamano="18" />
    </span>

    <input
      type="text"
      :value="modelValue"
      :placeholder="placeholder"
      class="input-buscador"
      @input="$emit('update:modelValue', $event.target.value)"
    />

    <button
      v-if="modelValue"
      type="button"
      class="boton-limpiar"
      aria-label="Limpiar búsqueda"
      @click="$emit('update:modelValue', '')"
    >
      <IconoLucide nombre="X" :tamano="16" />
    </button>
  </div>
</template>

<style scoped>
.contenedor-buscador {
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
  background-color: var(--color-blanco);
  border: 1px solid var(--color-neutral-200);
  border-radius: var(--radio-md);
  box-shadow: var(--sombra-sutil);
  transition: border-color var(--transicion-rapida), box-shadow var(--transicion-rapida);
}

.contenedor-buscador:focus-within {
  border-color: var(--color-neutral-900);
  box-shadow: 0 0 0 1px var(--color-neutral-900);
}

.icono-lupa {
  position: absolute;
  left: 14px;
  display: flex;
  align-items: center;
  color: var(--color-neutral-600);
  pointer-events: none;
}

.input-buscador {
  width: 100%;
  padding: 12px 40px 12px 42px;
  border: none;
  background: transparent;
  color: var(--color-neutral-900);
  font-size: var(--tamano-cuerpo);
  outline: none;
}

.input-buscador::placeholder {
  color: #9CA3AF;
}

.boton-limpiar {
  position: absolute;
  right: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  color: var(--color-neutral-600);
  transition: background-color var(--transicion-rapida), color var(--transicion-rapida);
}

.boton-limpiar:hover {
  background-color: var(--color-neutral-200);
  color: var(--color-neutral-900);
}
</style>
