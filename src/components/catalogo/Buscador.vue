<!--
  =============================================================================
  Componente: Buscador.vue
  =============================================================================
  Responsabilidad:
  - Proveer un campo de entrada de búsqueda con debouncing o reactividad inmediata
    para filtrar productos por nombre, código o descripción en el catálogo.

  Props / Emits:
  - modelValue (o v-model): String con el término actual de búsqueda.
  - emit('update:modelValue', valor): Emite el término actualizado al store o componente padre.

  Código a implementar:
  1. <script setup>:
     - defineProps(['modelValue']) y defineEmits(['update:modelValue']).
     - Manejador de evento `@input` con debounce para optimizar rendimiento.
     - Botón para limpiar búsqueda rápida si el campo contiene texto.
  2. <template>:
     - Campo de búsqueda estilizado con icono de lupa SVG (desde Morphicons / assets).
     - Input de texto con placeholder claro y botón de reset contextual.
  3. <style scoped>:
     - Diseño minimalista, sin bordes toscos, con efecto focus limpio.
  =============================================================================
-->

<template>
  <!-- Aquí irá el input de búsqueda y su contenedor -->
</template>

<script setup>
// Aquí irá la lógica de v-model, emisión de eventos y debounce
</script>

<style scoped>
/* Estilos del buscador minimalista */
</style>
