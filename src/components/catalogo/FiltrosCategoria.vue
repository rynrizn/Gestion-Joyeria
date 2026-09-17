<!--
  =============================================================================
  Componente: FiltrosCategoria.vue
  =============================================================================
  Responsabilidad:
  - Renderizar botones o pills de selección de categorías (ej. 'Todas', 'Anillos', 'Collares', 'Pulseras', 'Aretes').
  - Permitir al usuario cambiar la categoría activa con un solo click.

  Props / Emits:
  - categorias: Array de strings u objetos { id, nombre, slug }.
  - categoriaActiva: String | Number (identificador de la categoría actualmente seleccionada).
  - emit('seleccionarCategoria', id): Notifica la categoría elegida.

  Código a implementar:
  1. <script setup>:
     - defineProps con lista de categorías y categoría seleccionada.
     - defineEmits para comunicar el cambio al padre o directamente al store de productos.
  2. <template>:
     - Contenedor horizontal scrolleable (para móviles) con botones tipo chip/pill.
     - Clase activa condicional según `categoria.id === categoriaActiva`.
  3. <style scoped>:
     - Diseño minimalista: chips planos con transiciones suaves en hover y active.
  =============================================================================
-->

<template>
  <!-- Aquí irán los botones/pills de selección de categoría -->
</template>

<script setup>
// Aquí irá la recepción de categorías, estado de categoría activa y eventos
</script>

<style scoped>
/* Estilos para los chips y barra de filtros */
</style>
