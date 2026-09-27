-- ============================================================
-- MOONSTONE JOYERÍA - SCRIPT COMPLETO DE CONFIGURACIÓN SUPABASE
-- Compatible con Moonstone_BD-final.txt
-- ============================================================
-- Este script realiza 6 tareas fundamentales:
-- 1. Agrega campos faltantes en cliente (ci, telefono).
-- 2. Inserta los datos base de roles, sedes, categorías y usuaria admin (Belen).
-- 3. Crea las vistas optimizadas para el Catálogo Web, Inventario, Clientes y Ventas.
-- 4. Crea las funciones transaccionales (RPC) para crear productos, ventas y traslados.
-- 5. Habilita las políticas de seguridad RLS para acceso con la clave anon.
-- 6. Otorga todos los permisos necesarios a los roles anon y authenticated.
-- ============================================================

-- 1. EXTENSIÓN DE TABLAS
ALTER TABLE cliente
ADD COLUMN IF NOT EXISTS ci VARCHAR(30),
ADD COLUMN IF NOT EXISTS telefono VARCHAR(30);

UPDATE cliente SET telefono = contacto_telefono WHERE telefono IS NULL;


-- 2. DATOS BASE ESENCIALES (Evita errores de clave foránea)

-- Roles
INSERT INTO rol (id_rol, nombre, descripcion)
OVERRIDING SYSTEM VALUE
VALUES 
    (1, 'ADMINISTRADORA', 'Propietaria y administradora general del sistema'),
    (2, 'PERSONAL_TIENDA', 'Personal encargado de ventas y consultas de inventario')
ON CONFLICT (nombre) DO NOTHING;

-- Ubicaciones (1 = Central, 2 = Mercadito Creativo)
INSERT INTO ubicacion (id_ubicacion, nombre, descripcion, activo)
OVERRIDING SYSTEM VALUE
VALUES 
    (1, 'CENTRAL', 'Stock administrado directamente por la propietaria', TRUE),
    (2, 'MERCADITO_CREATIVO', 'Stock disponible en el punto físico Mercadito Creativo', TRUE)
ON CONFLICT (nombre) DO NOTHING;

-- Categorías Iniciales
INSERT INTO categoria (nombre, activo)
VALUES 
    ('AROS MINI', TRUE),
    ('CINTURONES', TRUE),
    ('GAFAS', TRUE),
    ('PIERCINGS', TRUE),
    ('BRAZALETES', TRUE),
    ('EARCUFFS', TRUE),
    ('ANILLOS', TRUE),
    ('COLLARES', TRUE)
ON CONFLICT (nombre) DO NOTHING;

-- Usuaria Administradora Principal (Belen, id_usuario = 1)
INSERT INTO usuario (id_usuario, nombre, nombre_usuario, password_hash, activo, id_rol)
OVERRIDING SYSTEM VALUE
VALUES 
    (1, 'Belen', 'admin', 'pbkdf2_sha256$placeholder_hash', TRUE, 1)
ON CONFLICT (nombre_usuario) DO NOTHING;


-- 3. VISTAS ADAPTADAS AL FRONTEND

-- 3.1 Catálogo Público
CREATE OR REPLACE VIEW public.vw_catalogo_publico AS
SELECT 
    p.id_producto,
    p.nombre,
    c.nombre AS categoria,
    p.material,
    p.color,
    p.talla,
    p.precio_venta AS precio,
    p.precio_venta,
    p.stock_minimo,
    p.es_prioritario,
    p.activo,
    COALESCE(
        (SELECT img.url_imagen FROM public.imagen img WHERE img.id_producto = p.id_producto AND img.es_portada = TRUE LIMIT 1),
        (SELECT img.url_imagen FROM public.imagen img WHERE img.id_producto = p.id_producto LIMIT 1),
        ''
    ) AS imagen,
    COALESCE(
        (SELECT img.url_imagen FROM public.imagen img WHERE img.id_producto = p.id_producto AND img.es_portada = FALSE LIMIT 1),
        ''
    ) AS imagen_detalle,
    COALESCE(SUM(inv.cantidad), 0)::INT AS stock_total,
    COALESCE(SUM(inv.cantidad - inv.cantidad_reservada), 0)::INT AS stock_disponible,
    COALESCE(SUM(CASE WHEN inv.id_ubicacion = 1 THEN inv.cantidad ELSE 0 END), 0)::INT AS stock_central,
    COALESCE(SUM(CASE WHEN inv.id_ubicacion = 2 THEN inv.cantidad ELSE 0 END), 0)::INT AS stock_tienda
