import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase, isSupabaseConfigured } from '../supabase/client'

const CLAVE_RESERVAS = 'moonstone_reservas'

const RESERVAS_DEFECTO = [
  {
    id: 1,
    cliente: 'María López',
    telefono: '71234567',
    tipoCliente: 'HABITUAL',
    producto: 'Aros Mini Serpiente Regulable',
    idProducto: 1,
    items: [
      { id: 1, nombre: 'Aros Mini Serpiente Regulable', cantidad: 1, precio: 45 },
    ],
    cantidad: 1,
    montoTotal: 45,
    vencimiento: 'Quedan 3h',
    fechaLimiteMs: Date.now() + 3 * 3600 * 1000,
    estado: 'PENDIENTE',
    esUrgente: true,
    origen: 'WHATSAPP',
    fecha: '2026-09-26 10:15',
  },
  {
    id: 2,
    cliente: 'Ana García',
    telefono: '72345678',
    tipoCliente: 'NUEVA',
    producto: 'Earcuff Luna Moonstone (x1), Aros Mini Doble Brillo (x1)',
    idProducto: 2,
    items: [
      { id: 2, nombre: 'Earcuff Luna Moonstone', cantidad: 1, precio: 85 },
      { id: 3, nombre: 'Aros Mini Doble Brillo', cantidad: 1, precio: 35 },
    ],
    cantidad: 2,
    montoTotal: 120,
    vencimiento: 'Quedan 12h',
    fechaLimiteMs: Date.now() + 12 * 3600 * 1000,
    estado: 'PENDIENTE',
    esUrgente: false,
    origen: 'WHATSAPP',
    fecha: '2026-09-26 08:30',
  },
  {
    id: 3,
    cliente: 'Laura Ríos',
    telefono: '73456789',
    tipoCliente: 'HABITUAL',
    producto: 'Brazalete Eslabón Trenza',
    idProducto: 5,
    items: [
      { id: 5, nombre: 'Brazalete Eslabón Trenza', cantidad: 1, precio: 60 },
    ],
    cantidad: 1,
    montoTotal: 60,
    vencimiento: 'Quedan 24h',
    fechaLimiteMs: Date.now() + 24 * 3600 * 1000,
    estado: 'PENDIENTE',
    esUrgente: false,
    origen: 'TIENDA',
    fecha: '2026-09-25 18:00',
  },
  {
    id: 4,
    cliente: 'Camila Suárez',
    telefono: '75678901',
    tipoCliente: 'HABITUAL',
    producto: 'Aros Mini Doble Brillo (x1), Brazalete Eslabón Trenza (x1)',
    idProducto: 3,
    items: [
      { id: 3, nombre: 'Aros Mini Doble Brillo', cantidad: 1, precio: 35 },
      { id: 5, nombre: 'Brazalete Eslabón Trenza', cantidad: 1, precio: 60 },
    ],
    cantidad: 2,
    montoTotal: 95,
    vencimiento: 'Quedan 20h',
    fechaLimiteMs: Date.now() + 20 * 3600 * 1000,
    estado: 'PENDIENTE',
    esUrgente: false,
    origen: 'WHATSAPP',
    fecha: '2026-09-26 09:40',
  },
]

/**
 * Calcula la disponibilidad del pedido entre Stock Central y Stock Tienda.
 * Retorna estado, etiqueta descriptiva y estilo visual para la tabla y modal.
 */
