<!--
  =============================================================================
  Vista: LoginView.vue (Ruta: '/login')
  =============================================================================
  Responsabilidad:
  - Formulario de autenticación exclusivo para el personal administrativo y operadores.
  - Validar credenciales con Supabase Auth y redirigir al panel de administración.

  Código a implementar:
  1. <script setup>:
     - Importar `useAuthStore` y `useRouter`.
     - Campos reactivos: `email` y `password`.
     - Estado de carga `loading` y mensaje de error `errorMessage`.
     - Función `iniciarSesion()`:
       * Invoca `authStore.login(email, password)`.
       * Si tiene éxito, redirige con `router.push('/admin/inventario')`.
       * Si falla, expone mensaje legible en la interfaz sin recargar la página.
  2. <template>:
     - Layout centrado vertical y horizontalmente con tarjeta minimalista.
     - Logotipo del sistema, título sobrio ('Acceso Administrativo').
     - Campos de correo electrónico y contraseña.
     - Botón de submit con spinner en estado de carga.
     - Enlace para regresar al catálogo público.
  3. <style scoped>:
     - Fondo limpio, tarjeta con sombra tenue y controles refinados.
  =============================================================================
-->

<template>
  <!-- Aquí irá el contenedor centrado de login administrativo -->
</template>

<script setup>
// Aquí irá la captura de credenciales y llamada a authStore.login
</script>

<style scoped>
/* Estilos para el formulario de autenticación */
</style>