FROM public.producto p
LEFT JOIN public.categoria c ON p.id_categoria = c.id_categoria
LEFT JOIN public.inventario inv ON p.id_producto = inv.id_producto
WHERE p.activo = TRUE
GROUP BY p.id_producto, p.nombre, c.nombre, p.material, p.color, p.talla, p.precio_venta, p.stock_minimo, p.es_prioritario, p.activo;


-- 3.2 Inventario Administrativo Multisede
CREATE OR REPLACE VIEW public.vw_inventario AS
SELECT 
    p.id_producto,
    p.nombre,
    c.nombre AS categoria,
    p.material,
    p.color,
    p.talla,
    p.precio_venta AS precio,
    p.precio_venta,
    p.stock_minimo,
    p.es_prioritario,
    p.activo,
    COALESCE(
        (SELECT img.url_imagen FROM public.imagen img WHERE img.id_producto = p.id_producto AND img.es_portada = TRUE LIMIT 1),
        (SELECT img.url_imagen FROM public.imagen img WHERE img.id_producto = p.id_producto LIMIT 1),
        ''
    ) AS imagen,
    COALESCE(
        (SELECT img.url_imagen FROM public.imagen img WHERE img.id_producto = p.id_producto AND img.es_portada = FALSE LIMIT 1),
        ''
    ) AS imagen_detalle,
    COALESCE(SUM(inv.cantidad), 0)::INT AS stock_total,
    COALESCE(SUM(CASE WHEN inv.id_ubicacion = 1 THEN inv.cantidad ELSE 0 END), 0)::INT AS stock_central,
    COALESCE(SUM(CASE WHEN inv.id_ubicacion = 2 THEN inv.cantidad ELSE 0 END), 0)::INT AS stock_tienda,
    COALESCE(SUM(inv.cantidad_reservada), 0)::INT AS cantidad_reservada,
    COALESCE(SUM(inv.cantidad - inv.cantidad_reservada), 0)::INT AS stock_disponible
FROM public.producto p
LEFT JOIN public.categoria c ON p.id_categoria = c.id_categoria
LEFT JOIN public.inventario inv ON p.id_producto = inv.id_producto
GROUP BY p.id_producto, p.nombre, c.nombre, p.material, p.color, p.talla, p.precio_venta, p.stock_minimo, p.es_prioritario, p.activo;


-- 3.3 Historial de Clientas
CREATE OR REPLACE VIEW public.vw_historial_cliente AS
SELECT 
    c.id_cliente,
    c.nombre,
    COALESCE(c.telefono, c.contacto_telefono, '') AS telefono,
    COALESCE(c.contacto_telefono, c.telefono, '') AS contacto_telefono,
    COALESCE(c.ci, '') AS ci,
    c.tipo_cliente,
    c.cantidad_compras,
    (SELECT MAX(v.fecha_hora) FROM public.venta v WHERE v.id_cliente = c.id_cliente) AS ultima_compra,
    COALESCE((SELECT SUM(v.monto_total) FROM public.venta v WHERE v.id_cliente = c.id_cliente), 0) AS total_gastado
FROM public.cliente c;