export const calcularDisponibilidadPedido = (reserva, inventarioProductos = []) => {
  const items = reserva?.items || []
  if (items.length === 0) {
    return {
      tipo: 'insuficiente',
      texto: 'Sin piezas',
      badge: 'Sin piezas',
      clase: 'disp-insuficiente',
      icono: 'AlertTriangle',
    }
  }

  let todosEnTienda = true
  let todosEnCentral = true
  let alcanzableCombinado = true

  for (const it of items) {
    const prod = inventarioProductos.find((p) => p.id === it.id)
    const stockTienda = prod ? Number(prod.stockTienda || 0) : 0
    const stockCentral = prod ? Number(prod.stockCentral || 0) : 0
    const cant = Number(it.cantidad || 1)

    if (stockTienda < cant) {
      todosEnTienda = false
    }
    if (stockCentral < cant) {
      todosEnCentral = false
    }
    if ((stockTienda + stockCentral) < cant) {
      alcanzableCombinado = false
    }
  }

  if (todosEnTienda) {
    return {
      tipo: 'tienda',
      texto: 'En Tienda',
      badge: 'En Tienda',
      clase: 'disp-tienda',
      icono: 'Store',
      descripcion: 'Disponible para entrega inmediata en mostrador',
    }
  } else if (todosEnCentral) {
    return {
      tipo: 'central',
      texto: 'En Central',
      badge: 'En Central',
      clase: 'disp-central',
      icono: 'Building2',
      descripcion: 'Existencias ubicadas en almacén Central',
    }
  } else if (alcanzableCombinado) {
    return {
      tipo: 'ambas',
      texto: 'Ambas Sedes',
      badge: 'Ambas Sedes',
      clase: 'disp-ambas',
      icono: 'Layers',
      descripcion: 'Piezas distribuidas entre Central y Tienda física',
    }
  } else {
    return {
      tipo: 'insuficiente',
      texto: 'Stock Insuficiente',
      badge: 'Stock Insuficiente',
      clase: 'disp-insuficiente',
      icono: 'AlertCircle',
      descripcion: 'No hay unidades suficientes para cubrir la reserva',
    }
  }
}

/**
 * Enriquece los items de una reserva con los datos en tiempo real del inventario
 * (fotos, talla, color, material, y stock en Central y Tienda).
 */
export const enriquecerItemsReserva = (reserva, inventarioProductos = []) => {
  const items = reserva?.items || []
  return items.map((it) => {
    const prod = inventarioProductos.find((p) => p.id === it.id)
    const precioUnit = Number(it.precio || prod?.precio || prod?.precio_venta || 0)
    const cant = Number(it.cantidad || 1)

    return {
      id: it.id,
      nombre: it.nombre || prod?.nombre || 'Producto sin nombre',
      categoria: prod?.categoria || 'Joyas',
      material: prod?.material || 'Acero 316L',
      color: prod?.color || 'Plateado',
      talla: prod?.talla || 'Ajustable',
      imagen: prod?.imagen || it.imagen || 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=500&auto=format&fit=crop&q=80',
      stockCentral: prod ? Number(prod.stockCentral || 0) : 0,
      stockTienda: prod ? Number(prod.stockTienda || 0) : 0,
      stockTotal: prod ? (Number(prod.stockCentral || 0) + Number(prod.stockTienda || 0)) : 0,
      cantidad: cant,
      precioUnitario: precioUnit,
      subtotal: precioUnit * cant,
    }
  })
}

