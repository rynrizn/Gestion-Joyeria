<script setup>
import { RouterView } from 'vue-router'
import FooterCatalogo from '../components/common/FooterCatalogo.vue'
</script>

<template>
  <div class="layout-publico">
    <!-- El contenido de la vista pública (Navbar, catálogo, etc.) -->
    <main class="contenido-publico">
      <RouterView />
    </main>

    <!-- Pie de página con ubicación física, Google Maps y WhatsApp -->
    <FooterCatalogo />
  </div>
</template>

<style scoped>
.layout-publico {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: var(--color-neutral-50);
}

.contenido-publico {
  flex: 1;
  display: flex;
  flex-direction: column;
}
</style>