-- 3.4 Reporte de Ventas
CREATE OR REPLACE VIEW public.vw_reporte_ventas AS
SELECT 
    v.id_venta,
    v.fecha_hora,
    COALESCE(u.nombre, 'Vendedora') AS vendedora,
    u.id_usuario,
    COALESCE(r.nombre, 'PERSONAL_TIENDA') AS rol,
    COALESCE(c.nombre, 'Cliente Casual') AS cliente,
    v.subtotal,
    v.descuento,
    v.monto_total AS total,
    v.monto_total,
    v.tipo_venta,
    COALESCE(p.metodo_pago, 'EFECTIVO') AS metodo_pago,
    COALESCE(p.monto_efectivo, CASE WHEN p.metodo_pago = 'EFECTIVO' THEN p.monto ELSE 0 END) AS monto_efectivo,
    COALESCE(p.monto_transferencia, CASE WHEN p.metodo_pago IN ('QR', 'TRANSFERENCIA') THEN p.monto ELSE 0 END) AS monto_qr,
    v.observacion,
    (
        SELECT COALESCE(json_agg(json_build_object(
            'id', dv.id_producto,
            'nombre', prod.nombre,
            'cantidad', dv.cantidad,
            'precio', dv.precio_unitario,
            'subtotal', dv.subtotal,
            'id_ubicacion', dv.id_ubicacion
        )), '[]'::json)
        FROM public.detalle_venta dv
        JOIN public.producto prod ON prod.id_producto = dv.id_producto
        WHERE dv.id_venta = v.id_venta
    ) AS items,
    (SELECT COUNT(*)::INT FROM public.detalle_venta dv WHERE dv.id_venta = v.id_venta) AS cantidad_total,
    (
        SELECT string_agg(prod.nombre || ' (x' || dv.cantidad || ')', ', ')
        FROM public.detalle_venta dv
        JOIN public.producto prod ON prod.id_producto = dv.id_producto
        WHERE dv.id_venta = v.id_venta
    ) AS descripcion_items
FROM public.venta v
LEFT JOIN public.usuario u ON u.id_usuario = v.id_usuario
LEFT JOIN public.rol r ON r.id_rol = u.id_rol
LEFT JOIN public.cliente c ON c.id_cliente = v.id_cliente
LEFT JOIN public.pago p ON p.id_venta = v.id_venta;


-- 4. PROCEDIMIENTOS ALMACENADOS (RPC) TRANSACCIONALES

-- 4.1 Alta Completa de Producto desde la Web
CREATE OR REPLACE FUNCTION public.crear_producto_completo(
    p_nombre VARCHAR,
    p_categoria VARCHAR,
    p_material VARCHAR DEFAULT 'Acero 316L',
    p_color VARCHAR DEFAULT 'Plateado',
    p_talla VARCHAR DEFAULT 'Estándar',
    p_precio NUMERIC DEFAULT 0,
    p_stock_central INT DEFAULT 0,
    p_stock_tienda INT DEFAULT 0,
    p_stock_minimo INT DEFAULT 1,
    p_es_prioritario BOOLEAN DEFAULT FALSE,
    p_activo BOOLEAN DEFAULT TRUE,
    p_imagen TEXT DEFAULT '',
    p_imagen_detalle TEXT DEFAULT ''
)
RETURNS INT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_id_categoria INT;
    v_id_producto INT;
BEGIN
    SELECT id_categoria INTO v_id_categoria FROM public.categoria WHERE UPPER(nombre) = UPPER(TRIM(p_categoria));
    IF v_id_categoria IS NULL THEN
        INSERT INTO public.categoria (nombre, activo) 
        VALUES (UPPER(TRIM(p_categoria)), TRUE)
        RETURNING id_categoria INTO v_id_categoria;
    END IF;

    INSERT INTO public.producto (
        nombre, material, color, talla, precio_venta, activo, es_prioritario, stock_minimo, id_categoria
    )
    VALUES (
        TRIM(p_nombre), TRIM(p_material), TRIM(p_color), TRIM(p_talla), p_precio, p_activo, p_es_prioritario, p_stock_minimo, v_id_categoria
    )
    RETURNING id_producto INTO v_id_producto;

    IF p_stock_central > 0 THEN
        UPDATE public.inventario 
        SET cantidad = p_stock_central 
        WHERE id_producto = v_id_producto AND id_ubicacion = 1;
    END IF;

    IF p_stock_tienda > 0 THEN
        UPDATE public.inventario 
        SET cantidad = p_stock_tienda 
        WHERE id_producto = v_id_producto AND id_ubicacion = 2;
    END IF;

    IF p_imagen IS NOT NULL AND TRIM(p_imagen) <> '' THEN
        INSERT INTO public.imagen (url_imagen, es_portada, id_producto)
        VALUES (TRIM(p_imagen), TRUE, v_id_producto);
    END IF;

    IF p_imagen_detalle IS NOT NULL AND TRIM(p_imagen_detalle) <> '' THEN
        INSERT INTO public.imagen (url_imagen, es_portada, id_producto)
        VALUES (TRIM(p_imagen_detalle), FALSE, v_id_producto);
    END IF;

    RETURN v_id_producto;
