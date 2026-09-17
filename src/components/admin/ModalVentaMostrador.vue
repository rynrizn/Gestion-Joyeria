<!--
  =============================================================================
  Componente: ModalVentaMostrador.vue (Punto de Venta / POS)
  =============================================================================
  Responsabilidad:
  - Facilitar el registro inmediato de una venta física directa en la tienda (mostrador),
    sin requerir una reserva previa.
  - Seleccionar productos directamente por código/nombre, ajustar cantidades,
    aplicar descuentos opcionales y registrar el cobro al instante.

  Props / Emits:
  - visible: Boolean.
  - emit('close'): Cierra el diálogo de venta.
  - emit('ventaRealizada', detalleVenta): Emite el comprobante y detalle de la venta física.

  Código a implementar:
  1. <script setup>:
     - Importar `useProductStore`.
     - Carrito temporal de la venta en mostrador (items, subtotal, descuento, total).
     - Función `agregarItem(producto)` y `removerItem(index)`.
     - Función `procesarVentaMostrador()` que inserta la transacción y decrementa existencias.
  2. <template>:
     - Interfaz tipo POS dividida en: selector rápido de piezas y resumen de ticket de venta.
     - Botón final 'Completar Venta en Mostrador'.
  3. <style scoped>:
     - Diseño ergonómico de alta legibilidad para atención presencial rápida.
  =============================================================================
-->

<template>
  <!-- Aquí irá la interfaz del modal de venta en mostrador (POS) -->
</template>

<script setup>
// Aquí irá la lógica de selección rápida de productos y cobro presencial
</script>

<style scoped>
/* Estilos para la ventana de punto de venta rápido */
</style>
