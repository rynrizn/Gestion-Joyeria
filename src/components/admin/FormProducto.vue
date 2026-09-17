<!--
  =============================================================================
  Componente: FormProducto.vue (Panel de Administración)
  =============================================================================
  Responsabilidad:
  - Formulario reactivo para crear o editar piezas del catálogo/inventario.
  - Campos: código SKU, nombre, categoría, material, precio de costo, precio de venta,
    stock actual, descripción y selección de imagen (integrado con SelectorCloudinary).

  Props / Emits:
  - productoEditar: Object | null (si viene un objeto, modo edición; si null, modo creación).
  - emit('guardar', datosProducto): Emite los datos validados para persistencia en Supabase.
  - emit('cancelar'): Cierra el formulario o restablece la vista.

  Código a implementar:
  1. <script setup>:
     - Importar SelectorCloudinary y stores pertinentes.
     - Estado reactivo del formulario con validaciones básicas de campos obligatorios.
     - Función `handleSubmit()` que valida y dispara el evento `guardar`.
  2. <template>:
     - Formulario con grid responsivo de dos columnas.
     - Campos de texto, selectors para categoría y material, inputs numéricos para precios/stock.
     - Componente SelectorCloudinary para la carga y previsualización de la imagen.
     - Botones de acción: Guardar Producto y Cancelar.
  3. <style scoped>:
     - Controles con bordes limpios, etiquetas en negrita sutil y espacios consistentes.
  =============================================================================
-->

<template>
  <!-- Aquí irá el formulario para creación y edición de productos -->
</template>

<script setup>
// Aquí irá la reactividad del formulario, validación y emisión de guardado
</script>

<style scoped>
/* Estilos del formulario de administración */
</style>
