import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useProductosStore = defineStore('productos', () => {
  // Catálogo base de joyas con datos mock alineados a la BD
  const productos = ref([
    {
      id: 1,
      nombre: 'Anillo Serpiente Regulable',
      categoria: 'Anillos',
      material: 'Acero 316L',
      color: 'Plateado',
      talla: 'Ajustable',
      precio_venta: 45,
      stock: 12,
      stockCentral: 8,
      stockTienda: 4,
      es_prioritario: true,
      descripcion: 'Anillo con relieve detallado en forma de serpiente, material inoxidable de alta duración.',
      imagen: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=500&auto=format&fit=crop&q=80',
      imagen_detalle: 'https://images.unsplash.com/photo-1603561591411-07134e71a2a9?w=500&auto=format&fit=crop&q=80',
    },
    {
      id: 2,
      nombre: 'Collar Luna Moonstone',
      categoria: 'Cadenas/Collares',
      material: 'Artesanal',
      color: 'Tornasol',
      talla: '45 cm',
      precio_venta: 85,
      stock: 4,
      stockCentral: 2,
      stockTienda: 2,
      es_prioritario: true,
      descripcion: 'Dije con piedra lunar facetada engarzada a mano sobre cadena delgada.',
      imagen: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=500&auto=format&fit=crop&q=80',
      imagen_detalle: 'https://images.unsplash.com/photo-1611591475837-77b7ee7ce1b2?w=500&auto=format&fit=crop&q=80',
    },
    {
      id: 3,
      nombre: 'Aritos Argolla Doble Brillo',
      categoria: 'Aritos',
      material: 'Acero 316L',
      color: 'Dorado',
      talla: '12 mm',
      precio_venta: 35,
      stock: 1, // Alerta stock bajo
      stockCentral: 0,
      stockTienda: 1,
      es_prioritario: true,
      descripcion: 'Par de argollas dobles livianas para uso diario sin perder brillo ni despintarse.',
      imagen: 'https://images.unsplash.com/photo-1630019852942-f89202989a59?w=500&auto=format&fit=crop&q=80',
      imagen_detalle: 'https://images.unsplash.com/photo-1635767798638-3e25273a8236?w=500&auto=format&fit=crop&q=80',
    },
    {
      id: 4,
      nombre: 'Piercing Titán Helix Circonia',
      categoria: 'Piercings',
      material: 'Acero 316L',
      color: 'Plateado',
      talla: '1.2 mm x 8 mm',
      precio_venta: 40,
      stock: 0, // Agotado
      stockCentral: 0,
      stockTienda: 0,
      es_prioritario: false,
      descripcion: 'Labret con circonia blanca engastada, rosca interna antialérgica ideal para cartílago.',
      imagen: 'https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?w=500&auto=format&fit=crop&q=80',
      imagen_detalle: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=500&auto=format&fit=crop&q=80',
    },
    {
      id: 5,
      nombre: 'Brazalete Eslabón Trenza',
      categoria: 'Brazaletes',
      material: 'Acero 316L',
      color: 'Plateado',
      talla: '18 cm',
      precio_venta: 60,
      stock: 8,
      stockCentral: 5,
      stockTienda: 3,
      es_prioritario: false,
      descripcion: 'Brazalete robusto con broche marinero de máxima seguridad.',
      imagen: 'https://images.unsplash.com/photo-1611591475837-77b7ee7ce1b2?w=500&auto=format&fit=crop&q=80',
      imagen_detalle: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=500&auto=format&fit=crop&q=80',
    },
    {
      id: 6,
      nombre: 'Choker Terciopelo Gótico',
      categoria: 'Cadenas/Collares',
      material: 'Artesanal',
      color: 'Negro',
      talla: '32 cm + extensión',
      precio_venta: 50,
      stock: 6,
      stockCentral: 4,
      stockTienda: 2,
      es_prioritario: false,
      descripcion: 'Gargantilla de terciopelo suave con colgante de cruz barroca oxidada.',
      imagen: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=500&auto=format&fit=crop&q=80',
      imagen_detalle: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=500&auto=format&fit=crop&q=80',
    },
  ])

  const categorias = [
    'Todos',
    'Anillos',
    'Cadenas/Collares',
    'Aritos',
    'Piercings',
    'Brazaletes',
  ]

  const categoriaActiva = ref('Todos')
  const busqueda = ref('')

  // Filtrado reactivo combinado por categoría y texto de búsqueda
  const productosFiltrados = computed(() => {
    return productos.value.filter((joya) => {
      const coincideCat =
        categoriaActiva.value === 'Todos' ||
        joya.categoria.toLowerCase() === categoriaActiva.value.toLowerCase()

      const texto = busqueda.value.trim().toLowerCase()
      const coincideBusqueda =
        !texto ||
        joya.nombre.toLowerCase().includes(texto) ||
        joya.material.toLowerCase().includes(texto)

      return coincideCat && coincideBusqueda
    })
  })

  // Obtener producto individual por su ID
  const obtenerPorId = (id) => {
    return productos.value.find((p) => p.id === Number(id)) || null
  }

  return {
    productos,
    categorias,
    categoriaActiva,
    busqueda,
    productosFiltrados,
    obtenerPorId,
  }
})
