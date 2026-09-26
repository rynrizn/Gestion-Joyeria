import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useVentasStore = defineStore('ventas', () => {
  // Selector del turno operativo
  const turnoActual = ref('Turno Tarde')

  // Historial de ventas del día
  const ventas = ref([
    {
      id: 101,
      fechaHora: '2026-09-26 14:45',
      producto: 'Anillo Serpiente Regulable',
      cantidad: 2,
      montoTotal: 90,
      metodoPago: 'EFECTIVO',
      vendedora: 'Sofía Valdivia',
      turno: 'Turno Tarde',
    },
    {
      id: 102,
      fechaHora: '2026-09-26 13:10',
      producto: 'Collar Luna Moonstone',
      cantidad: 1,
      montoTotal: 85,
      metodoPago: 'QR',
      vendedora: 'Sofía Valdivia',
      turno: 'Turno Tarde',
    },
    {
      id: 103,
      fechaHora: '2026-09-26 11:20',
      producto: 'Brazalete Eslabón Trenza',
      cantidad: 1,
      montoTotal: 60,
      metodoPago: 'QR',
      vendedora: 'Carla Mendoza',
      turno: 'Turno Mañana',
    },
    {
      id: 104,
      fechaHora: '2026-09-26 10:05',
      producto: 'Aritos Argolla Doble Brillo',
      cantidad: 2,
      montoTotal: 70,
      metodoPago: 'EFECTIVO',
      vendedora: 'Carla Mendoza',
      turno: 'Turno Mañana',
    },
  ])

  // Métricas agregadas del día
  const totalEfectivo = computed(() => {
    return ventas.value
      .filter((v) => v.metodoPago === 'EFECTIVO')
      .reduce((sum, v) => sum + v.montoTotal, 0)
  })

  const totalQR = computed(() => {
    return ventas.value
      .filter((v) => v.metodoPago === 'QR')
      .reduce((sum, v) => sum + v.montoTotal, 0)
  })

  const totalGeneral = computed(() => {
    return totalEfectivo.value + totalQR.value
  })

  const ventasManana = computed(() => {
    return ventas.value.filter((v) => v.turno === 'Turno Mañana').length
  })

  const ventasTarde = computed(() => {
    return ventas.value.filter((v) => v.turno === 'Turno Tarde').length
  })

  // Registrar venta física de mostrador
  const registrarVenta = ({ producto, cantidad, metodoPago, observacion = '' }) => {
    const total = Number(producto.precio_venta || producto.precio || 0) * Number(cantidad)
    const nuevaVenta = {
      id: ventas.value.length + 101,
      fechaHora: new Date().toISOString().slice(0, 16).replace('T', ' '),
      producto: producto.nombre,
      cantidad: Number(cantidad),
      montoTotal: total,
      metodoPago,
      vendedora: 'Vendedora en turno',
      turno: turnoActual.value,
      observacion,
    }

    ventas.value.unshift(nuevaVenta)
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
    registrarVenta,
  }
})
