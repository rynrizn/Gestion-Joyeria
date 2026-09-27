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

  const listaInv = Array.isArray(inventarioProductos) ? inventarioProductos : []

  let todosEnTienda = true
  let todosEnCentral = true
  let alcanzableCombinado = true

  for (const it of items) {
    const prod = listaInv.find((p) => Number(p.id || p.id_producto) === Number(it.id || it.id_producto))
    
    // Si encontramos el producto en el inventario activo
    if (prod) {
      const stockTienda = Number(prod.stockTienda ?? prod.stock_tienda ?? 0)
      const stockCentral = Number(prod.stockCentral ?? prod.stock_central ?? 0)
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
    } else {
      // Fallback: si no tenemos la lista de inventario en memoria, nos basamos en la ubicación donde se apartó la reserva
      const ubicacionId = it.idUbicacion || (it.ubicacion?.toUpperCase().includes('TIENDA') || it.ubicacion?.toUpperCase().includes('MERCADITO') ? 2 : 1)
      if (ubicacionId === 1) {
        todosEnTienda = false
      } else {
        todosEnCentral = false
      }
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
  const listaInv = Array.isArray(inventarioProductos) ? inventarioProductos : []

  return items.map((it) => {
    const prod = listaInv.find((p) => Number(p.id || p.id_producto) === Number(it.id || it.id_producto))
    const precioUnit = Number(it.precio || prod?.precio || prod?.precio_venta || 0)
    const cant = Number(it.cantidad || 1)
    const stockC = prod ? Number(prod.stockCentral ?? prod.stock_central ?? 0) : 0
    const stockT = prod ? Number(prod.stockTienda ?? prod.stock_tienda ?? 0) : 0

    return {
      id: it.id,
      nombre: it.nombre || prod?.nombre || 'Producto sin nombre',
      categoria: prod?.categoria || it.categoria || 'Joyas',
      material: prod?.material || it.material || 'Acero 316L',
      color: prod?.color || it.color || 'Plateado',
      talla: prod?.talla || it.talla || 'Ajustable',
      imagen: prod?.imagen || it.imagen || 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=500&auto=format&fit=crop&q=80',
      stockCentral: stockC,
      stockTienda: stockT,
      stockTotal: prod ? (stockC + stockT) : (it.idUbicacion === 1 ? cant : cant),
      cantidad: cant,
      precioUnitario: precioUnit,
      subtotal: precioUnit * cant,
    }
  })
}

export const useReservasStore = defineStore('reservas', () => {
  const esDatoDePrueba = (lista) => {
    if (!Array.isArray(lista) || lista.length === 0) return false
    return lista.some((r) => r.cliente === 'María López' || r.cliente === 'Ana García')
  }

  const cargarInicial = () => {
    try {
      const guardado = localStorage.getItem(CLAVE_RESERVAS)
      if (guardado) {
        const arr = JSON.parse(guardado)
        if (isSupabaseConfigured && esDatoDePrueba(arr)) {
          localStorage.removeItem(CLAVE_RESERVAS)
          return []
        }
        return arr
      }
    } catch {}
    return isSupabaseConfigured ? [] : RESERVAS_DEFECTO
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

  // Carga asíncrona desde Supabase con relaciones a cliente, detalle_reserva, producto y ubicación
  const cargarReservasSupabase = async () => {
    if (!isSupabaseConfigured) return false
    try {
      const queryStr = 'id_reserva, fecha_reserva, fecha_limite, estado_reserva, monto_total, id_cliente, id_usuario, cliente(id_cliente, nombre, telefono, contacto_telefono, tipo_cliente), detalle_reserva(id_detalle_reserva, cantidad, precio_unitario, subtotal, id_ubicacion, id_producto, producto(id_producto, nombre, material, color, talla, precio_venta), ubicacion(id_ubicacion, nombre))'
      
      const { data, error } = await supabase
        .from('reserva')
        .select(queryStr)
        .order('fecha_reserva', { ascending: false })

      if (!error && Array.isArray(data)) {
        reservas.value = data.map((r) => {
          const fechaLimiteMs = r.fecha_limite ? new Date(r.fecha_limite).getTime() : (Date.now() + 24 * 3600 * 1000)
          const horasRestantes = Math.max(0, Math.round((fechaLimiteMs - Date.now()) / (3600 * 1000)))
          const nombreCliente = r.cliente?.nombre || 'Pedido Catálogo Web'
          const telCliente = r.cliente?.telefono || r.cliente?.contacto_telefono || ''
          const tipoCli = r.cliente?.tipo_cliente || 'NUEVA'

          const detalles = Array.isArray(r.detalle_reserva) ? r.detalle_reserva : []
          const itemsMapeados = detalles.map((d) => ({
            id: d.id_producto || d.producto?.id_producto,
            nombre: d.producto?.nombre || 'Joya',
            cantidad: Number(d.cantidad || 1),
            precio: Number(d.precio_unitario || d.producto?.precio_venta || 0),
            subtotal: Number(d.subtotal || 0),
            idUbicacion: d.id_ubicacion,
            ubicacion: d.ubicacion?.nombre || (d.id_ubicacion === 2 ? 'MERCADITO_CREATIVO' : 'CENTRAL'),
            material: d.producto?.material || '',
            color: d.producto?.color || '',
            talla: d.producto?.talla || '',
          }))

          const totalPiezas = itemsMapeados.reduce((acc, it) => acc + it.cantidad, 0)
          const descProductos = itemsMapeados.length > 0
            ? itemsMapeados.map((it) => `${it.nombre} (x${it.cantidad})`).join(', ')
            : 'Joyas Reservadas'

          return {
            id: r.id_reserva,
            cliente: nombreCliente,
            telefono: telCliente,
            tipoCliente: tipoCli,
            producto: descProductos,
            idProducto: itemsMapeados[0]?.id || null,
            items: itemsMapeados,
            cantidad: totalPiezas || 1,
            montoTotal: Number(r.monto_total || 0),
            vencimiento: `Quedan ${horasRestantes}h`,
            fechaLimiteMs,
            estado: r.estado_reserva || 'PENDIENTE',
            esUrgente: horasRestantes <= 4,
            origen: 'WHATSAPP',
            fecha: r.fecha_reserva ? r.fecha_reserva.slice(0, 16).replace('T', ' ') : new Date().toISOString().slice(0, 16).replace('T', ' '),
          }
        })
        guardarEnStorage()
        return true
      }
    } catch (err) {
      console.warn('ℹ️ [Supabase] Error al cargar reservas desde Supabase:', err.message)
    }
    return false
  }

  // Cobrar reserva y marcar como entregada
  const cobrarReserva = async (idReserva) => {
    const res = reservas.value.find((r) => r.id === idReserva)
    if (res) {
      res.estado = 'ENTREGADA'
      guardarEnStorage()

      if (isSupabaseConfigured) {
        try {
          await supabase
            .from('reserva')
            .update({ estado_reserva: 'ENTREGADA' })
            .eq('id_reserva', idReserva)
        } catch (e) {
          console.warn('ℹ️ [Supabase Sync Reserva Entregada]:', e)
        }
      }
    }
  }

  // Cancelar/liberar reserva (devolver piezas a stock disponible con RPC cancelar_reserva)
  const liberarReserva = async (idReserva) => {
    const res = reservas.value.find((r) => r.id === idReserva)
    if (res) {
      res.estado = 'CANCELADA'
      guardarEnStorage()

      if (isSupabaseConfigured) {
        try {
          const { error } = await supabase.rpc('cancelar_reserva', {
            p_id_reserva: idReserva,
            p_id_usuario: 1,
          })
          if (error) {
            console.warn('Fallback cancelación directa:', error.message)
            await supabase
              .from('reserva')
              .update({ estado_reserva: 'CANCELADA' })
              .eq('id_reserva', idReserva)
          }
        } catch (e) {
          console.warn('ℹ️ [Supabase Sync Reserva Cancelada]:', e)
        }
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
  const crearReservaDesdeCarrito = async (itemsCarrito, totalBs) => {
    const idLocal = reservas.value.length ? Math.max(...reservas.value.map((r) => r.id)) + 1 : 1
    const ahora = new Date()
    const fechaLimiteMs = Date.now() + 24 * 3600 * 1000 // 24 horas por defecto
    const fechaLimiteIso = new Date(fechaLimiteMs).toISOString()

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
      idUbicacion: Number(item.producto.stockCentral || 0) >= item.cantidad ? 1 : 2,
    }))

    const descripcionProductos = itemsReserva
      .map((it) => `${it.nombre} (x${it.cantidad})`)
      .join(', ')

    const totalPiezas = itemsCarrito.reduce((acc, it) => acc + it.cantidad, 0)

    const nuevaReserva = {
      id: idLocal,
      cliente: 'Pedido Catálogo Web',
      telefono: '',
      tipoCliente: 'NUEVA',
      producto: descripcionProductos,
      idProducto: itemsReserva[0]?.id || null,
      items: itemsReserva,
      cantidad: totalPiezas,
      montoTotal: Number(totalBs),
      vencimiento: 'Quedan 24h',
      fechaLimiteMs,
      estado: 'PENDIENTE',
      esUrgente: false,
      origen: 'WHATSAPP',
      fecha: ahora.toISOString().slice(0, 16).replace('T', ' '),
    }

    reservas.value.unshift(nuevaReserva)
    guardarEnStorage()

    // Sincronización completa con Supabase
    if (isSupabaseConfigured) {
      try {
        // 1. Obtener o crear ID de clienta para pedidos web
        let idCliente = 1
        const { data: clienteWeb } = await supabase
          .from('cliente')
          .select('id_cliente')
          .ilike('nombre', '%Catálogo Web%')
          .limit(1)

        if (clienteWeb && clienteWeb.length > 0) {
          idCliente = clienteWeb[0].id_cliente
        } else {
          const { data: nuevoC } = await supabase
            .from('cliente')
            .insert({
              nombre: 'Pedido Catálogo Web',
              tipo_cliente: 'NUEVA',
            })
            .select('id_cliente')
            .single()
          if (nuevoC) idCliente = nuevoC.id_cliente
        }

        // 2. Crear reserva vía RPC crear_reserva
        let idReservaDb = null
        const { data: idGenerado, error: errRpc } = await supabase.rpc('crear_reserva', {
          p_id_cliente: idCliente,
          p_id_usuario: 1, // Dueña
          p_fecha_limite: fechaLimiteIso,
        })

        if (!errRpc && idGenerado) {
          idReservaDb = idGenerado
        } else {
          // Fallback directo a tabla reserva
          const { data: resDirecta } = await supabase
            .from('reserva')
            .insert({
              id_cliente: idCliente,
              id_usuario: 1,
              fecha_limite: fechaLimiteIso,
              estado_reserva: 'PENDIENTE',
              monto_total: Number(totalBs),
            })
            .select('id_reserva')
            .single()
          if (resDirecta) idReservaDb = resDirecta.id_reserva
        }

        if (idReservaDb) {
          nuevaReserva.id = idReservaDb
          guardarEnStorage()

          // 3. Agregar cada producto al detalle de la reserva y reservar stock en inventario
          for (const it of itemsReserva) {
            const ubicacionId = it.idUbicacion || 1
            const { error: errAdd } = await supabase.rpc('agregar_producto_reserva', {
              p_id_reserva: idReservaDb,
              p_id_producto: it.id,
              p_id_ubicacion: ubicacionId,
              p_cantidad: it.cantidad,
            })

            if (errAdd) {
              // Fallback directo a detalle_reserva
              await supabase.from('detalle_reserva').insert({
                id_reserva: idReservaDb,
                id_producto: it.id,
                id_ubicacion: ubicacionId,
                cantidad: it.cantidad,
                precio_unitario: it.precio,
                subtotal: it.precio * it.cantidad,
              })
            }
          }
        }
      } catch (e) {
        console.warn('ℹ️ [Supabase Sync Reserva Exception]:', e)
      }
    }

    return nuevaReserva
  }

  // Crear reserva manual desde panel de clientes
  const crearReserva = async (datos) => {
    const idLocal = reservas.value.length ? Math.max(...reservas.value.map((r) => r.id)) + 1 : 1
    const ahora = new Date()
    const horasPlazo = datos.plazo === 'Quedan 48h' ? 48 : datos.plazo === 'Quedan 3h' ? 3 : 24
    const fechaLimiteMs = Date.now() + horasPlazo * 3600 * 1000
    const fechaLimiteIso = new Date(fechaLimiteMs).toISOString()

    const nueva = {
      id: idLocal,
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
      fechaLimiteMs,
      estado: 'PENDIENTE',
      esUrgente: horasPlazo <= 4,
      origen: 'TIENDA',
      fecha: ahora.toISOString().slice(0, 16).replace('T', ' '),
    }

    reservas.value.unshift(nueva)
    guardarEnStorage()

    if (isSupabaseConfigured) {
      try {
        let idCliente = datos.idCliente || 1
        if (!datos.idCliente && datos.cliente) {
          const { data: cExistente } = await supabase
            .from('cliente')
            .select('id_cliente')
            .ilike('nombre', datos.cliente.trim())
            .limit(1)

          if (cExistente && cExistente.length > 0) {
            idCliente = cExistente[0].id_cliente
          } else {
            const { data: nuevoC } = await supabase
              .from('cliente')
              .insert({
                nombre: datos.cliente,
                telefono: datos.telefono || null,
                tipo_cliente: datos.tipoCliente || 'NUEVA',
              })
              .select('id_cliente')
              .single()
            if (nuevoC) idCliente = nuevoC.id_cliente
          }
        }

        const { data: idGenerado } = await supabase.rpc('crear_reserva', {
          p_id_cliente: idCliente,
          p_id_usuario: 1,
          p_fecha_limite: fechaLimiteIso,
        })

        if (idGenerado) {
          nueva.id = idGenerado
          guardarEnStorage()

          await supabase.rpc('agregar_producto_reserva', {
            p_id_reserva: idGenerado,
            p_id_producto: datos.idProducto,
            p_id_ubicacion: 2, // Tienda física
            p_cantidad: Number(datos.cantidad || 1),
          })
        }
      } catch (e) {
        console.warn('ℹ️ [Supabase Sync Reserva Manual]:', e)
      }
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
