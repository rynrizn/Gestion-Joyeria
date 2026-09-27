<script setup>
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { useAuthStore } from '../../stores/auth'
import IconoLucide from './IconoLucide.vue'

const authStore = useAuthStore()

const enlacesMovil = [
  { nombre: 'Inicio', ruta: '/admin/dashboard', icono: 'LayoutDashboard' },
  { nombre: 'Inventario', ruta: '/admin/inventario', icono: 'Package' },
  { nombre: 'Cobrar', ruta: '/admin/ventas', icono: 'Receipt' },
  { nombre: 'Clientes', ruta: '/admin/clientes', icono: 'Users' },
  { nombre: 'Reportes', ruta: '/admin/reportes', icono: 'BarChart3' },
]

const enlacesVisibles = computed(() => {
  return enlacesMovil.filter((item) => {
    if (item.ruta === '/admin/reportes' && !authStore.esAdmin) {
      return false
    }
    return true
  })
})
</script>

<template>
  <nav class="barra-inferior">
    <div class="contenedor-botones">
      <RouterLink
        v-for="item in enlacesVisibles"
        :key="item.ruta"
        :to="item.ruta"
        class="boton-item"
        active-class="boton-activo"
      >
        <IconoLucide :nombre="item.icono" :tamano="20" />
        <span class="etiqueta-item">{{ item.nombre }}</span>
      </RouterLink>
    </div>
  </nav>
</template>

<style scoped>
.barra-inferior {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 60px;
  background-color: var(--color-blanco);
  border-top: 1px solid var(--color-neutral-200);
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.05);
  z-index: 50;
  display: flex;
  align-items: center;
}

@media (min-width: 769px) {
  .barra-inferior {
    display: none;
  }
}

.contenedor-botones {
  display: flex;
  width: 100%;
  height: 100%;
  justify-content: space-around;
  align-items: center;
  padding: 0 4px;
}

.boton-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 3px;
  height: 100%;
  color: var(--color-neutral-600);
  font-size: 10px;
  font-weight: 500;
  text-decoration: none;
  transition: color var(--transicion-rapida);
}

.boton-item:active {
  transform: scale(0.95);
}

.boton-item.boton-activo {
  color: var(--color-primario);
  font-weight: 700;
}

.etiqueta-item {
  line-height: 1;
}
</style>
