import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase, isSupabaseConfigured } from '../supabase/client'

const CLAVE_PRODUCTOS = 'moonstone_productos'
const CLAVE_CATEGORIAS = 'moonstone_categorias'

// Categorías oficiales predeterminadas en mayúsculas
export const CATEGORIAS_BASE = [
  'TODOS',
  'AROS MINI',
  'CINTURONES',
  'GAFAS',
  'PIERCINGS',
  'BRAZALETES',
  'EARCUFFS',
]

const PRODUCTOS_INICIALES = [
  {
    id: 1,
    nombre: 'Aros Mini Serpiente Regulable',
    categoria: 'AROS MINI',
    material: 'Acero 316L',
    color: 'Plateado',
    talla: 'Ajustable',
    precio_venta: 45,
    stock: 12,
    stockCentral: 8,
    stockTienda: 4,
    stock_minimo: 1,
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
    precio_venta: 85,
    stock: 4,
    stockCentral: 2,
    stockTienda: 2,
    stock_minimo: 1,
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
    precio_venta: 35,
    stock: 1,
    stockCentral: 0,
    stockTienda: 1,
    stock_minimo: 1,
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
    precio_venta: 40,
    stock: 0,
    stockCentral: 0,
    stockTienda: 0,
    stock_minimo: 1,
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
    precio_venta: 60,
    stock: 8,
    stockCentral: 5,
    stockTienda: 3,
    stock_minimo: 1,
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
    precio_venta: 75,
    stock: 5,
    stockCentral: 3,
    stockTienda: 2,
    stock_minimo: 1,
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
    precio_venta: 90,
    stock: 3,
    stockCentral: 2,
    stockTienda: 1,
    stock_minimo: 1,
    es_prioritario: false,
    activo: true,
    imagen: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=500&auto=format&fit=crop&q=80',
    imagen_detalle: '',
  },
]