END;
$$;


-- 4.2 Edición Completa de Producto
CREATE OR REPLACE FUNCTION public.actualizar_producto_completo(
    p_id_producto INT,
    p_nombre VARCHAR,
    p_categoria VARCHAR,
    p_material VARCHAR,
    p_color VARCHAR,
    p_talla VARCHAR,
    p_precio NUMERIC,
    p_stock_central INT,
    p_stock_tienda INT,
    p_stock_minimo INT,
    p_es_prioritario BOOLEAN,
    p_activo BOOLEAN,
    p_imagen TEXT DEFAULT NULL,
    p_imagen_detalle TEXT DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_id_categoria INT;
BEGIN
    SELECT id_categoria INTO v_id_categoria FROM public.categoria WHERE UPPER(nombre) = UPPER(TRIM(p_categoria));
    IF v_id_categoria IS NULL THEN
        INSERT INTO public.categoria (nombre, activo) 
        VALUES (UPPER(TRIM(p_categoria)), TRUE)
        RETURNING id_categoria INTO v_id_categoria;
    END IF;

    UPDATE public.producto
    SET 
        nombre = TRIM(p_nombre),
        material = TRIM(p_material),
        color = TRIM(p_color),
        talla = TRIM(p_talla),
        precio_venta = p_precio,
        stock_minimo = p_stock_minimo,
        es_prioritario = p_es_prioritario,
        activo = p_activo,
        id_categoria = v_id_categoria
    WHERE id_producto = p_id_producto;

    IF p_stock_central IS NOT NULL THEN
        UPDATE public.inventario 
        SET cantidad = p_stock_central 
        WHERE id_producto = p_id_producto AND id_ubicacion = 1;
    END IF;

    IF p_stock_tienda IS NOT NULL THEN
        UPDATE public.inventario 
        SET cantidad = p_stock_tienda 
        WHERE id_producto = p_id_producto AND id_ubicacion = 2;
    END IF;

    IF p_imagen IS NOT NULL AND TRIM(p_imagen) <> '' THEN
        DELETE FROM public.imagen WHERE id_producto = p_id_producto AND es_portada = TRUE;
        INSERT INTO public.imagen (url_imagen, es_portada, id_producto)
        VALUES (TRIM(p_imagen), TRUE, p_id_producto);
    END IF;

    IF p_imagen_detalle IS NOT NULL AND TRIM(p_imagen_detalle) <> '' THEN
        DELETE FROM public.imagen WHERE id_producto = p_id_producto AND es_portada = FALSE;
        INSERT INTO public.imagen (url_imagen, es_portada, id_producto)
        VALUES (TRIM(p_imagen_detalle), FALSE, p_id_producto);
    END IF;
END;
$$;


-- 4.3 Registrar Venta con Descuento de Stock y Pago
CREATE OR REPLACE FUNCTION public.crear_venta_completa(
    p_cliente VARCHAR,
    p_metodo_pago VARCHAR,
    p_monto_total NUMERIC,
    p_monto_efectivo NUMERIC DEFAULT 0,
    p_monto_qr NUMERIC DEFAULT 0,
    p_descuento NUMERIC DEFAULT 0,
    p_items JSONB DEFAULT '[]'::jsonb,
    p_observacion TEXT DEFAULT NULL,
    p_id_usuario INT DEFAULT 1
)
RETURNS INT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_id_cliente INT;
    v_id_venta INT;
    v_item RECORD;
    v_ubicacion_id INT;
    v_cant INT;
    v_precio NUMERIC;
    v_subtotal NUMERIC;
    v_metodo_valido VARCHAR(30);
BEGIN
    IF p_cliente IS NOT NULL AND TRIM(p_cliente) <> '' AND UPPER(TRIM(p_cliente)) <> 'CLIENTE CASUAL' THEN
        SELECT id_cliente INTO v_id_cliente FROM public.cliente WHERE UPPER(nombre) = UPPER(TRIM(p_cliente)) LIMIT 1;
        IF v_id_cliente IS NULL THEN
            INSERT INTO public.cliente (nombre, tipo_cliente) VALUES (TRIM(p_cliente), 'NUEVA') RETURNING id_cliente INTO v_id_cliente;
        END IF;
    END IF;

    IF UPPER(p_metodo_pago) = 'QR' THEN
        v_metodo_valido := 'TRANSFERENCIA';
    ELSE
        v_metodo_valido := UPPER(p_metodo_pago);
    END IF;

    INSERT INTO public.venta (
        subtotal, descuento, monto_total, tipo_venta, observacion, id_cliente, id_usuario
    )
    VALUES (
        p_monto_total + p_descuento, p_descuento, p_monto_total, 'DIRECTA', p_observacion, v_id_cliente, p_id_usuario
    )
    RETURNING id_venta INTO v_id_venta;

    FOR v_item IN SELECT * FROM jsonb_to_recordset(p_items) AS x(id INT, cantidad INT, precio NUMERIC, origen_stock TEXT, origenStock TEXT)
    LOOP
        v_cant := COALESCE(v_item.cantidad, 1);
        v_precio := COALESCE(v_item.precio, 0);
        v_subtotal := v_cant * v_precio;

        IF COALESCE(v_item.origenStock, v_item.origen_stock) = 'central' THEN
            v_ubicacion_id := 1;
        ELSE
            v_ubicacion_id := 2;
        END IF;

        INSERT INTO public.detalle_venta (
            cantidad, precio_unitario, subtotal, id_venta, id_producto, id_ubicacion
        )
        VALUES (
            v_cant, v_precio, v_subtotal, v_id_venta, v_item.id, v_ubicacion_id
        );

        UPDATE public.inventario
        SET cantidad = GREATEST(0, cantidad - v_cant)
        WHERE id_producto = v_item.id AND id_ubicacion = v_ubicacion_id;
    END LOOP;

    INSERT INTO public.pago (
        monto, metodo_pago, tipo_pago, estado_pago, saldo_pendiente, id_venta, monto_efectivo, monto_transferencia
    )
    VALUES (
        p_monto_total,
        v_metodo_valido,
        'COMPLETO',
        'PAGADO',
        0,
        v_id_venta,
        CASE WHEN v_metodo_valido = 'EFECTIVO' THEN p_monto_total WHEN v_metodo_valido = 'HIBRIDO' THEN p_monto_efectivo ELSE 0 END,
        CASE WHEN v_metodo_valido = 'TRANSFERENCIA' THEN p_monto_total WHEN v_metodo_valido = 'HIBRIDO' THEN p_monto_qr ELSE 0 END
    );

    RETURN v_id_venta;
END;
$$;


-- 5. POLÍTICAS RLS (Permitir lectura y escritura a la aplicación con anon)
DO $$ 
DECLARE 
    t text;
    tablas text[] := ARRAY[
        'rol', 'usuario', 'cliente', 'categoria', 'ubicacion', 
        'producto', 'imagen', 'inventario', 'reserva', 'detalle_reserva', 
        'venta', 'detalle_venta', 'pago', 'movimiento_inventario'
    ];
BEGIN
    FOREACH t IN ARRAY tablas LOOP
        EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY;', t);
        EXECUTE format('DROP POLICY IF EXISTS "acceso_total_%s" ON public.%I;', t, t);
        EXECUTE format('CREATE POLICY "acceso_total_%s" ON public.%I FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);', t, t);
    END LOOP;
END $$;


-- 6. PERMISOS EXPLÍCITOS PARA ROLES ANON Y AUTHENTICATED
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO anon, authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon, authenticated;
