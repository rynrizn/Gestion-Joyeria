<!--
  =============================================================================
  Componente: NavbarApp.vue
  =============================================================================
  Responsabilidad:
  - Barra superior de navegación universal con estética limpia y minimalista.
  - Mostrar logotipo/identificador del sistema, enlaces principales de navegación
    (Catálogo, Inventario, Reservas, Reportes) y estado de sesión.
  - Alternar enlaces visibles según el rol y autenticación del usuario.

  Código a implementar:
  1. <script setup>:
     - Importar `useAuthStore` para leer el estado del usuario autenticado y rol.
     - Función `handleLogout` para cerrar sesión de forma segura y redirigir.
     - Estado reactivo para el menú desplegable en resoluciones móviles.
  2. <template>:
     - Logotipo / Marca sobria en la parte izquierda.
     - Navegación central con <RouterLink>.
     - Sección derecha: Botón de Login (si es anónimo) o Perfil y Logout (si está autenticado).
  3. <style scoped>:
     - Barra fija o pegajosa (sticky/fixed), fondo con backdrop-filter o color plano sutil.
  =============================================================================
-->

<template>
  <!-- Aquí irá el markup de la barra de navegación superior -->
</template>

<script setup>
// Aquí irá la importación de useAuthStore, useRouter y manejadores de navegación
</script>

<style scoped>
/* Estilos de la barra de navegación minimalista */
</style>
