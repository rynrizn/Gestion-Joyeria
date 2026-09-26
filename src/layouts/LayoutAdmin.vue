<script setup>
import { RouterView } from 'vue-router'
</script>

<template>
  <div class="layout-admin">
    <!-- Contenedor del área de trabajo administrativo -->
    <div class="area-trabajo">
      <!-- El contenido de la vista administrativa (Dashboard, Inventario, etc.) -->
      <main class="contenido-admin">
        <RouterView />
      </main>
    </div>
  </div>
</template>

<style scoped>
.layout-admin {
  min-height: 100vh;
  display: flex;
  background-color: var(--color-neutral-50);
}

.area-trabajo {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  width: 100%;
}

.contenido-admin {
  flex: 1;
  padding: 16px;
  width: 100%;
  max-width: 1280px;
  margin-left: auto;
  margin-right: auto;
}

/* En móvil dejamos margen abajo para la barra inferior fija */
@media (max-width: 768px) {
  .contenido-admin {
    padding-bottom: 80px;
  }
}

/* En escritorio dejamos espacio a la izquierda para el sidebar de 240px */
@media (min-width: 769px) {
  .layout-admin {
    padding-left: 240px;
  }
  
  .contenido-admin {
    padding: 24px;
  }
}
</style>
