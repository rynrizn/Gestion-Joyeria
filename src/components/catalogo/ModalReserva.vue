<!--
  =============================================================================
  Componente: ModalReserva.vue
  =============================================================================
  Responsabilidad:
  - Ventana modal superpuesta para que el cliente confirme la reserva de una pieza.
  - Capturar datos de contacto del cliente (nombre, teléfono/WhatsApp, notas o fecha estimada de retiro).
  - Registrar la reserva en la base de datos de Supabase y actualizar el estado visual.

  Props / Emits:
  - visible: Boolean (controla si el modal está abierto o cerrado).
  - producto: Object (pieza de joyería a reservar).
  - emit('close'): Cierra el modal.
  - emit('reservaConfirmada', datosReserva): Notifica el éxito de la operación.

  Código a implementar:
  1. <script setup>:
     - Props y emits para visibilidad y comunicación de resultados.
     - Estado reactivo del formulario: nombreCliente, telefono, notas.
     - Función `confirmarReserva()`: invoca la inserción en Supabase ('reservas') y decrementa stock si aplica.
  2. <template>:
     - Backdrop oscuro semi-transparente con cierre al hacer click exterior.
     - Cuerpo del modal con resumen de la pieza y campos de contacto.
     - Acciones: Cancelar y Confirmar Reserva con estado de carga (loading spinner).
  3. <style scoped>:
     - Animación suave de aparición y modal centrado con esquinas limpias.
  =============================================================================
-->

<template>
  <!-- Aquí irá el modal de confirmación de reserva -->
</template>

<script setup>
// Aquí irá la gestión del formulario de cliente y envío de la reserva a Supabase
</script>

<style scoped>
/* Estilos del backdrop y ventana modal */
</style>
