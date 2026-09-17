/**
 * =============================================================================
 * Supabase Client Initialization
 * =============================================================================
 * Responsabilidad:
 * - Crear y exportar la instancia singleton del cliente de Supabase usando
 *   las variables de entorno `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY`.
 * - Proveer el punto de acceso centralizado para operaciones de autenticación,
 *   consultas a PostgreSQL y suscripciones en tiempo real.
 *
 * Código a implementar:
 * 1. Importar `createClient` desde '@supabase/supabase-js'.
 * 2. Leer las credenciales de entorno:
 *    - const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
 *    - const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
 * 3. Validar la existencia de ambas variables (lanzar advertencia o error descriptivo en desarrollo).
 * 4. Instanciar y exportar:
 *    export const supabase = createClient(supabaseUrl, supabaseAnonKey);
 * =============================================================================
 */
