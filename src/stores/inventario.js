import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useInventarioStore = defineStore('inventario', () => {
  // Lista de existencias multisede (Central Dueña vs Mercadito Creativo)
  const items = ref([
    {
      id: 1,
      nombre: 'Anillo Serpiente Regulable',
      categoria: 'Anillos',
      material: 'Acero 316L',
      precio: 45,
      stockCentral: 8,
      stockTienda: 4,
      stockMinimo: 2,
      imagen: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=500&auto=format&fit=crop&q=80',
    },
    {
      id: 2,
      nombre: 'Collar Luna Moonstone',
      categoria: 'Cadenas/Collares',
      material: 'Artesanal',
      precio: 85,
      stockCentral: 2,
      stockTienda: 2,
      stockMinimo: 2,
      imagen: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=500&auto=format&fit=crop&q=80',
    },
    {
      id: 3,
      nombre: 'Aritos Argolla Doble Brillo',
      categoria: 'Aritos',
      material: 'Acero 316L',
      precio: 35,
      stockCentral: 0,
      stockTienda: 1,
      stockMinimo: 2,
      imagen: 'https://images.unsplash.com/photo-1630019852942-f89202989a59?w=500&auto=format&fit=crop&q=80',
    },
    {
      id: 4,
      nombre: 'Piercing Titán Helix Circonia',
      categoria: 'Piercings',
      material: 'Acero 316L',
      precio: 40,
      stockCentral: 0,
      stockTienda: 0,
      stockMinimo: 1,
      imagen: 'https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?w=500&auto=format&fit=crop&q=80',
    },
    {
      id: 5,
      nombre: 'Brazalete Eslabón Trenza',
      categoria: 'Brazaletes',
      material: 'Acero 316L',
      precio: 60,
      stockCentral: 5,
      stockTienda: 3,
      stockMinimo: 2,
      imagen: 'https://images.unsplash.com/photo-1611591475837-77b7ee7ce1b2?w=500&auto=format&fit=crop&q=80',
    },
    {
      id: 6,
      nombre: 'Choker Terciopelo Gótico',
      categoria: 'Cadenas/Collares',
      material: 'Artesanal',
      precio: 50,
      stockCentral: 4,
      stockTienda: 2,
      stockMinimo: 2,
      imagen: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=500&auto=format&fit=crop&q=80',
    },
  ])

  const busqueda = ref('')
  const filtroUbicacion = ref('todas') // 'todas', 'central', 'tienda'

  // Items filtrados por buscador
  const itemsFiltrados = computed(() => {
    return items.value.filter((item) => {
      const q = busqueda.value.toLowerCase().trim()
      const coincideTexto =
        !q ||
        item.nombre.toLowerCase().includes(q) ||
        item.categoria.toLowerCase().includes(q)
      return coincideTexto
    })
  })

  // Alertas de piezas con stock crítico (<= 2 unidades en total)
  const alertasStockBajo = computed(() => {
    return items.value.filter((i) => i.stockCentral + i.stockTienda <= i.stockMinimo)
  })

  // Trasladar unidades entre Central (Dueña) y Tienda (Mercadito Creativo)
  const moverStock = (idProducto, origen, destino, cantidad) => {
    const joya = items.value.find((i) => i.id === idProducto)
    if (!joya || cantidad <= 0) return false

    if (origen === 'central' && destino === 'tienda') {
      if (joya.stockCentral < cantidad) return false
      joya.stockCentral -= cantidad
      joya.stockTienda += cantidad
      return true
    } else if (origen === 'tienda' && destino === 'central') {
      if (joya.stockTienda < cantidad) return false
      joya.stockTienda -= cantidad
      joya.stockCentral += cantidad
      return true
    }
    return false
  }

  // Alta de nuevo producto
  const agregarProducto = (nuevo) => {
    const id = items.value.length + 1
    items.value.unshift({
      id,
      nombre: nuevo.nombre,
      categoria: nuevo.categoria,
      material: nuevo.material,
      precio: Number(nuevo.precio || 0),
      stockCentral: Number(nuevo.stockInicial || 0),
      stockTienda: 0,
      stockMinimo: 2,
      imagen: nuevo.imagen || 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=500&auto=format&fit=crop&q=80',
    })
  }

  return {
    items,
    busqueda,
    filtroUbicacion,
    itemsFiltrados,
    alertasStockBajo,
    moverStock,
    agregarProducto,
  }
})
