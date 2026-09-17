<!--
  =============================================================================
  Componente: ModalCerrarVenta.vue (Panel de Administración)
  =============================================================================
  Responsabilidad:
  - Ventana modal para finalizar y liquidar una reserva previa o venta en proceso.
  - Seleccionar método de pago (Efectivo, Transferencia / QR, Tarjeta) y registrar
    comprobante o notas de entrega.
  - Actualizar el estado de la reserva a 'Entregada/Pagada' y descontar el stock definitivamente.

  Props / Emits:
  - visible: Boolean.
  - reserva: Object (datos de la reserva a liquidar).
  - emit('close'): Cierra el modal sin cambios.
  - emit('ventaCerrada', resultado): Notifica que la transacción concluyó exitosamente.

  Código a implementar:
  1. <script setup>:
     - Estado reactivo para método de pago, monto recibido, cambio y observaciones.
     - Función `confirmarCierreVenta()` que actualiza la base de datos con Supabase.
  2. <template>:
     - Resumen del cliente y de las piezas involucradas con el importe total.
     - Radio buttons o select para elegir método de pago.
     - Botones de acción rápida para confirmar o cancelar.
  3. <style scoped>:
     - Modal limpio con foco en la claridad de los números y métodos de pago.
  =============================================================================
-->

<template>
  <!-- Aquí irá el modal de liquidación y cierre de venta -->
</template>

<script setup>
// Aquí irá la captura de forma de pago y actualización en Supabase
</script>

<style scoped>
/* Estilos del modal de cierre de venta */
</style>
