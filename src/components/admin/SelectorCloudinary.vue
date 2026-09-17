<!--
  =============================================================================
  Componente: SelectorCloudinary.vue (Gestor de Imágenes Multimedia)
  =============================================================================
  Responsabilidad:
  - Permitir la subida de fotografías de joyas a Cloudinary mediante el Upload Widget
    o mediante petición directa al endpoint REST de Cloudinary (Unsigned Upload Preset).
  - Previsualizar la imagen cargada y exponer la URL segura (https) al formulario padre.

  Props / Emits:
  - modelValue (o imagenUrl): String con la URL de la imagen actual (para edición).
  - emit('update:modelValue', secureUrl): Retorna la URL generada en Cloudinary.

  Código a implementar:
  1. <script setup>:
     - Leer variables de entorno: `VITE_CLOUDINARY_CLOUD_NAME` y `VITE_CLOUDINARY_UPLOAD_PRESET`.
     - Estado reactivo para progreso de subida (uploading: boolean, error: string | null).
     - Función `subirImagen(event)`: toma el archivo seleccionado, arma un FormData con el preset
       y realiza POST a `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`.
     - Manejador para eliminar o cambiar la imagen actual.
  2. <template>:
     - Zona de soltar (dropzone) o botón elegante de selección de archivo.
     - Vista previa cuadrada minimalista con botón para quitar o reemplazar.
     - Indicador de subida con barra de carga sutil.
  3. <style scoped>:
     - Contenedor con borde discontinuo suave (dashed) en reposo y sólido al arrastrar.
  =============================================================================
-->

<template>
  <!-- Aquí irá el widget/dropzone de carga y previsualización de imagen de Cloudinary -->
</template>

<script setup>
// Aquí irá la lógica de upload hacia la API REST de Cloudinary y emisión de la URL
</script>

<style scoped>
/* Estilos para el dropzone y vista previa de fotografía */
</style>
