import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useReservasStore = defineStore('reservas', () => {
  // Lista de reservas activas alineadas con la tabla 'reserva' de PostgreSQL
  const reservas = ref([
    {
      id: 1,
      cliente: 'María López',
      telefono: '71234567',
      tipoCliente: 'HABITUAL',
      producto: 'Anillo Serpiente Regulable',
      idProducto: 1,
      cantidad: 1,
      montoTotal: 45,
      vencimiento: 'Quedan 3h',
      estado: 'PENDIENTE',
      esUrgente: true,
      fecha: '2026-09-26 10:15',
    },
    {
      id: 2,
      cliente: 'Ana García',
      telefono: '72345678',
      tipoCliente: 'NUEVA',
      producto: 'Collar Luna Moonstone',
      idProducto: 2,
      cantidad: 1,
      montoTotal: 85,
      vencimiento: 'Quedan 12h',
      estado: 'PENDIENTE',
      esUrgente: false,
      fecha: '2026-09-26 08:30',
    },
    {
      id: 3,
      cliente: 'Laura Ríos',
      telefono: '73456789',
      tipoCliente: 'HABITUAL',
      producto: 'Brazalete Eslabón Trenza',
      idProducto: 5,
      cantidad: 1,
      montoTotal: 60,
      vencimiento: 'Quedan 24h',
      estado: 'PENDIENTE',
      esUrgente: false,
      fecha: '2026-09-25 18:00',
    },
  ])

  // Reservas pendientes activas
  const reservasPendientes = computed(() => {
    return reservas.value.filter((r) => r.estado === 'PENDIENTE')
  })

  // Conteo de reservas con vencimiento crítico (< 4 horas)
  const contadorPorVencer = computed(() => {
    return reservasPendientes.value.filter((r) => r.esUrgente).length
  })

  // Cobrar y entregar reserva (conversión a venta)
  const cobrarReserva = (idReserva) => {
    const res = reservas.value.find((r) => r.id === idReserva)
    if (res) {
      res.estado = 'ENTREGADA'
    }
  }

  // Cancelar y liberar reserva (retorno a stock físico)
  const liberarReserva = (idReserva) => {
    const res = reservas.value.find((r) => r.id === idReserva)
    if (res) {
      res.estado = 'CANCELADA'
    }
  }

  // Crear nueva reserva manual
  const crearReserva = (datos) => {
    const id = reservas.value.length + 1
    reservas.value.unshift({
      id,
      cliente: datos.cliente,
      telefono: datos.telefono || '',
      tipoCliente: datos.tipoCliente || 'NUEVA',
      producto: datos.producto,
      idProducto: datos.idProducto,
      cantidad: Number(datos.cantidad || 1),
      montoTotal: Number(datos.montoTotal || 0),
      vencimiento: datos.plazo || 'Quedan 24h',
      estado: 'PENDIENTE',
      esUrgente: false,
      fecha: new Date().toISOString().slice(0, 16).replace('T', ' '),
    })
  }

  return {
    reservas,
    reservasPendientes,
    contadorPorVencer,
    cobrarReserva,
    liberarReserva,
    crearReserva,
  }
})
