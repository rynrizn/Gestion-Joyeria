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
        component: () => import('../views/RegistroVentaView.vue'),
      },
      {
        path: 'clientes',
        name: 'admin-clientes',
        component: () => import('../views/ClientesReservasView.vue'),
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

// Navigation Guard de Seguridad: Protege todas las rutas de /admin/*
router.beforeEach((to, from, next) => {
  const sesionGuardada = localStorage.getItem('moonstone_usuario')
  const estaAutenticado = !!sesionGuardada

  const requiereAuth = to.matched.some((record) => record.meta.requiereAuth)

  if (requiereAuth && !estaAutenticado) {
    // Si intenta acceder a /admin/* sin autenticarse, se redirige inmediatamente al login
    next({ name: 'login', query: { redirect: to.fullPath } })
  } else if (to.name === 'login' && estaAutenticado) {
    // Si ya está autenticado e intenta ir a login, se le envía al dashboard
    next({ name: 'admin-dashboard' })
  } else {
    next()
  }
})

export default router
