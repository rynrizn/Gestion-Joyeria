<!--
  =============================================================================
  Componente: BadgeEstado.vue
  =============================================================================
  Responsabilidad:
  - Mostrar una etiqueta visual compacta y minimalista que indique el estado
    de un producto o de una reserva (ej. 'Disponible', 'Agotado', 'Reservado', 'Entregado').
  - Aplicar variantes de color sutiles según el valor proporcionado.

  Props esperadas:
  - estado: String (Valores: 'disponible', 'reservado', 'agotado', 'entregado', 'cancelado').
  - texto: String (Texto personalizado opcional para la etiqueta).

  Código a implementar:
  1. <script setup>:
     - defineProps con validación de tipos y valores permitidos.
     - Computed property para determinar la clase CSS según el estado.
  2. <template>:
     - Elemento <span> con clases dinámicas y estilo sobrio/minimalista.
  3. <style scoped>:
     - Estilos con bordes redondeados sutiles, fuentes pequeñas y contraste balanceado.
  =============================================================================
-->

<template>
  <!-- Aquí irá el markup del badge con clases dinámicas según props.estado -->
</template>

<script setup>
// Aquí irá la lógica reactiva, props (estado, texto) y computed classes
</script>

<style scoped>
/* Aquí irán las variantes visuales (disponible, reservado, agotado) */
</style>
