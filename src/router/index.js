/**
 * =============================================================================
 * Vue Router: Configuración de Rutas y Guards de Navegación
 * =============================================================================
 * Responsabilidad:
 * - Definir la jerarquía de rutas para las vistas públicas y el panel administrativo.
 * - Proteger rutas que requieren autenticación mediante meta tags (`requiresAuth: true`).
 * - Integrar guardias de navegación global (`router.beforeEach`) con el store de autenticación.
 *
 * Rutas a mapear:
 * 1. Públicas:
 *    - `/`: CatalogoPublico.vue (Catálogo principal de exhibición y reserva para clientes).
 *    - `/login`: LoginView.vue (Acceso para administradores y encargados de tienda).
 * 2. Administrativas / Protegidas:
 *    - `/admin/inventario`: InventarioView.vue (Gestión integral de stock y piezas).
 *    - `/admin/reservas`: ReservasDashboard.vue (Control de solicitudes de reserva de clientes).
 *    - `/admin/reportes`: ReportesView.vue (Métricas, balances de ventas y rotación).
 *
 * Código a implementar:
 * 1. Importar `createRouter` y `createWebHistory` de 'vue-router'.
 * 2. Importar vistas correspondientes mediante carga perezosa (lazy loading / dynamic import).
 * 3. Instanciar router y registrar el hook `beforeEach` para verificar token de sesión en Supabase/Pinia.
 * 4. Exportar default router.
 * =============================================================================
 */
