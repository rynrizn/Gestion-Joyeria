<!--
  =============================================================================
  Vista: ReportesView.vue (Ruta: '/admin/reportes')
  =============================================================================
  Responsabilidad:
  - Presentar métricas operativas clave y estadísticas financieras del negocio.
  - Indicadores: Total de ventas completadas, volumen de ingresos en el período,
    piezas más vendidas, balance de reservas y rotación de inventario por categoría.

  Código a implementar:
  1. <script setup>:
     - Importar `supabase` y stores correspondientes.
     - Estado reactivo para filtros de rango temporal (Hoy, Última semana, Mes actual).
     - Consultas agregadas a las tablas 'ventas' y 'reservas' en Supabase.
     - Computed properties para calcular totales, márgenes y ranking de popularidad.
  2. <template>:
     - Encabezado con selector de período de tiempo.
     - Cuadrícula de KPIs numéricos (Tarjetas de métricas con valor grande y porcentaje de variación).
     - Desglose de ingresos por categoría de joya y por método de pago.
     - Tabla o listado resumido de las últimas transacciones finalizadas.
  3. <style scoped>:
     - Gráficos o barras de progreso en CSS minimalista, tipografía de alta fidelidad.
  =============================================================================
-->

<template>
  <!-- Aquí irá el tablero analítico de métricas y reportes -->
</template>

<script setup>
// Aquí irá la obtención de datos analíticos de ventas y cálculo de KPIs
</script>

<style scoped>
/* Estilos del dashboard de reportes */
</style>
