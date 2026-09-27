import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { CONFIG_NEGOCIO } from '../config/negocio'

export const useCarritoStore = defineStore('carrito', () => {
  // Lista de items seleccionados: [{ producto, cantidad }]
  const items = ref([])
  const estaAbierto = ref(false)

  // Total de piezas sumadas
  const totalItems = computed(() => {
    return items.value.reduce((total, item) => total + item.cantidad, 0)
  })

  // Subtotal en Bolivianos (Bs.)
  const subtotal = computed(() => {
    return items.value.reduce((total, item) => {
      const precio = Number(item.producto.precio_venta || item.producto.precio || 0)
      return total + precio * item.cantidad
    }, 0)
  })

  const estaVacio = computed(() => items.value.length === 0)

  // Helper para obtener el stock total disponible de un producto
  const obtenerStockDisponible = (producto) => {
    if (!producto) return 0
    if (producto.stock !== undefined && producto.stock !== null) {
      return Number(producto.stock)
    }
    const central = Number(producto.stockCentral || 0)
    const tienda = Number(producto.stockTienda || 0)
    return central + tienda
  }

  // Verificar si un producto en el carrito ya alcanzó el tope de stock disponible
  const estaAlMaximo = (idProducto) => {
    const item = items.value.find((i) => i.producto.id === idProducto)
    if (!item) return false
    const stockMax = obtenerStockDisponible(item.producto)
    return item.cantidad >= stockMax
  }

  // Agregar joya al carrito respetando el stock disponible
  const agregarProducto = (producto) => {
    const stockMax = obtenerStockDisponible(producto)
    if (stockMax <= 0) return false

    const itemExistente = items.value.find((i) => i.producto.id === producto.id)
    if (itemExistente) {
      if (itemExistente.cantidad >= stockMax) {
        estaAbierto.value = true
        return false // Ya alcanzó el stock máximo disponible
      }
      itemExistente.cantidad += 1
    } else {
      items.value.push({
        producto,
        cantidad: 1,
      })
    }
    // Abre automáticamente el carrito para feedback visual
    estaAbierto.value = true
    return true
  }

  // Quitar joya por su ID
  const quitarProducto = (idProducto) => {
    items.value = items.value.filter((i) => i.producto.id !== idProducto)
  }

  // Actualizar cantidad directa asegurando no exceder el stock
  const actualizarCantidad = (idProducto, nuevaCantidad) => {
    if (nuevaCantidad <= 0) {
      quitarProducto(idProducto)
      return
    }
    const item = items.value.find((i) => i.producto.id === idProducto)
    if (item) {
      const stockMax = obtenerStockDisponible(item.producto)
      item.cantidad = Math.min(nuevaCantidad, Math.max(stockMax, 1))
    }
  }

  // Vaciar selección
  const vaciarCarrito = () => {
    items.value = []
  }

  const abrirCarrito = () => {
    estaAbierto.value = true
  }

  const cerrarCarrito = () => {
    estaAbierto.value = false
  }

  // Generador de enlace directo hacia WhatsApp para coordinar el pedido
  const generarEnlaceWhatsApp = (telefono = CONFIG_NEGOCIO.whatsappNumero) => {
    if (estaVacio.value) return '#'

    // Sanitizar número quitando espacios, signos + y guiones
    const telLimpio = String(telefono || '').replace(/[\s+\-()]/g, '')

    let mensaje = '¡Hola Moonstone Joyería! Deseo coordinar la compra de las siguientes joyas de su catálogo:%0A%0A'

    items.value.forEach((item, index) => {
      const precioUnitario = Number(item.producto.precio_venta || item.producto.precio || 0)
      const subtotalItem = precioUnitario * item.cantidad
      mensaje += `${index + 1}. *${item.producto.nombre}*%0A`
      mensaje += `   Cantidad: ${item.cantidad} x Bs. ${precioUnitario} = Bs. ${subtotalItem}%0A`
    })

    mensaje += `%0A*Total Estimado: Bs. ${subtotal.value}*%0A%0A¿Tienen disponibilidad para coordinar el pago y retiro/envío? Muchas gracias.`

    return `https://wa.me/${telLimpio}?text=${mensaje}`
  }

  return {
    items,
    estaAbierto,
    totalItems,
    subtotal,
    estaVacio,
    obtenerStockDisponible,
    estaAlMaximo,
    agregarProducto,
    quitarProducto,
    actualizarCantidad,
    vaciarCarrito,
    abrirCarrito,
    cerrarCarrito,
    generarEnlaceWhatsApp,
  }
})
