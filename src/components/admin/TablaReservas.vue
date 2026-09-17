<!--
  =============================================================================
  Componente: TablaReservas.vue (Panel de Administración)
  =============================================================================
  Responsabilidad:
  - Listar en formato tabular ordenado todas las reservas generadas desde el catálogo público.
  - Mostrar: Código de reserva, fecha/hora, cliente, teléfono, joya solicitada, estado (BadgeEstado)
    y acciones operativas (Cerrar Venta, Cancelar, Contactar por WhatsApp).

  Props / Emits:
  - reservas: Array de objetos de reservas obtenidas de Supabase.
  - loading: Boolean que indica si los datos se están refrescando.
  - emit('cerrarVenta', reserva): Abre ModalCerrarVenta con la reserva seleccionada.
  - emit('cancelarReserva', idReserva): Cambia el estado a 'cancelado' y devuelve el stock.

  Código a implementar:
  1. <script setup>:
     - Recepción de props y emisión de eventos de acción.
     - Formateador de fecha/hora legible local.
     - Helper para generar enlace directo a WhatsApp (https://wa.me/...).
  2. <template>:
     - Tabla HTML limpia y minimalista con encabezados fijos y scroll horizontal responsivo.
     - Filas con BadgeEstado para lectura rápida de estados.
     - Botones de acción contextuales por fila.
  3. <style scoped>:
     - Bordes delgados horizontales, fila alterna sutil y tipografía monospace para códigos.
  =============================================================================
-->

<template>
  <!-- Aquí irá la tabla de reservas con sus columnas y acciones -->
</template>

<script setup>
// Aquí irá la lógica de formateo, acciones por fila y emisión de eventos
</script>

<style scoped>
/* Estilos tabulares minimalistas */
</style>
