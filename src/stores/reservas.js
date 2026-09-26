import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

const CLAVE_RESERVAS = 'moonstone_reservas'

const RESERVAS_DEFECTO = [
  {
    id: 1,
    cliente: 'María López',
    telefono: '71234567',
    tipoCliente: 'HABITUAL',
    producto: 'Anillo Serpiente Regulable',
    idProducto: 1,
    items: [
      { id: 1, nombre: 'Anillo Serpiente Regulable', cantidad: 1, precio: 45 },
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
    producto: 'Collar Luna Moonstone',
    idProducto: 2,
    items: [
      { id: 2, nombre: 'Collar Luna Moonstone', cantidad: 1, precio: 85 },
    ],
    cantidad: 1,
    montoTotal: 85,
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
]

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

  // Cobrar reserva y marcar como entregada
  const cobrarReserva = (idReserva) => {
    const res = reservas.value.find((r) => r.id === idReserva)
    if (res) {
      res.estado = 'ENTREGADA'
      guardarEnStorage()
    }
  }

  // Cancelar/liberar reserva (devolver piezas a stock disponible)
  const liberarReserva = (idReserva) => {
    const res = reservas.value.find((r) => r.id === idReserva)
    if (res) {
      res.estado = 'CANCELADA'
      guardarEnStorage()
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
    return nueva
  }

  return {
    reservas,
    reservasPendientes,
    contadorPorVencer,
    reservaActivaParaVenta,
    cobrarReserva,
    liberarReserva,
    prepararVentaDesdeReserva,
    limpiarReservaActiva,
    crearReservaDesdeCarrito,
    crearReserva,
  }
})
