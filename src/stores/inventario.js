import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase, isSupabaseConfigured } from '../supabase/client'

const CLAVE_INVENTARIO = 'moonstone_inventario'

const ITEMS_INICIALES = [
  {
    id: 1,
    nombre: 'Aros Mini Serpiente Regulable',
    categoria: 'AROS MINI',
    material: 'Acero 316L',
    color: 'Plateado',
    talla: 'Ajustable',
    precio: 45,
    stockCentral: 8,
    stockTienda: 4,
    stock_minimo: 1,
    stockMinimo: 1,
    es_prioritario: true,
    activo: true,
    imagen: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=500&auto=format&fit=crop&q=80',
    imagen_detalle: 'https://images.unsplash.com/photo-1603561591411-07134e71a2a9?w=500&auto=format&fit=crop&q=80',
  },
  {
    id: 2,
    nombre: 'Earcuff Luna Moonstone',
    categoria: 'EARCUFFS',
    material: 'Artesanal',
    color: 'Tornasol',
    talla: 'Estándar',
    precio: 85,
    stockCentral: 2,
    stockTienda: 2,
    stock_minimo: 1,
    stockMinimo: 1,
    es_prioritario: true,
    activo: true,
    imagen: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=500&auto=format&fit=crop&q=80',
    imagen_detalle: 'https://images.unsplash.com/photo-1611591475837-77b7ee7ce1b2?w=500&auto=format&fit=crop&q=80',
  },
  {
    id: 3,
    nombre: 'Aros Mini Doble Brillo',
    categoria: 'AROS MINI',
    material: 'Acero 316L',
    color: 'Dorado',
    talla: '12 mm',
    precio: 35,
    stockCentral: 0,
    stockTienda: 1,
    stock_minimo: 1,
    stockMinimo: 1,
    es_prioritario: true,
    activo: true,
    imagen: 'https://images.unsplash.com/photo-1630019852942-f89202989a59?w=500&auto=format&fit=crop&q=80',
    imagen_detalle: 'https://images.unsplash.com/photo-1635767798638-3e25273a8236?w=500&auto=format&fit=crop&q=80',
  },
  {
    id: 4,
    nombre: 'Piercing Titán Helix Circonia',
    categoria: 'PIERCINGS',
    material: 'Acero 316L',
    color: 'Plateado',
    talla: '1.2 mm x 8 mm',
    precio: 40,
    stockCentral: 0,
    stockTienda: 0,
    stock_minimo: 1,
    stockMinimo: 1,
    es_prioritario: false,
    activo: true,
    imagen: 'https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?w=500&auto=format&fit=crop&q=80',
    imagen_detalle: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=500&auto=format&fit=crop&q=80',
  },
  {
    id: 5,
    nombre: 'Brazalete Eslabón Trenza',
    categoria: 'BRAZALETES',
    material: 'Acero 316L',
    color: 'Plateado',
    talla: '18 cm',
    precio: 60,
    stockCentral: 5,
    stockTienda: 3,
    stock_minimo: 1,
    stockMinimo: 1,
    es_prioritario: false,
    activo: true,
    imagen: 'https://images.unsplash.com/photo-1611591475837-77b7ee7ce1b2?w=500&auto=format&fit=crop&q=80',
    imagen_detalle: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=500&auto=format&fit=crop&q=80',
  },
  {
    id: 6,
    nombre: 'Cinturón Cadena Cuarzo',
    categoria: 'CINTURONES',
    material: 'Acero 316L',
    color: 'Plateado',
    talla: '75 - 95 cm',
    precio: 75,
    stockCentral: 3,
    stockTienda: 2,
    stock_minimo: 1,
    stockMinimo: 1,
    es_prioritario: false,
    activo: true,
    imagen: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=500&auto=format&fit=crop&q=80',
    imagen_detalle: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=500&auto=format&fit=crop&q=80',
  },
  {
    id: 7,
    nombre: 'Gafas de Sol Vintage Oval',
    categoria: 'GAFAS',
    material: 'Artesanal',
    color: 'Carey',
    talla: 'Estándar',
    precio: 90,
    stockCentral: 2,
    stockTienda: 1,
    stock_minimo: 1,
    stockMinimo: 1,
    es_prioritario: false,
    activo: true,
    imagen: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=500&auto=format&fit=crop&q=80',
    imagen_detalle: '',
  },
]

