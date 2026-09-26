<script setup>
defineProps({
  categorias: {
    type: Array,
    required: true,
  },
  categoriaActiva: {
    type: String,
    default: 'Todos',
  },
})

defineEmits(['seleccionar'])
</script>

<template>
  <div class="envoltura-filtros">
    <div class="carrusel-chips">
      <button
        v-for="categoria in categorias"
        :key="categoria"
        type="button"
        class="chip-categoria"
        :class="{ 'chip-activo': categoriaActiva === categoria }"
        @click="$emit('seleccionar', categoria)"
      >
        {{ categoria }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.envoltura-filtros {
  width: 100%;
  overflow: hidden;
}

.carrusel-chips {
  display: flex;
  align-items: center;
  gap: 8px;
  overflow-x: auto;
  padding: 4px 2px 8px;
  scroll-behavior: smooth;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none; /* Firefox */
}

.carrusel-chips::-webkit-scrollbar {
  display: none; /* Chrome, Safari */
}

.chip-categoria {
  flex-shrink: 0;
  padding: 8px 16px;
  border-radius: var(--radio-completo);
  background-color: var(--color-blanco);
  border: 1px solid var(--color-neutral-200);
  color: var(--color-neutral-600);
  font-size: 13px;
  font-weight: 500;
  line-height: 1.2;
  transition: all var(--transicion-rapida);
  cursor: pointer;
  user-select: none;
}

.chip-categoria:hover:not(.chip-activo) {
  background-color: var(--color-neutral-50);
  border-color: #d1d5db;
  color: var(--color-neutral-900);
}

.chip-categoria.chip-activo {
  background-color: var(--color-neutral-900);
  border-color: var(--color-neutral-900);
  color: var(--color-blanco);
  font-weight: 600;
}
</style>
