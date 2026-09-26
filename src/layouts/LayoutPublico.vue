<script setup>
import { RouterView } from 'vue-router'
</script>

<template>
  <div class="layout-publico">
    <!-- El contenido de la vista pública (Navbar, catálogo, etc.) -->
    <main class="contenido-publico">
      <RouterView />
    </main>

    <!-- Pie de página institucional simple -->
    <footer class="footer-publico">
      <div class="contenedor">
        <p class="texto-copyright">Moonstone Joyería &copy; {{ new Date().getFullYear() }} &bull; Catálogo Digital</p>
      </div>
    </footer>
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

.footer-publico {
  border-top: 1px solid var(--color-neutral-200);
  background-color: var(--color-blanco);
  padding: 20px 0;
  margin-top: auto;
}

.texto-copyright {
  font-size: var(--tamano-caption);
  color: var(--color-neutral-600);
  text-align: center;
}
</style>
