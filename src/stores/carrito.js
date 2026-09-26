import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

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

  // Agregar joya al carrito
  const agregarProducto = (producto) => {
    const itemExistente = items.value.find((i) => i.producto.id === producto.id)
    if (itemExistente) {
      itemExistente.cantidad += 1
    } else {
      items.value.push({
        producto,
        cantidad: 1,
      })
    }
    // Abre automáticamente el carrito para feedback visual
    estaAbierto.value = true
  }

  // Quitar joya por su ID
  const quitarProducto = (idProducto) => {
    items.value = items.value.filter((i) => i.producto.id !== idProducto)
  }

  // Actualizar cantidad directa
  const actualizarCantidad = (idProducto, nuevaCantidad) => {
    if (nuevaCantidad <= 0) {
      quitarProducto(idProducto)
      return
    }
    const item = items.value.find((i) => i.producto.id === idProducto)
    if (item) {
      item.cantidad = nuevaCantidad
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
  const generarEnlaceWhatsApp = (telefono = '59170000000') => {
    if (estaVacio.value) return '#'

    let mensaje = '¡Hola Moonstone Joyería! Deseo coordinar la compra de las siguientes joyas de su catálogo:%0A%0A'

    items.value.forEach((item, index) => {
      const precioUnitario = Number(item.producto.precio_venta || item.producto.precio || 0)
      const subtotalItem = precioUnitario * item.cantidad
      mensaje += `${index + 1}. *${item.producto.nombre}*%0A`
      mensaje += `   Cantidad: ${item.cantidad} x Bs. ${precioUnitario} = Bs. ${subtotalItem}%0A`
    })

    mensaje += `%0A*Total Estimado: Bs. ${subtotal.value}*%0A%0A¿Tienen disponibilidad para coordinar el pago y retiro/envío? Muchas gracias.`

    return `https://wa.me/${telefono}?text=${mensaje}`
  }

  return {
    items,
    estaAbierto,
    totalItems,
    subtotal,
    estaVacio,
    agregarProducto,
    quitarProducto,
    actualizarCantidad,
    vaciarCarrito,
    abrirCarrito,
    cerrarCarrito,
    generarEnlaceWhatsApp,
  }
})
