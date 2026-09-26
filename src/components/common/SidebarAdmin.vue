<script setup>
import { RouterLink, useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth'
import IconoLucide from './IconoLucide.vue'

const authStore = useAuthStore()
const router = useRouter()

const enlacesNavegacion = [
  { nombre: 'Dashboard', ruta: '/admin/dashboard', icono: 'LayoutDashboard' },
  { nombre: 'Inventario', ruta: '/admin/inventario', icono: 'Package' },
  { nombre: 'Registrar Venta', ruta: '/admin/ventas', icono: 'Receipt' },
  { nombre: 'Clientes y Reservas', ruta: '/admin/clientes', icono: 'Users' },
  { nombre: 'Reportes', ruta: '/admin/reportes', icono: 'BarChart3' },
]

const cerrarSesion = () => {
  authStore.cerrarSesion()
  router.push('/login')
}
</script>

<template>
  <aside class="sidebar-admin">
    <!-- Logotipo y Marca -->
    <div class="cabecera-sidebar">
      <div class="marca">
        <h2 class="titulo-marca">Moonstone</h2>
        <span class="subtitulo-marca">Panel de Gestión</span>
      </div>
    </div>

    <!-- Menú de Enlaces -->
    <nav class="navegacion-sidebar">
      <ul class="lista-enlaces">
        <li v-for="item in enlacesNavegacion" :key="item.ruta">
          <RouterLink :to="item.ruta" class="enlace-nav" active-class="enlace-activo">
            <IconoLucide :nombre="item.icono" :tamano="18" />
            <span class="texto-enlace">{{ item.nombre }}</span>
          </RouterLink>
        </li>
      </ul>
    </nav>

    <!-- Pie del Sidebar: Vendedora y Acciones -->
    <div class="pie-sidebar">
      <!-- Enlace para ver catálogo como cliente -->
      <RouterLink to="/" class="enlace-tienda" target="_blank" title="Abrir catálogo público">
        <IconoLucide nombre="ShoppingBag" :tamano="16" />
        <span>Ver Catálogo Público</span>
      </RouterLink>

      <div class="separador"></div>

      <!-- Usuario y Botón de Salir -->
      <div class="info-usuario">
        <div class="avatar-usuario">
          <IconoLucide nombre="User" :tamano="16" />
        </div>
        <div class="datos-usuario">
          <span class="nombre-usuario">{{ authStore.usuario?.nombre || 'Administradora' }}</span>
          <span class="rol-usuario">{{ authStore.usuario?.rol || 'Turno Tarde' }}</span>
        </div>
        <button
          type="button"
          class="boton-cerrar-sesion"
          title="Cerrar sesión"
          @click="cerrarSesion"
        >
          <IconoLucide nombre="LogOut" :tamano="18" />
        </button>
      </div>
    </div>
  </aside>
</template>

<style scoped>
.sidebar-admin {
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  width: 240px;
  background-color: var(--color-blanco);
  border-right: 1px solid var(--color-neutral-200);
  display: flex;
  flex-direction: column;
  z-index: 50;
}

@media (max-width: 768px) {
  .sidebar-admin {
    display: none;
  }
}

.cabecera-sidebar {
  padding: 20px 20px 16px;
  border-bottom: 1px solid var(--color-neutral-200);
}

.titulo-marca {
  font-size: 18px;
  font-weight: 700;
  color: var(--color-neutral-900);
  line-height: 1.2;
}

.subtitulo-marca {
  font-size: var(--tamano-caption);
  color: var(--color-neutral-600);
  font-weight: 500;
}

.navegacion-sidebar {
  flex: 1;
  padding: 16px 12px;
  overflow-y: auto;
}

.lista-enlaces {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.enlace-nav {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 14px;
  border-radius: var(--radio-md);
  color: var(--color-neutral-600);
  font-weight: 500;
  font-size: var(--tamano-cuerpo);
  transition: all var(--transicion-rapida);
}

.enlace-nav:hover {
  background-color: var(--color-neutral-50);
  color: var(--color-neutral-900);
}

.enlace-nav.enlace-activo {
  background-color: var(--color-neutral-900);
  color: var(--color-blanco);
}

.pie-sidebar {
  padding: 16px;
  border-top: 1px solid var(--color-neutral-200);
  background-color: var(--color-neutral-50);
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.enlace-tienda {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: var(--tamano-caption);
  color: var(--color-neutral-600);
  font-weight: 500;
  padding: 6px 8px;
  border-radius: var(--radio-sm);
  transition: all var(--transicion-rapida);
}

.enlace-tienda:hover {
  background-color: var(--color-neutral-200);
  color: var(--color-neutral-900);
}

.separador {
  height: 1px;
  background-color: var(--color-neutral-200);
}

.info-usuario {
  display: flex;
  align-items: center;
  gap: 10px;
}

.avatar-usuario {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: var(--color-neutral-200);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-neutral-900);
  flex-shrink: 0;
}

.datos-usuario {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.nombre-usuario {
  font-size: 13px;
  font-weight: 600;
  color: var(--color-neutral-900);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.rol-usuario {
  font-size: 11px;
  color: var(--color-neutral-600);
}

.boton-cerrar-sesion {
  color: var(--color-neutral-600);
  padding: 6px;
  border-radius: var(--radio-sm);
  transition: all var(--transicion-rapida);
}

.boton-cerrar-sesion:hover {
  color: var(--color-peligro);
  background-color: var(--color-peligro-fondo);
}
</style>
