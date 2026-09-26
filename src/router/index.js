import { createRouter, createWebHistory } from 'vue-router'
import LayoutPublico from '../layouts/LayoutPublico.vue'
import LayoutAdmin from '../layouts/LayoutAdmin.vue'

const routes = [
  // Rutas Públicas (para clientes, libres y anónimas)
  {
    path: '/',
    component: LayoutPublico,
    children: [
      {
        path: '',
        name: 'catalogo',
        component: () => import('../views/CatalogoPublico.vue'),
      },
      {
        path: 'producto/:id',
        name: 'producto-detalle',
        component: () => import('../views/FichaProductoView.vue'),
      },
    ],
  },

  // Ruta de Autenticación (Exclusiva para dueña y personal de tienda)
  {
    path: '/login',
    name: 'login',
    component: () => import('../views/LoginView.vue'),
  },

  // Rutas Administrativas (Gestor Interno - Dueña y Vendedoras)
  {
    path: '/admin',
    component: LayoutAdmin,
    meta: { requiereAuth: true },
    children: [
      {
        path: '',
        redirect: '/admin/dashboard',
      },
      {
        path: 'dashboard',
        name: 'admin-dashboard',
        component: () => import('../views/ReservasDashboard.vue'),
      },
      {
        path: 'inventario',
        name: 'admin-inventario',
        component: () => import('../views/InventarioView.vue'),
      },
      {
        path: 'ventas',
        name: 'admin-ventas',
        component: () => import('../views/InventarioView.vue'),
      },
      {
        path: 'clientes',
        name: 'admin-clientes',
        component: () => import('../views/ReservasDashboard.vue'),
      },
      {
        path: 'reportes',
        name: 'admin-reportes',
        component: () => import('../views/ReportesView.vue'),
      },
    ],
  },

  // Redirección de cualquier ruta desconocida al catálogo
  {
    path: '/:pathMatch(.*)*',
    redirect: '/',
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 }
  },
})

export default router
