/**
 * =============================================================================
 * Pinia Store: Productos e Inventario
 * =============================================================================
 * Responsabilidad:
 * - Centralizar la colección de productos y piezas de joyería.
 * - Proveer acciones reactivas para el CRUD de productos con Supabase.
 * - Suministrar filtros de búsqueda, categoría, rango de precio y disponibilidad.
 *
 * Código a implementar:
 * 1. Importar `defineStore` de 'pinia' y `supabase` de '@/supabase/client.js'.
 * 2. State:
 *    - productos: Lista reactiva de todas las piezas (array).
 *    - productoSeleccionado: Pieza activa en visualización o edición (objeto | null).
 *    - categorias: Lista de categorías disponibles (anillos, pulseras, collares, etc.).
 *    - filtroBusqueda: Texto del buscador del catálogo (string).
 *    - categoriaSeleccionada: ID o slug de la categoría activa (string | null).
 *    - loading: Bandera booleana de estado de carga de peticiones asíncronas.
 *    - error: Mensaje de error en caso de fallo en queries.
 * 3. Getters:
 *    - productosFiltrados: Retorna la lista filtrada por término de búsqueda y categoría.
 *    - productosDisponibles: Filtra sólo aquellos con stock > 0 y estado activo.
 *    - totalInventario: Cantidad total de unidades registradas.
 * 4. Actions:
 *    - fetchProductos(): Consulta la tabla 'productos' en Supabase ordenando por fecha o nombre.
 *    - crearProducto(nuevoProducto): Inserta un nuevo registro en Supabase y actualiza el state.
 *    - actualizarProducto(id, datosActualizados): Modifica los atributos de un producto existente.
 *    - eliminarProducto(id): Realiza baja lógica o física según la política de inventario.
 *    - actualizarStock(id, cantidadCambio): Incrementa o decrementa existencias tras una venta/reserva.
 * =============================================================================
 */