export const useProductosStore = defineStore('productos', () => {
  const cargarCategoriasInicial = () => {
    try {
      const guardado = localStorage.getItem(CLAVE_CATEGORIAS)
      if (guardado) {
        const arr = JSON.parse(guardado)
        return Array.from(new Set([...CATEGORIAS_BASE, ...arr.map((c) => c.toUpperCase())]))
      }
    } catch {}
    return [...CATEGORIAS_BASE]
  }

  const esDatoDePrueba = (lista) => {
    if (!Array.isArray(lista) || lista.length === 0) return false
    return lista.some((p) => p.nombre === 'Aros Mini Serpiente Regulable' || p.nombre === 'Earcuff Luna Moonstone')
  }

  const cargarProductosInicial = () => {
    try {
      const guardado = localStorage.getItem(CLAVE_PRODUCTOS)
      if (guardado) {
        const arr = JSON.parse(guardado)
        if (isSupabaseConfigured && esDatoDePrueba(arr)) {
          localStorage.removeItem(CLAVE_PRODUCTOS)
          return []
        }
        return arr
      }
    } catch {}
    return isSupabaseConfigured ? [] : PRODUCTOS_INICIALES
  }

  const categorias = ref(cargarCategoriasInicial())
  const productos = ref(cargarProductosInicial())
  const categoriaActiva = ref('TODOS')
  const busqueda = ref('')
  const cargando = ref(false)

  const guardarCategoriasStorage = () => {
    try {
      localStorage.setItem(CLAVE_CATEGORIAS, JSON.stringify(categorias.value))
    } catch (e) {
      console.error('Error guardando categorias:', e)
    }
  }

  const guardarProductosStorage = () => {
    try {
      localStorage.setItem(CLAVE_PRODUCTOS, JSON.stringify(productos.value))
    } catch (e) {
      console.error('Error guardando productos:', e)
    }
  }

  // Carga asíncrona desde Supabase (si está configurado)
  const cargarProductosSupabase = async () => {
    if (!isSupabaseConfigured) return false
    cargando.value = true
    try {
      const { data, error } = await supabase
        .from('vw_catalogo_publico')
        .select('*')

      let listaRecibida = data
      if (error || !data) {
        const { data: dataTabla, error: errTabla } = await supabase
          .from('producto')
          .select('*')
        if (!errTabla && dataTabla) {
          listaRecibida = dataTabla
        }
      }

      if (listaRecibida !== null && listaRecibida !== undefined) {
        productos.value = listaRecibida.map((p) => ({
          id: p.id_producto || p.id,
          nombre: p.nombre,
          categoria: (p.categoria || 'AROS MINI').toUpperCase(),
          material: p.material || 'Acero 316L',
          color: p.color || 'Plateado',
          talla: p.talla || 'Estándar',
          precio_venta: Number(p.precio || p.precio_venta || 0),
          stock: Number(p.stock_total ?? p.stock ?? 0),
          stockCentral: Number(p.stock_central ?? p.stockCentral ?? p.stock_total ?? 0),
          stockTienda: Number(p.stock_tienda ?? p.stockTienda ?? 0),
          stock_minimo: Number(p.stock_minimo || 1),
          es_prioritario: Boolean(p.es_prioritario),
          activo: p.activo !== undefined ? Boolean(p.activo) : true,
          imagen: p.imagen || (Array.isArray(p.fotos) ? p.fotos[0] : p.fotos) || 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=500&auto=format&fit=crop&q=80',
          imagen_detalle: p.imagen_detalle || (Array.isArray(p.fotos) ? p.fotos[1] : '') || '',
        }))

        const cats = Array.from(new Set([...CATEGORIAS_BASE, ...productos.value.map((p) => p.categoria)]))
        categorias.value = cats
        guardarCategoriasStorage()
        guardarProductosStorage()
        return true
      }
    } catch (err) {
      console.warn('ℹ️ [Supabase] Usando almacenamiento local para productos:', err.message)
    } finally {
      cargando.value = false
    }
    return false
  }

  // Filtrado reactivo para el catálogo público:
  // 1. OBLIGATORIO: Solo productos con estado activo: true
  // 2. Filtro por categoría en mayúsculas
  // 3. Filtro por búsqueda de texto
  const productosFiltrados = computed(() => {
    return productos.value.filter((joya) => {
      // Ocultar productos inactivos en el catálogo público
      if (joya.activo === false) return false

      const catFiltro = categoriaActiva.value.toUpperCase()
      const coincideCat =
        catFiltro === 'TODOS' ||
        (joya.categoria && joya.categoria.toUpperCase() === catFiltro)

      const texto = busqueda.value.trim().toLowerCase()
      const coincideBusqueda =
        !texto ||
        joya.nombre.toLowerCase().includes(texto) ||
        (joya.material && joya.material.toLowerCase().includes(texto)) ||
        (joya.color && joya.color.toLowerCase().includes(texto)) ||
        (joya.categoria && joya.categoria.toLowerCase().includes(texto))

      return coincideCat && coincideBusqueda
    })
  })

  // Agregar nueva categoría dinámica en mayúsculas (creada por la admin)
  const agregarCategoria = (nombre) => {
    if (!nombre || !nombre.trim()) return false
    const catLimpia = nombre.trim().toUpperCase()
    if (!categorias.value.includes(catLimpia)) {
      categorias.value.push(catLimpia)
      guardarCategoriasStorage()
    }
    return catLimpia
  }

  // Obtener producto individual por su ID
  const obtenerPorId = (id) => {
    return productos.value.find((p) => p.id === Number(id)) || null
  }

  // Actualizar datos de un producto (sincronizado)
  const actualizarProducto = async (id, datos) => {
    const p = productos.value.find((it) => it.id === Number(id))
    if (p) {
      if (datos.nombre !== undefined) p.nombre = datos.nombre
      if (datos.categoria !== undefined) p.categoria = datos.categoria.toUpperCase()
      if (datos.material !== undefined) p.material = datos.material
      if (datos.color !== undefined) p.color = datos.color
      if (datos.talla !== undefined) p.talla = datos.talla
      if (datos.precio !== undefined) p.precio_venta = Number(datos.precio)
      if (datos.precio_venta !== undefined) p.precio_venta = Number(datos.precio_venta)
      if (datos.stock !== undefined) p.stock = Number(datos.stock)
      if (datos.stockCentral !== undefined) p.stockCentral = Number(datos.stockCentral)
      if (datos.stockTienda !== undefined) p.stockTienda = Number(datos.stockTienda)
      if (datos.stock_minimo !== undefined) p.stock_minimo = Number(datos.stock_minimo)
      if (datos.es_prioritario !== undefined) p.es_prioritario = Boolean(datos.es_prioritario)
      if (datos.activo !== undefined) p.activo = Boolean(datos.activo)
      if (datos.imagen) p.imagen = datos.imagen
      if (datos.imagen_detalle !== undefined) p.imagen_detalle = datos.imagen_detalle

      guardarProductosStorage()

      // Sincronización en segundo plano con Supabase si está activo
      if (isSupabaseConfigured) {
        try {
          await supabase.rpc('actualizar_producto_completo', {
            p_id_producto: p.id,
            p_nombre: p.nombre,
            p_categoria: p.categoria,
            p_material: p.material,
            p_color: p.color,
            p_talla: p.talla,
            p_precio: p.precio_venta,
            p_stock_central: p.stockCentral,
            p_stock_tienda: p.stockTienda,
            p_stock_minimo: p.stock_minimo,
            p_es_prioritario: p.es_prioritario,
            p_activo: p.activo,
            p_imagen: p.imagen,
            p_imagen_detalle: p.imagen_detalle,
          })
        } catch (e) {
          console.warn('ℹ️ [Supabase Sync Update]:', e)
        }
      }

      return true
    }
    return false
  }

  // Agregar nuevo producto
  const agregarProducto = async (nuevo) => {
    const id = productos.value.length ? Math.max(...productos.value.map((it) => it.id)) + 1 : 1
    const catFinal = (nuevo.categoria || 'AROS MINI').toUpperCase()
    
    // Si la categoría no existía, registrarla automáticamente
    agregarCategoria(catFinal)

    const p = {
      id,
      nombre: nuevo.nombre,
      categoria: catFinal,
      material: nuevo.material || 'Acero 316L',
      color: nuevo.color || 'Plateado',
      talla: nuevo.talla || 'Estándar',
      precio_venta: Number(nuevo.precio || nuevo.precio_venta || 0),
      stock: Number(nuevo.stockInicial !== undefined ? nuevo.stockInicial : (nuevo.stock || 0)),
      stockCentral: Number(nuevo.stockCentral !== undefined ? nuevo.stockCentral : (nuevo.stockInicial || 0)),
      stockTienda: Number(nuevo.stockTienda || 0),
      stock_minimo: Number(nuevo.stock_minimo !== undefined ? nuevo.stock_minimo : 1),
      es_prioritario: Boolean(nuevo.es_prioritario),
      activo: nuevo.activo !== undefined ? Boolean(nuevo.activo) : true,
      imagen: nuevo.imagen || 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=500&auto=format&fit=crop&q=80',
      imagen_detalle: nuevo.imagen_detalle || '',
    }
    productos.value.unshift(p)
    guardarProductosStorage()

    // Inserción en Supabase en segundo plano si está activo
    if (isSupabaseConfigured) {
      try {
        const { data: idGenerado, error: errRpc } = await supabase.rpc('crear_producto_completo', {
          p_nombre: p.nombre,
          p_categoria: p.categoria,
          p_material: p.material,
          p_color: p.color,
          p_talla: p.talla,
          p_precio: p.precio_venta,
          p_stock_central: p.stockCentral,
          p_stock_tienda: p.stockTienda,
          p_stock_minimo: p.stock_minimo,
          p_es_prioritario: p.es_prioritario,
          p_activo: p.activo,
          p_imagen: p.imagen,
          p_imagen_detalle: p.imagen_detalle,
        })
        if (errRpc) {
          console.warn('ℹ️ [Supabase RPC crear_producto_completo]:', errRpc.message)
        } else if (idGenerado) {
          p.id = idGenerado
          guardarProductosStorage()
        }
      } catch (e) {
        console.warn('ℹ️ [Supabase Sync Insert]:', e)
      }
    }

    return p
  }

  return {
    productos,
    categorias,
    categoriaActiva,
    busqueda,
    cargando,
    productosFiltrados,
    cargarProductosSupabase,
    agregarCategoria,
    obtenerPorId,
    actualizarProducto,
    agregarProducto,
  }
})