export const useReservasStore = defineStore('reservas', () => {
  const cargarInicial = () => {
    try {
      const guardado = localStorage.getItem(CLAVE_RESERVAS)
      return guardado ? JSON.parse(guardado) : RESERVAS_DEFECTO
    } catch {
      return RESERVAS_DEFECTO
    }
  }

  const reservas = ref(cargarInicial())

  // Reserva transferida para completar venta en POS
  const reservaActivaParaVenta = ref(null)

  const guardarEnStorage = () => {
    try {
      localStorage.setItem(CLAVE_RESERVAS, JSON.stringify(reservas.value))
    } catch (e) {
      console.error('Error al guardar reservas:', e)
    }
  }

  // Reservas activas en espera de cobro o retiro
  const reservasPendientes = computed(() => {
    return reservas.value.filter((r) => r.estado === 'PENDIENTE')
  })

  // Conteo de reservas con vencimiento crítico (< 4 horas)
  const contadorPorVencer = computed(() => {
    return reservasPendientes.value.filter((r) => {
      if (r.esUrgente) return true
      if (r.fechaLimiteMs) {
        return (r.fechaLimiteMs - Date.now()) < 4 * 3600 * 1000
      }
      return false
    }).length
  })

  // Carga asíncrona desde Supabase (tabla reserva)
  const cargarReservasSupabase = async () => {
    if (!isSupabaseConfigured) return false
    try {
      const { data, error } = await supabase
        .from('reserva')
        .select('*')
        .order('fecha_limite', { ascending: true })

      if (!error && data && data.length > 0) {
        reservas.value = data.map((r) => {
          const fechaLimiteMs = r.fecha_limite ? new Date(r.fecha_limite).getTime() : (Date.now() + 24 * 3600 * 1000)
          const horasRestantes = Math.max(0, Math.round((fechaLimiteMs - Date.now()) / (3600 * 1000)))
          return {
            id: r.id_reserva || r.id,
            cliente: r.cliente || r.nombre_cliente || 'Cliente Web',
            telefono: r.telefono || '',
            tipoCliente: r.tipo_cliente || 'NUEVA',
            producto: r.descripcion_items || r.producto || 'Joyas Reservadas',
            idProducto: r.id_producto || null,
            items: Array.isArray(r.items) ? r.items : [],
            cantidad: Number(r.cantidad || 1),
            montoTotal: Number(r.monto_total || r.total || 0),
            vencimiento: `Quedan ${horasRestantes}h`,
            fechaLimiteMs,
            estado: r.estado || 'PENDIENTE',
            esUrgente: horasRestantes <= 4,
            origen: r.origen || 'WHATSAPP',
            fecha: r.created_at ? r.created_at.slice(0, 16).replace('T', ' ') : new Date().toISOString().slice(0, 16).replace('T', ' '),
          }
        })
        guardarEnStorage()
        return true
      }
    } catch (err) {
      console.warn('ℹ️ [Supabase] Usando almacenamiento local para reservas:', err.message)
    }
    return false
  }

  // Cobrar reserva y marcar como entregada
  const cobrarReserva = (idReserva) => {
    const res = reservas.value.find((r) => r.id === idReserva)
    if (res) {
      res.estado = 'ENTREGADA'
      guardarEnStorage()

      if (isSupabaseConfigured) {
        supabase
          .from('reserva')
          .update({ estado: 'ENTREGADA' })
          .eq('id_reserva', idReserva)
          .then()
          .catch((e) => console.warn('ℹ️ [Supabase Sync Reserva Entregada]:', e))
      }
    }
  }

  // Cancelar/liberar reserva (devolver piezas a stock disponible)
  const liberarReserva = (idReserva) => {
    const res = reservas.value.find((r) => r.id === idReserva)
    if (res) {
      res.estado = 'CANCELADA'
      guardarEnStorage()

      if (isSupabaseConfigured) {
        supabase
          .from('reserva')
          .update({ estado: 'CANCELADA' })
          .eq('id_reserva', idReserva)
          .then()
          .catch((e) => console.warn('ℹ️ [Supabase Sync Reserva Cancelada]:', e))
      }

      return true
    }
    return false
  }

  // Prepara y transfiere los datos de la reserva al POS (/admin/ventas)
  const prepararVentaDesdeReserva = (idReserva) => {
    const res = reservas.value.find((r) => r.id === idReserva)
    if (res) {
      reservaActivaParaVenta.value = { ...res }
      return res
    }
    return null
  }

  const limpiarReservaActiva = () => {
    reservaActivaParaVenta.value = null
  }

  // Crear reserva automática desde el flujo de WhatsApp (Carrito público)
  const crearReservaDesdeCarrito = (itemsCarrito, totalBs) => {
    const id = reservas.value.length ? Math.max(...reservas.value.map((r) => r.id)) + 1 : 1
    const ahora = new Date()
    const fechaLimite = Date.now() + 24 * 3600 * 1000 // 24 horas por defecto

    // Desglose de items
    const itemsReserva = itemsCarrito.map((item) => ({
      id: item.producto.id,
      nombre: item.producto.nombre,
      cantidad: item.cantidad,
      precio: Number(item.producto.precio_venta || item.producto.precio || 0),
      imagen: item.producto.imagen || '',
      categoria: item.producto.categoria || '',
      material: item.producto.material || '',
      color: item.producto.color || '',
      talla: item.producto.talla || '',
    }))

    const descripcionProductos = itemsReserva
      .map((it) => `${it.nombre} (x${it.cantidad})`)
      .join(', ')

    const totalPiezas = itemsCarrito.reduce((acc, it) => acc + it.cantidad, 0)

    const nuevaReserva = {
      id,
      cliente: 'Pedido Catálogo Web',
      telefono: '',
      tipoCliente: 'NUEVA',
      producto: descripcionProductos,
      idProducto: itemsReserva[0]?.id || null,
      items: itemsReserva,
      cantidad: totalPiezas,
      montoTotal: Number(totalBs),
      vencimiento: 'Quedan 24h',
      fechaLimiteMs: fechaLimite,
      estado: 'PENDIENTE',
      esUrgente: false,
      origen: 'WHATSAPP',
      fecha: ahora.toISOString().slice(0, 16).replace('T', ' '),
    }

    reservas.value.unshift(nuevaReserva)
    guardarEnStorage()

    // Sincronización en segundo plano con Supabase si está activo
    if (isSupabaseConfigured) {
      supabase.rpc('crear_reserva', {
        p_cliente: nuevaReserva.cliente,
        p_telefono: nuevaReserva.telefono,
        p_items: nuevaReserva.items,
        p_horas_vigencia: 24,
      }).then().catch(() => {
        supabase.from('reserva').insert({
          cliente: nuevaReserva.cliente,
          telefono: nuevaReserva.telefono,
          producto: nuevaReserva.producto,
          monto_total: nuevaReserva.montoTotal,
          fecha_limite: new Date(nuevaReserva.fechaLimiteMs).toISOString(),
          estado: 'PENDIENTE',
          origen: 'WHATSAPP',
        }).then().catch((e) => console.warn('ℹ️ [Supabase Sync Reserva]:', e))
      })
    }

    return nuevaReserva
  }

  // Crear reserva manual desde panel de clientes
  const crearReserva = (datos) => {
    const id = reservas.value.length ? Math.max(...reservas.value.map((r) => r.id)) + 1 : 1
    const ahora = new Date()
    const horasPlazo = datos.plazo === 'Quedan 48h' ? 48 : datos.plazo === 'Quedan 3h' ? 3 : 24

    const nueva = {
      id,
      cliente: datos.cliente,
      telefono: datos.telefono || '',
      tipoCliente: datos.tipoCliente || 'NUEVA',
      producto: datos.producto,
      idProducto: datos.idProducto,
      items: [
        {
          id: datos.idProducto,
          nombre: datos.producto,
          cantidad: Number(datos.cantidad || 1),
          precio: Number(datos.montoTotal || 0) / Number(datos.cantidad || 1),
        },
      ],
      cantidad: Number(datos.cantidad || 1),
      montoTotal: Number(datos.montoTotal || 0),
      vencimiento: datos.plazo || 'Quedan 24h',
      fechaLimiteMs: Date.now() + horasPlazo * 3600 * 1000,
      estado: 'PENDIENTE',
      esUrgente: horasPlazo <= 4,
      origen: 'TIENDA',
      fecha: ahora.toISOString().slice(0, 16).replace('T', ' '),
    }

    reservas.value.unshift(nueva)
    guardarEnStorage()

    if (isSupabaseConfigured) {
      supabase.from('reserva').insert({
        cliente: nueva.cliente,
        telefono: nueva.telefono,
        producto: nueva.producto,
        monto_total: nueva.montoTotal,
        fecha_limite: new Date(nueva.fechaLimiteMs).toISOString(),
        estado: 'PENDIENTE',
        origen: 'TIENDA',
      }).then().catch((e) => console.warn('ℹ️ [Supabase Sync Reserva Manual]:', e))
    }

    return nueva
  }

  return {
    reservas,
    reservasPendientes,
    contadorPorVencer,
    reservaActivaParaVenta,
    cargarReservasSupabase,
    cobrarReserva,
    liberarReserva,
    prepararVentaDesdeReserva,
    limpiarReservaActiva,
    crearReservaDesdeCarrito,
    crearReserva,
    calcularDisponibilidadPedido,
    enriquecerItemsReserva,
  }
})
