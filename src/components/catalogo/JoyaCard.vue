<!--
  =============================================================================
  Componente: JoyaCard.vue
  =============================================================================
  Responsabilidad:
  - Tarjeta de presentación individual para cada pieza en la vitrina del catálogo.
  - Mostrar imagen del producto (optimizada vía Cloudinary), nombre, material, precio,
    disponibilidad de stock y botón de acción para reservar.

  Props / Emits:
  - producto: Objeto con { id, nombre, precio, imagen_url, categoria, material, stock, estado }.
  - emit('solicitarReserva', producto): Dispara la apertura del ModalReserva con la pieza seleccionada.

  Código a implementar:
  1. <script setup>:
     - defineProps({ producto: { type: Object, required: true } }).
     - defineEmits(['solicitarReserva']).
     - Formateador de moneda (formato numérico estándar con Intl.NumberFormat).
  2. <template>:
     - Tarjeta con marco minimalista: contenedor de imagen con aspect-ratio fijo.
     - BadgeEstado integrado para mostrar disponibilidad.
     - Información textual: título, detalles del material y precio destacado.
     - Botón de acción 'Reservar Pieza' (deshabilitado si stock === 0).
  3. <style scoped>:
     - Elevación sutil, transiciones limpias y tipografía estructurada.
  =============================================================================
-->

<template>
  <!-- Aquí irá la tarjeta del producto con imagen, precio y acción de reserva -->
</template>

<script setup>
// Aquí irá la recepción del objeto producto, formateo de precio y emisión de evento
</script>

<style scoped>
/* Estilos de la tarjeta con diseño minimalista */
</style>
