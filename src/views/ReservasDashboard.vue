<!--
  =============================================================================
  Vista: ReservasDashboard.vue (Ruta: '/admin/reservas')
  =============================================================================
  Responsabilidad:
  - Tablero de gestión y seguimiento en tiempo real de todas las solicitudes de reserva.
  - Integrar `TablaReservas` y `ModalCerrarVenta`.
  - Permitir a los encargados cambiar estados de reserva, contactar al cliente por WhatsApp
    y proceder a la entrega/cobro de las joyas apartadas.

  Código a implementar:
  1. <script setup>:
     - Importar `TablaReservas`, `ModalCerrarVenta`, `BadgeEstado`, `NavbarApp`.
     - Suscripción en tiempo real a Supabase (`supabase.channel('reservas-channel')`)
       para recibir notificaciones instantáneas de nuevas reservas entrantes.
     - Estados para filtros (Todas, Pendientes de Retiro, Entregadas, Canceladas).
     - Manejadores para abrir ModalCerrarVenta o registrar cancelaciones con reingreso al stock.
  2. <template>:
     - Header con contador en vivo de reservas pendientes.
     - Filtros rápidos por estado de reserva.
     - Componente TablaReservas con listado completo.
     - Componente ModalCerrarVenta condicional para liquidar la reserva.
  3. <style scoped>:
     - Layout enfocado en productividad y respuesta ágil de atención a clientes.
  =============================================================================
-->

<template>
  <!-- Aquí irá el tablero de control de reservas en tiempo real -->
</template>

<script setup>
// Aquí irá la suscripción en tiempo real a reservas y orquestación de estados
</script>

<style scoped>
/* Estilos del dashboard de reservas */
</style>
