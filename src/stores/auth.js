/**
 * =============================================================================
 * Pinia Store: Auth (Autenticación y Sesión de Usuario)
 * =============================================================================
 * Responsabilidad:
 * - Gestionar el estado de autenticación del usuario administrativo.
 * - Sincronizar sesiones activas mediante el cliente de Supabase Auth.
 * - Exponer getters de verificación de permisos y métodos de login/logout.
 *
 * Código a implementar:
 * 1. Importar `defineStore` de 'pinia' y el cliente `supabase` de '@/supabase/client.js'.
 * 2. State:
 *    - user: ref(null) / null -> Datos del usuario autenticado (id, email, metadata).
 *    - session: ref(null) / null -> Token JWT y tiempo de expiración.
 *    - loading: ref(false) / boolean -> Bandera de carga durante peticiones de auth.
 *    - error: ref(null) / string | null -> Mensaje de error legible en caso de fallos.
 * 3. Getters:
 *    - isAuthenticated: (state) => !!state.user
 *    - userRole: (state) => state.user?.user_metadata?.role || 'user'
 * 4. Actions:
 *    - login(email, password): Autentica con supabase.auth.signInWithPassword().
 *    - logout(): Cierra sesión mediante supabase.auth.signOut() y limpia el estado local.
 *    - checkCurrentSession(): Verifica y restaura la sesión existente con supabase.auth.getSession().
 *    - setupAuthListener(): Escucha cambios de auth con supabase.auth.onAuthStateChange().
 * =============================================================================
 */
