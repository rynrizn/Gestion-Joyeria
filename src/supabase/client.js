import { createClient } from '@supabase/supabase-js'

/**
 * =============================================================================
 * GUÍA DE CONEXIÓN CON SUPABASE (MOONSTONE JOYERÍA)
 * =============================================================================
 *
 * 1. ¿CÓMO SE LEEN LAS VARIABLES DE ENTORNO?
 *    En proyectos con Vite, cualquier variable que deba ser accesible desde el
 *    navegador DEBE comenzar con el prefijo "VITE_":
 *    - En desarrollo local: Se leen automáticamente del archivo `.env` o `.env.local`:
 *        VITE_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
 *        VITE_SUPABASE_ANON_KEY=eyJhbGciOi...
 *    - En Cloudflare Pages / Vercel (Producción): NO existe un archivo `.env` en el repo.
 *      Las variables se configuran en el panel de Cloudflare Pages:
 *      Workers & Pages > Tu Proyecto > Settings > Environment variables.
 *
 * 2. CLAVE PÚBLICA (ANON / PUBLISHABLE):
 *    Se utiliza EXCLUSIVAMENTE la clave pública anon/publishable en este frontend.
 *    ⚠️ NUNCA expongas la clave "service_role" en el frontend, ya que esa clave
 *    anula todas las políticas de seguridad RLS (Row Level Security).
 *
 * 3. SEGURIDAD Y TRANSACCIONES EN EL BACKEND (POSTGRESQL):
 *    - Seguridad RLS: Las políticas RLS configuradas en Supabase impiden que
 *      un usuario no autenticado inserte ventas, modifique inventarios o
 *      elimine reservas directamente.
 *    - Transacciones Atómicas (BEGIN / COMMIT / ROLLBACK): Operaciones críticas
 *      como registrar una venta o mover existencias entre sedes se ejecutan
 *      mediante funciones SQL RPC con control transaccional íntegro. Si el pago
 *      falla o falta stock, se ejecuta ROLLBACK automático en el motor Postgres.
 * =============================================================================
 */

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    '⚠️ [Supabase] Faltan las variables de entorno VITE_SUPABASE_URL o VITE_SUPABASE_ANON_KEY en el archivo .env.\n' +
    'La aplicación operará en modo demostración local reactivo con Pinia.'
  )
}

// Instancia singleton del cliente de Supabase (inicializado de forma segura)
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-anon-key'
)

/**
 * =============================================================================
 * GUÍA DE CONSULTAS CON LA BASE DE DATOS SQL DE MOONSTONE (RPC Y VISTAS)
 * =============================================================================
 *
 * EJEMPLO A: Consultar el catálogo público (usando la vista SQL vw_catalogo_publico)
 * -----------------------------------------------------------------------------
 * export async function cargarCatalogoReal() {
 *   const { data, error } = await supabase
 *     .from('vw_catalogo_publico')
 *     .select('*')
 *     .order('nombre', { ascending: true })
 *
 *   if (error) throw error
 *   return data // Array de piezas con stock total > 0 e imagen_portada
 * }
 *
 * EJEMPLO B: Consultar existencias multisede (usando la vista vw_inventario)
 * -----------------------------------------------------------------------------
 * export async function cargarInventarioMultisede() {
 *   const { data, error } = await supabase
 *     .from('vw_inventario')
 *     .select('*')
 *     .order('producto', { ascending: true })
 *
 *   if (error) throw error
 *   return data // Array con stock_central, stock_mercadito, stock_total y estado
 * }
 *
 * EJEMPLO C: Ejecutar Funciones Stored Procedure (RPC con BEGIN/COMMIT/ROLLBACK)
 * Para registrar una venta con múltiples productos y actualización atómica de stock:
 *
 * export async function registrarVentaReal({ idCliente, idSede, metodoPago, montoTotal, items, notas }) {
 *   const { data, error } = await supabase.rpc('crear_venta', {
 *     p_id_cliente: idCliente,
 *     p_id_sede: idSede,          // 1 = Central, 2 = Mercadito
 *     p_metodo_pago: metodoPago,  // 'EFECTIVO', 'QR', 'HIBRIDO'
 *     p_monto_total: montoTotal,
 *     p_items: items,             // JSON array: [{ id_producto, cantidad, precio_unitario }]
 *     p_notas: notas
 *   })
 *
 *   if (error) throw error
 *   return data // ID o folio de la venta generada
 * }
 *
 * EJEMPLO D: Traslado de Stock entre Sedes (RPC con validación de stock disponible)
 *
 * export async function trasladarStockReal({ idProducto, idOrigen, idDestino, cantidad, idUsuario, motivo }) {
 *   const { data, error } = await supabase.rpc('mover_stock', {
 *     p_id_producto: idProducto,
 *     p_origen: idOrigen,
 *     p_destino: idDestino,
 *     p_cantidad: cantidad,
 *     p_id_usuario: idUsuario,
 *     p_observacion: motivo
 *   })
 *
 *   if (error) throw error
 *   return data
 * }
 *
 * EJEMPLO E: Suscripción en Tiempo Real (WebSockets de Supabase)
 * Para que el Dashboard de la Dueña o Encargadas reciba nuevas reservas al instante:
 *
 * export function suscribirReservas(callback) {
 *   return supabase
 *     .channel('canal-reservas-moonstone')
 *     .on('postgres_changes', { event: '*', schema: 'public', table: 'reserva' }, (payload) => {
 *       callback(payload)
 *     })
 *     .subscribe()
 * }
 * =============================================================================
 */
