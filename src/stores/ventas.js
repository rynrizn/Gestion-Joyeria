import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

const CLAVE_VENTAS = 'moonstone_ventas'

const VENTAS_INICIALES = [
  {
    id: 101,
    fechaHora: '2026-09-26 14:45',
    producto: 'Anillo Serpiente Regulable (x2)',
    items: [
      { id: 1, nombre: 'Anillo Serpiente Regulable', cantidad: 2, precio: 45, subtotal: 90 },
    ],
    cantidad: 2,
    montoTotal: 90,
    descuento: 0,
    metodoPago: 'EFECTIVO',
    montoEfectivo: 90,
    montoQR: 0,
    cliente: 'Camila Morales',
    vendedora: 'Dueña del Negocio',
    idVendedora: 1,
    turno: 'Turno Tarde',
    observacion: 'Clienta habitual',
  },
  {
    id: 102,
    fechaHora: '2026-09-26 13:10',
    producto: 'Collar Luna Moonstone (x1)',
    items: [
      { id: 2, nombre: 'Collar Luna Moonstone', cantidad: 1, precio: 85, subtotal: 85 },
    ],
    cantidad: 1,
    montoTotal: 85,
    descuento: 0,
    metodoPago: 'QR',
    montoEfectivo: 0,
    montoQR: 85,
    cliente: 'Valeria Castro',
    vendedora: 'Vendedora Tarde',
    idVendedora: 3,
    turno: 'Turno Tarde',
    observacion: '',
  },
  {
    id: 103,
    fechaHora: '2026-09-26 11:20',
    producto: 'Brazalete Eslabón Trenza (x1), Aritos Argolla (x1)',
    items: [
      { id: 5, nombre: 'Brazalete Eslabón Trenza', cantidad: 1, precio: 60, subtotal: 60 },
      { id: 3, nombre: 'Aritos Argolla Doble Brillo', cantidad: 1, precio: 35, subtotal: 35 },
    ],
    cantidad: 2,
    montoTotal: 95,
    descuento: 0,
    metodoPago: 'HIBRIDO',
    montoEfectivo: 50,
    montoQR: 45,
    cliente: 'Mariana Zeballos',
    vendedora: 'Vendedora Mañana',
    idVendedora: 2,
    turno: 'Turno Mañana',
    observacion: 'Pago combinado: 50 Bs efectivo y 45 Bs por QR',
  },
  {
    id: 104,
    fechaHora: '2026-09-26 10:05',
    producto: 'Aritos Argolla Doble Brillo (x2)',
    items: [
      { id: 3, nombre: 'Aritos Argolla Doble Brillo', cantidad: 2, precio: 35, subtotal: 70 },
    ],
    cantidad: 2,
    montoTotal: 70,
    descuento: 0,
    metodoPago: 'EFECTIVO',
    montoEfectivo: 70,
    montoQR: 0,
    cliente: 'Cliente Casual',
    vendedora: 'Vendedora Mañana',
    idVendedora: 2,
    turno: 'Turno Mañana',
    observacion: '',
  },
]

export const useVentasStore = defineStore('ventas', () => {
  const cargarInicial = () => {
    try {
      const guardado = localStorage.getItem(CLAVE_VENTAS)
      return guardado ? JSON.parse(guardado) : VENTAS_INICIALES
    } catch {
      return VENTAS_INICIALES
    }
  }

  const turnoActual = ref('Turno Tarde')
  const ventas = ref(cargarInicial())

  const guardarEnStorage = () => {
    try {
      localStorage.setItem(CLAVE_VENTAS, JSON.stringify(ventas.value))
    } catch (e) {
      console.error('Error al guardar ventas:', e)
    }
  }

  // Totales agregados (considerando pagos híbridos en sus respectivas cuentas)
  const totalEfectivo = computed(() => {
    return ventas.value.reduce((sum, v) => sum + Number(v.montoEfectivo || 0), 0)
  })

  const totalQR = computed(() => {
    return ventas.value.reduce((sum, v) => sum + Number(v.montoQR || 0), 0)
  })

  const totalGeneral = computed(() => {
    return ventas.value.reduce((sum, v) => sum + Number(v.montoTotal || 0), 0)
  })

  const ventasManana = computed(() => {
    return ventas.value.filter((v) => v.turno === 'Turno Mañana').length
  })

  const ventasTarde = computed(() => {
    return ventas.value.filter((v) => v.turno === 'Turno Tarde').length
  })

  // Conteo de ventas por vendedora para reportes
  const ventasPorVendedora = computed(() => {
    const resumen = {}
    ventas.value.forEach((v) => {
      const nombre = v.vendedora || 'Personal'
      if (!resumen[nombre]) {
        resumen[nombre] = { total: 0, cantidad: 0 }
      }
      resumen[nombre].total += Number(v.montoTotal)
      resumen[nombre].cantidad += 1
    })
    return resumen
  })

  // Registrar venta multi-producto con soporte de pago híbrido y clienta
  const registrarVenta = ({
    items,
    cliente = 'Cliente Casual',
    metodoPago = 'EFECTIVO',
    montoEfectivo = 0,
    montoQR = 0,
    descuento = 0,
    observacion = '',
    vendedora = 'Vendedora en turno',
    idVendedora = null,
    turno = null,
  }) => {
    const id = ventas.value.length ? Math.max(...ventas.value.map((v) => v.id)) + 1 : 101

    // Cálculo del total neto
    const subtotalBruto = items.reduce((acc, it) => acc + (it.precio * it.cantidad), 0)
    const totalNeto = Math.max(0, subtotalBruto - Number(descuento || 0))
    const totalPiezas = items.reduce((acc, it) => acc + it.cantidad, 0)

    let efectivoReal = 0
    let qrReal = 0

    if (metodoPago === 'EFECTIVO') {
      efectivoReal = totalNeto
      qrReal = 0
    } else if (metodoPago === 'QR') {
      efectivoReal = 0
      qrReal = totalNeto
    } else if (metodoPago === 'HIBRIDO') {
      efectivoReal = Number(montoEfectivo || 0)
      qrReal = Number(montoQR || 0)
    }

    const descripcionResumen = items
      .map((it) => `${it.nombre} (x${it.cantidad})`)
      .join(', ')

    const nuevaVenta = {
      id,
      fechaHora: new Date().toISOString().slice(0, 16).replace('T', ' '),
      producto: descripcionResumen,
      items: [...items],
      cantidad: totalPiezas,
      montoTotal: totalNeto,
      descuento: Number(descuento || 0),
      metodoPago,
      montoEfectivo: efectivoReal,
      montoQR: qrReal,
      cliente,
      vendedora,
      idVendedora,
      turno: turno || turnoActual.value,
      observacion,
    }

    ventas.value.unshift(nuevaVenta)
    guardarEnStorage()
    return nuevaVenta
  }

  return {
    turnoActual,
    ventas,
    totalEfectivo,
    totalQR,
    totalGeneral,
    ventasManana,
    ventasTarde,
    ventasPorVendedora,
    registrarVenta,
  }
})
