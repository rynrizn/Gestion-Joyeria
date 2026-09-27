import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase, isSupabaseConfigured } from '../supabase/client'

const CLAVE_VENTAS = 'moonstone_ventas'

const VENTAS_INICIALES = [
  {
    id: 101,
    fechaHora: '2026-09-26 14:45',
    producto: 'Aros Mini Serpiente Regulable (x2)',
    items: [
      { id: 1, nombre: 'Aros Mini Serpiente Regulable', cantidad: 2, precio: 45, origenStock: 'tienda' },
    ],
    cantidad: 2,
    montoTotal: 90,
    descuento: 0,
    metodoPago: 'EFECTIVO',
    montoEfectivo: 90,
    montoQR: 0,
    cliente: 'Camila Morales',
    vendedora: 'Belen',
    idVendedora: 1,
    turno: 'Turno Tarde',
    observacion: 'Clienta habitual',
  },
  {
    id: 102,
    fechaHora: '2026-09-26 13:10',
    producto: 'Earcuff Luna Moonstone (x1)',
    items: [
      { id: 2, nombre: 'Earcuff Luna Moonstone', cantidad: 1, precio: 85, origenStock: 'central' },
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
    producto: 'Brazalete Eslabón Trenza (x1), Aros Mini Doble Brillo (x1)',
    items: [
      { id: 5, nombre: 'Brazalete Eslabón Trenza', cantidad: 1, precio: 60, origenStock: 'tienda' },
      { id: 3, nombre: 'Aros Mini Doble Brillo', cantidad: 1, precio: 35, origenStock: 'ambos' },
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
    producto: 'Aros Mini Doble Brillo (x2)',
    items: [
      { id: 3, nombre: 'Aros Mini Doble Brillo', cantidad: 2, precio: 35, origenStock: 'tienda' },
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
  const esDatoDePrueba = (lista) => {
    if (!Array.isArray(lista) || lista.length === 0) return false
    return lista.some((v) => v.cliente === 'Camila Morales' || v.cliente === 'Valeria Castro')
  }

  const cargarInicial = () => {
    try {
      const guardado = localStorage.getItem(CLAVE_VENTAS)
      if (guardado) {
        const arr = JSON.parse(guardado)
        if (isSupabaseConfigured && esDatoDePrueba(arr)) {
          localStorage.removeItem(CLAVE_VENTAS)
          return []
        }
        return arr
      }
    } catch {}
    return isSupabaseConfigured ? [] : VENTAS_INICIALES
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

  // Carga asíncrona desde Supabase (vista vw_reporte_ventas o tabla venta)
  const cargarVentasSupabase = async () => {
    if (!isSupabaseConfigured) return false
    try {
      const { data, error } = await supabase
        .from('vw_reporte_ventas')
        .select('*')
        .order('fecha_hora', { ascending: false })

      if (!error && data !== null && data !== undefined) {
        ventas.value = data.map((v) => ({
          id: v.id_venta || v.id,
          fechaHora: v.fecha_hora ? v.fecha_hora.slice(0, 16).replace('T', ' ') : new Date().toISOString().slice(0, 16).replace('T', ' '),
          producto: v.descripcion_items || v.producto || 'Productos Varios',
          items: Array.isArray(v.items) ? v.items : [],
          cantidad: Number(v.cantidad_total || v.cantidad || 1),
          montoTotal: Number(v.total || v.montoTotal || 0),
          descuento: Number(v.descuento || 0),
          metodoPago: v.metodo_pago || v.metodoPago || 'EFECTIVO',
          montoEfectivo: Number(v.monto_efectivo ?? v.montoEfectivo ?? 0),
          montoQR: Number(v.monto_qr ?? v.montoQR ?? 0),
          cliente: v.cliente || 'Cliente Casual',
          vendedora: v.vendedora || 'Personal',
          idVendedora: v.id_usuario || v.idVendedora || null,
          turno: v.turno || 'Turno Tarde',
          observacion: v.observacion || '',
        }))
        guardarEnStorage()
        return true
      }
    } catch (err) {
      console.warn('ℹ️ [Supabase] Usando almacenamiento local para ventas:', err.message)
    }
    return false
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
  const registrarVenta = async ({
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

    // Sincronización en segundo plano con Supabase si está activo
    if (isSupabaseConfigured) {
      try {
        const { data: idVenta, error: errVenta } = await supabase.rpc('crear_venta_completa', {
          p_cliente: cliente,
          p_metodo_pago: metodoPago,
          p_monto_total: totalNeto,
          p_monto_efectivo: efectivoReal,
          p_monto_qr: qrReal,
          p_descuento: Number(descuento || 0),
          p_items: items,
          p_observacion: observacion,
          p_id_usuario: idVendedora || 1,
        })
        if (idVenta) {
          nuevaVenta.id = idVenta
          guardarEnStorage()
        } else if (errVenta) {
          console.warn('⚠️ [Supabase crear_venta_completa error]:', errVenta.message)
        }
      } catch (e) {
        console.warn('ℹ️ [Supabase Sync Venta]:', e)
      }
    }

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
    cargarVentasSupabase,
    registrarVenta,
  }
})