export const useInventarioStore = defineStore('inventario', () => {
  const cargarInicial = () => {
    try {
      const guardado = localStorage.getItem(CLAVE_INVENTARIO)
      return guardado ? JSON.parse(guardado) : ITEMS_INICIALES
    } catch {
      return ITEMS_INICIALES
    }
  }

  const items = ref(cargarInicial())
  const busqueda = ref('')
  const filtroCategoria = ref('TODAS')
  const ordenSeleccionado = ref('az') // 'az' | 'za' | 'precio_desc' | 'precio_asc'

  const guardarEnStorage = () => {
    try {
      localStorage.setItem(CLAVE_INVENTARIO, JSON.stringify(items.value))
    } catch (e) {
      console.error('Error al guardar inventario:', e)
    }
  }

  // Items filtrados por buscador, categoría y ordenamiento (A-Z, Z-A, Precios)
  const itemsFiltrados = computed(() => {
    let resultado = items.value.filter((item) => {
      // 1. Filtro por categoría
      const catFiltro = filtroCategoria.value.toUpperCase()
      const coincideCat =
        catFiltro === 'TODAS' ||
        catFiltro === 'TODOS' ||
        (item.categoria && item.categoria.toUpperCase() === catFiltro)

      // 2. Filtro por búsqueda de texto
      const q = busqueda.value.toLowerCase().trim()
      const coincideTexto =
        !q ||
        item.nombre.toLowerCase().includes(q) ||
        (item.categoria && item.categoria.toLowerCase().includes(q)) ||
        (item.material && item.material.toLowerCase().includes(q)) ||
        (item.color && item.color.toLowerCase().includes(q))

      return coincideCat && coincideTexto
    })

    // 3. Ordenamiento reactivo
    if (ordenSeleccionado.value === 'az') {
      resultado.sort((a, b) => a.nombre.localeCompare(b.nombre))
    } else if (ordenSeleccionado.value === 'za') {
      resultado.sort((a, b) => b.nombre.localeCompare(a.nombre))
    } else if (ordenSeleccionado.value === 'precio_desc') {
      resultado.sort((a, b) => Number(b.precio) - Number(a.precio))
    } else if (ordenSeleccionado.value === 'precio_asc') {
      resultado.sort((a, b) => Number(a.precio) - Number(b.precio))
    }

    return resultado
  })

  // Alertas de piezas con stock crítico (<= stock_minimo)
  const alertasStockBajo = computed(() => {
    return items.value.filter((i) => {
      const total = (i.stockCentral || 0) + (i.stockTienda || 0)
      const min = i.stock_minimo !== undefined ? i.stock_minimo : (i.stockMinimo || 1)
      return total <= min
    })
  })

  // Trasladar unidades entre Central (Dueña) y Tienda (Mercadito Creativo)
  const moverStock = (idProducto, origen, destino, cantidad) => {
    const joya = items.value.find((i) => i.id === idProducto)
    if (!joya || cantidad <= 0) return false

    if (origen === 'central' && destino === 'tienda') {
      if (joya.stockCentral < cantidad) return false
      joya.stockCentral -= cantidad
      joya.stockTienda += cantidad
      guardarEnStorage()
      return true
    } else if (origen === 'tienda' && destino === 'central') {
      if (joya.stockTienda < cantidad) return false
      joya.stockTienda -= cantidad
      joya.stockCentral += cantidad
      guardarEnStorage()
      return true
    }
    return false
  }

  // Alta de nuevo producto (Solo Administradora)
  const agregarProducto = (nuevo) => {
    const id = items.value.length ? Math.max(...items.value.map((i) => i.id)) + 1 : 1
    const nuevoItem = {
      id,
      nombre: nuevo.nombre,
      categoria: (nuevo.categoria || 'AROS MINI').toUpperCase(),
      material: nuevo.material || 'Acero 316L',
      color: nuevo.color || 'Plateado',
      talla: nuevo.talla || 'Estándar',
      precio: Number(nuevo.precio || nuevo.precio_venta || 0),
      stockCentral: Number(nuevo.stockInicial !== undefined ? nuevo.stockInicial : (nuevo.stockCentral || 0)),
      stockTienda: Number(nuevo.stockTienda || 0),
      stock_minimo: Number(nuevo.stock_minimo !== undefined ? nuevo.stock_minimo : 1),
      stockMinimo: Number(nuevo.stock_minimo !== undefined ? nuevo.stock_minimo : 1),
      es_prioritario: Boolean(nuevo.es_prioritario),
      activo: nuevo.activo !== undefined ? Boolean(nuevo.activo) : true,
      imagen: nuevo.imagen || 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=500&auto=format&fit=crop&q=80',
      imagen_detalle: nuevo.imagen_detalle || '',
    }
    items.value.unshift(nuevoItem)
    guardarEnStorage()
    return nuevoItem
  }

  // Edición completa de producto (Solo Administradora)
  const actualizarProducto = (idProducto, datos) => {
    const joya = items.value.find((i) => i.id === idProducto)
    if (joya) {
      if (datos.nombre !== undefined) joya.nombre = datos.nombre
      if (datos.categoria !== undefined) joya.categoria = datos.categoria.toUpperCase()
      if (datos.material !== undefined) joya.material = datos.material
      if (datos.color !== undefined) joya.color = datos.color
      if (datos.talla !== undefined) joya.talla = datos.talla
      if (datos.precio !== undefined) joya.precio = Number(datos.precio)
      if (datos.precio_venta !== undefined) joya.precio = Number(datos.precio_venta)
      if (datos.stockCentral !== undefined) joya.stockCentral = Number(datos.stockCentral)
      if (datos.stockTienda !== undefined) joya.stockTienda = Number(datos.stockTienda)
      if (datos.stock_minimo !== undefined) {
        joya.stock_minimo = Number(datos.stock_minimo)
        joya.stockMinimo = Number(datos.stock_minimo)
      }
      if (datos.es_prioritario !== undefined) joya.es_prioritario = Boolean(datos.es_prioritario)
      if (datos.activo !== undefined) joya.activo = Boolean(datos.activo)
      if (datos.imagen) joya.imagen = datos.imagen
      if (datos.imagen_detalle !== undefined) joya.imagen_detalle = datos.imagen_detalle

      guardarEnStorage()
      return true
    }
    return false
  }

  // Descontar stock por venta de mostrador según origen ('tienda', 'central', 'ambos')
  const descontarStockVenta = ({ idProducto, cantidad, origenStock = 'tienda' }) => {
    const joya = items.value.find((i) => i.id === Number(idProducto))
    if (!joya || cantidad <= 0) return false

    if (origenStock === 'tienda') {
      joya.stockTienda = Math.max(0, (joya.stockTienda || 0) - cantidad)
    } else if (origenStock === 'central') {
      joya.stockCentral = Math.max(0, (joya.stockCentral || 0) - cantidad)
    } else if (origenStock === 'ambos') {
      let restante = cantidad
      const dispTienda = joya.stockTienda || 0
      if (dispTienda >= restante) {
        joya.stockTienda -= restante
        restante = 0
      } else {
        joya.stockTienda = 0
        restante -= dispTienda
        joya.stockCentral = Math.max(0, (joya.stockCentral || 0) - restante)
      }
    }
    guardarEnStorage()
    return true
  }

  // Carga asíncrona desde Supabase (vista vw_inventario o tabla producto)
  const cargarInventarioSupabase = async () => {
    if (!isSupabaseConfigured) return false
    try {
      const { data, error } = await supabase
        .from('vw_inventario')
        .select('*')

      let lista = data
      if (error || !data) {
        const { data: dataProd, error: errProd } = await supabase
          .from('producto')
          .select('*')
        if (errProd) throw errProd
        lista = dataProd
      }

      if (lista && lista.length > 0) {
        items.value = lista.map((p) => ({
          id: p.id_producto || p.id,
          nombre: p.nombre,
          categoria: (p.categoria || 'AROS MINI').toUpperCase(),
          material: p.material || 'Acero 316L',
          color: p.color || 'Plateado',
          talla: p.talla || 'Estándar',
          precio: Number(p.precio || p.precio_venta || 0),
          stockCentral: Number(p.stock_central ?? p.stockCentral ?? p.stock_total ?? 0),
          stockTienda: Number(p.stock_tienda ?? p.stockTienda ?? 0),
          stock_minimo: Number(p.stock_minimo || 1),
          stockMinimo: Number(p.stock_minimo || 1),
          es_prioritario: Boolean(p.es_prioritario),
          activo: p.activo !== undefined ? Boolean(p.activo) : true,
          imagen: p.imagen || (Array.isArray(p.fotos) ? p.fotos[0] : p.fotos) || 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=500&auto=format&fit=crop&q=80',
          imagen_detalle: p.imagen_detalle || (Array.isArray(p.fotos) ? p.fotos[1] : '') || '',
        }))
        guardarEnStorage()
        return true
      }
    } catch (err) {
      console.warn('ℹ️ [Supabase] Usando almacenamiento local para inventario:', err.message)
    }
    return false
  }

  return {
    items,
    busqueda,
    filtroCategoria,
    ordenSeleccionado,
    itemsFiltrados,
    alertasStockBajo,
    moverStock,
    descontarStockVenta,
    cargarInventarioSupabase,
    agregarProducto,
    actualizarProducto,
  }
})
