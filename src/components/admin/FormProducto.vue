<script setup>
import { ref, computed, watch } from 'vue'
import { useProductosStore } from '../../stores/productos'
import InputTexto from '../common/InputTexto.vue'
import BotonPrincipal from '../common/BotonPrincipal.vue'
import IconoLucide from '../common/IconoLucide.vue'

const props = defineProps({
  productoInicial: {
    type: Object,
    default: null,
  },
  modo: {
    type: String,
    default: 'crear', // 'crear' | 'editar'
  },
})

const emit = defineEmits(['guardar', 'cancelar'])

const productosStore = useProductosStore()

// Campos del formulario
const nombre = ref('')
const categoria = ref('AROS MINI')
const material = ref('Acero 316L')
const color = ref('Plateado')
const talla = ref('')
const precio = ref('')
const stockInicial = ref(5)
const stockMinimo = ref(1)
const esPrioritario = ref(false)
const activo = ref(true)

// Nueva categoría rápida
const mostrandoNuevaCat = ref(false)
const nombreNuevaCat = ref('')

// Fotos (Principal y Detalle)
const foto1Preview = ref('')
const foto2Preview = ref('')

// Listas dinámicas derivadas de productos existentes + bases
const categoriasDisponibles = computed(() => {
  return productosStore.categorias.filter((c) => c !== 'TODOS')
})

const materialesSugeridos = computed(() => {
  const existentes = productosStore.productos.map((p) => p.material).filter(Boolean)
  const bases = ['Acero 316L', 'Artesanal', 'Oro Laminado', 'Plata 925', 'Titanio Grado Implante']
  return Array.from(new Set([...bases, ...existentes]))
})

const coloresSugeridos = computed(() => {
  const existentes = productosStore.productos.map((p) => p.color).filter(Boolean)
  const bases = ['Plateado', 'Dorado', 'Tornasol', 'Negro', 'Oro Rosa', 'Carey']
  return Array.from(new Set([...bases, ...existentes]))
})

const tallasSugeridas = computed(() => {
  const existentes = productosStore.productos.map((p) => p.talla).filter(Boolean)
  const bases = ['Ajustable', 'Estándar', '12 mm', '14 mm', '16 cm', '18 cm', '45 cm', '50 cm']
  return Array.from(new Set([...bases, ...existentes]))
})

// Sincronizar datos si estamos en modo edición o creación
watch(
  () => props.productoInicial,
  (p) => {
    if (p) {
      nombre.value = p.nombre || ''
      categoria.value = (p.categoria || 'AROS MINI').toUpperCase()
      material.value = p.material || 'Acero 316L'
      color.value = p.color || 'Plateado'
      talla.value = p.talla || ''
      precio.value = p.precio !== undefined ? p.precio : (p.precio_venta || '')
      stockInicial.value = p.stockCentral !== undefined ? p.stockCentral : (p.stock || 5)
      stockMinimo.value = p.stock_minimo !== undefined ? p.stock_minimo : (p.stockMinimo !== undefined ? p.stockMinimo : 1)
      esPrioritario.value = Boolean(p.es_prioritario)
      activo.value = p.activo !== undefined ? Boolean(p.activo) : true
      foto1Preview.value = p.imagen || ''
      foto2Preview.value = p.imagen_detalle || ''
    } else {
      nombre.value = ''
      categoria.value = categoriasDisponibles.value[0] || 'AROS MINI'
      material.value = 'Acero 316L'
      color.value = 'Plateado'
      talla.value = ''
      precio.value = ''
      stockInicial.value = 5
      stockMinimo.value = 1
      esPrioritario.value = false
      activo.value = true
      foto1Preview.value = ''
      foto2Preview.value = ''
    }
  },
  { immediate: true }
)

const crearNuevaCategoria = () => {
  if (!nombreNuevaCat.value.trim()) return
  const catCreada = productosStore.agregarCategoria(nombreNuevaCat.value)
  if (catCreada) {
    categoria.value = catCreada
    nombreNuevaCat.value = ''
    mostrandoNuevaCat.value = false
  }
}

const manejarSubidaFoto = (evento, numeroFoto) => {
  const archivo = evento.target.files[0]
  if (archivo) {
    const url = URL.createObjectURL(archivo)
    if (numeroFoto === 1) foto1Preview.value = url
    if (numeroFoto === 2) foto2Preview.value = url
  }
}

const enviarFormulario = () => {
  if (!nombre.value.trim() || !precio.value) {
    alert('Por favor, completa al menos el nombre y el precio del producto.')
    return
  }

  emit('guardar', {
    id: props.productoInicial?.id,
    nombre: nombre.value.trim(),
    categoria: categoria.value.toUpperCase(),
    material: material.value.trim() || 'Acero 316L',
    color: color.value.trim() || 'Plateado',
    talla: talla.value.trim() || 'Estándar',
    precio: Number(precio.value),
    precio_venta: Number(precio.value),
    stockInicial: Number(stockInicial.value || 0),
    stockCentral: Number(stockInicial.value || 0),
    stock_minimo: Number(stockMinimo.value || 1),
    stockMinimo: Number(stockMinimo.value || 1),
    es_prioritario: Boolean(esPrioritario.value),
    activo: Boolean(activo.value),
    imagen: foto1Preview.value || 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=500&auto=format&fit=crop&q=80',
    imagen_detalle: foto2Preview.value || '',
  })
}
</script>

<template>
  <form class="formulario-producto" @submit.prevent="enviarFormulario">
    <!-- 1. Nombre del Producto -->
    <InputTexto
      v-model="nombre"
      etiqueta="Nombre del Producto *"
      placeholder="Ej. Aros Mini Serpiente Regulable"
      requerido
    />

    <!-- 2. Categoría y Nueva Categoría Rápida -->
    <div class="grupo-campo">
      <div class="cabecera-campo-cat">
        <label class="etiqueta-select">Categoría *</label>
        <button
          type="button"
          class="boton-link-cat"
          @click="mostrandoNuevaCat = !mostrandoNuevaCat"
        >
          <IconoLucide :nombre="mostrandoNuevaCat ? 'X' : 'Plus'" :tamano="14" />
          <span>{{ mostrandoNuevaCat ? 'Cancelar' : '+ Nueva Categoría' }}</span>
        </button>
      </div>

      <!-- Creador rápido de categoría -->
      <div v-if="mostrandoNuevaCat" class="caja-nueva-cat">
        <input
          v-model="nombreNuevaCat"
          type="text"
          placeholder="NOMBRE DE LA CATEGORÍA..."
          class="input-nueva-cat"
          @keyup.enter.prevent="crearNuevaCategoria"
        />
        <button
          type="button"
          class="boton-confirmar-cat"
          @click="crearNuevaCategoria"
        >
          Crear
        </button>
      </div>

      <select v-model="categoria" class="control-select">
        <option v-for="cat in categoriasDisponibles" :key="cat" :value="cat">
          {{ cat }}
        </option>
      </select>
    </div>

    <!-- 3. Material y Color con Datalists interactivos -->
    <div class="fila-dos-columnas">
      <div class="grupo-campo">
        <label class="etiqueta-select">Material *</label>
        <input
          v-model="material"
          list="lista-materiales"
          type="text"
          class="input-control"
          placeholder="Ej. Acero 316L"
          required
        />
        <datalist id="lista-materiales">
          <option v-for="mat in materialesSugeridos" :key="mat" :value="mat" />
        </datalist>
      </div>

      <div class="grupo-campo">
        <label class="etiqueta-select">Color *</label>
        <input
          v-model="color"
          list="lista-colores"
          type="text"
          class="input-control"
          placeholder="Ej. Plateado"
          required
        />
        <datalist id="lista-colores">
          <option v-for="col in coloresSugeridos" :key="col" :value="col" />
        </datalist>
      </div>
    </div>

    <!-- 4. Medida / Talla y Precio de Venta -->
    <div class="fila-dos-columnas">
      <div class="grupo-campo">
        <label class="etiqueta-select">Medida / Talla</label>
        <input
          v-model="talla"
          list="lista-tallas"
          type="text"
          class="input-control"
          placeholder="Ej. Ajustable, 18 cm, 12 mm"
        />
        <datalist id="lista-tallas">
          <option v-for="tal in tallasSugeridas" :key="tal" :value="tal" />
        </datalist>
      </div>

      <InputTexto
        v-model="precio"
        tipo="number"
        etiqueta="Precio de venta (Bs.) *"
        placeholder="Ej. 45"
        requerido
      />
    </div>

    <!-- 5. Stock Central y Stock Mínimo -->
    <div class="fila-dos-columnas">
      <InputTexto
        v-model="stockInicial"
        tipo="number"
        :etiqueta="modo === 'editar' ? 'Stock en Central (Dueña)' : 'Stock inicial (Central) *'"
        placeholder="Ej. 5"
        requerido
      />

      <div class="grupo-campo">
        <label class="etiqueta-select">Stock Mínimo (Alerta) *</label>
        <input
          v-model.number="stockMinimo"
          type="number"
          min="1"
          class="input-control"
          placeholder="Predeterminado: 1"
          required
        />
        <span class="ayuda-subtexto">Alerta si las existencias bajan de este número</span>
      </div>
    </div>

    <!-- 6. Interruptores: Estado Activo y Prioridad -->
    <div class="caja-switches">
      <!-- Switch Activo -->
      <label class="control-switch">
        <div class="texto-switch">
          <span class="titulo-switch">Producto Activo en Catálogo</span>
          <span class="desc-switch">Si está inactivo, queda oculto para los clientes en la web</span>
        </div>
        <input v-model="activo" type="checkbox" class="sr-only" />
        <span class="deslizador-switch" :class="{ 'activo-on': activo }"></span>
      </label>

      <!-- Switch Prioridad -->
      <label class="control-switch">
        <div class="texto-switch">
          <span class="titulo-switch">Producto Prioritario</span>
          <span class="desc-switch">Marca si tiene prioridad alta de reposición y venta</span>
        </div>
        <input v-model="esPrioritario" type="checkbox" class="sr-only" />
        <span class="deslizador-switch prioridad" :class="{ 'prioridad-on': esPrioritario }"></span>
      </label>
    </div>

    <!-- 7. Fotografías (Foto 1 Portada y Foto 2 Detalle) -->
    <div class="seccion-carga-fotos">
      <label class="etiqueta-select">Fotografías del producto (2 fotos)</label>
      <div class="cuadricula-cajas-foto">
        <!-- Foto 1 (Principal) -->
        <label class="caja-subida" :class="{ 'con-foto': foto1Preview }">
          <img v-if="foto1Preview" :src="foto1Preview" alt="Foto 1" class="preview-img" />
          <template v-else>
            <IconoLucide nombre="Camera" :tamano="24" />
            <span class="texto-caja-subida">Foto 1 (Principal)</span>
            <span class="subtexto-caja-subida">Portada del catálogo</span>
          </template>
          <input
            type="file"
            accept="image/*"
            class="sr-only"
            @change="manejarSubidaFoto($event, 1)"
          />
        </label>

        <!-- Foto 2 (Detalle / Puesta) -->
        <label class="caja-subida" :class="{ 'con-foto': foto2Preview }">
          <img v-if="foto2Preview" :src="foto2Preview" alt="Foto 2" class="preview-img" />
          <template v-else>
            <IconoLucide nombre="Camera" :tamano="24" />
            <span class="texto-caja-subida">Foto 2 (Detalle)</span>
            <span class="subtexto-caja-subida">Puesta o de cerca</span>
          </template>
          <input
            type="file"
            accept="image/*"
            class="sr-only"
            @change="manejarSubidaFoto($event, 2)"
          />
        </label>
      </div>
    </div>

    <!-- 8. Botones de Acción -->
    <div class="acciones-formulario">
      <button
        type="button"
        class="boton-cancelar"
        @click="$emit('cancelar')"
      >
        Cancelar
      </button>

      <BotonPrincipal tipo="submit">
        {{ modo === 'editar' ? 'Guardar Cambios' : 'Guardar Producto en Inventario' }}
      </BotonPrincipal>
    </div>
  </form>
</template>

<style scoped>
.formulario-producto {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.fila-dos-columnas {
  display: grid;
  grid-template-columns: 1fr;
  gap: 14px;
}

@media (min-width: 640px) {
  .fila-dos-columnas {
    grid-template-columns: 1fr 1fr;
  }
}

.grupo-campo {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.cabecera-campo-cat {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.boton-link-cat {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: none;
  border: none;
  font-size: 12px;
  font-weight: 700;
  color: var(--color-primario);
  cursor: pointer;
}

.boton-link-cat:hover {
  text-decoration: underline;
}

.caja-nueva-cat {
  display: flex;
  gap: 8px;
  margin-bottom: 6px;
}

.input-nueva-cat {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid var(--color-primario);
  border-radius: var(--radio-md);
  font-size: 12px;
  text-transform: uppercase;
  outline: none;
}

.boton-confirmar-cat {
  padding: 8px 14px;
  background-color: var(--color-primario);
  color: var(--color-blanco);
  border: none;
  border-radius: var(--radio-md);
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
}

.etiqueta-select {
  font-size: var(--tamano-cuerpo);
  font-weight: 600;
  color: var(--color-neutral-900);
}

.control-select,
.input-control {
  width: 100%;
  padding: 10px 14px;
  background-color: var(--color-blanco);
  border: 1px solid var(--color-neutral-200);
  border-radius: var(--radio-md);
  color: var(--color-neutral-900);
  font-size: var(--tamano-cuerpo);
  outline: none;
  transition: border-color var(--transicion-rapida);
}

.control-select:focus,
.input-control:focus {
  border-color: var(--color-primario);
}

.ayuda-subtexto {
  font-size: 11px;
  color: var(--color-neutral-600);
}

/* Caja de Switches */
.caja-switches {
  display: flex;
  flex-direction: column;
  gap: 12px;
  background-color: var(--color-neutral-50);
  padding: 14px 16px;
  border-radius: var(--radio-md);
  border: 1px solid var(--color-neutral-200);
}

.control-switch {
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  user-select: none;
}

.texto-switch {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.titulo-switch {
  font-size: 13px;
  font-weight: 700;
  color: var(--color-neutral-900);
}

.desc-switch {
  font-size: 11px;
  color: var(--color-neutral-600);
}

.deslizador-switch {
  position: relative;
  width: 44px;
  height: 24px;
  background-color: var(--color-neutral-300);
  border-radius: 20px;
  transition: background-color var(--transicion-rapida);
  flex-shrink: 0;
}

.deslizador-switch::after {
  content: '';
  position: absolute;
  top: 2px;
  left: 2px;
  width: 20px;
  height: 20px;
  background-color: #ffffff;
  border-radius: 50%;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
  transition: transform var(--transicion-rapida);
}

.deslizador-switch.activo-on {
  background-color: var(--color-exito, #16a34a);
}

.deslizador-switch.activo-on::after {
  transform: translateX(20px);
}

.deslizador-switch.prioridad.prioridad-on {
  background-color: #2563eb; /* Azul prioridad activa */
}

.deslizador-switch.prioridad.prioridad-on::after {
  transform: translateX(20px);
}

/* Carga de Fotos */
.seccion-carga-fotos {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.cuadricula-cajas-foto {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.caja-subida {
  position: relative;
  aspect-ratio: 1 / 1;
  border: 2px dashed var(--color-neutral-300);
  border-radius: var(--radio-md);
  background-color: var(--color-neutral-50);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  cursor: pointer;
  overflow: hidden;
  transition: all var(--transicion-rapida);
  text-align: center;
  padding: 8px;
  color: var(--color-neutral-600);
}

.caja-subida:hover {
  border-color: var(--color-primario);
  background-color: var(--color-primario-fondo);
  color: var(--color-primario);
}

.preview-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.texto-caja-subida {
  font-size: 12px;
  font-weight: 700;
}

.subtexto-caja-subida {
  font-size: 10px;
  color: var(--color-neutral-600);
}

.acciones-formulario {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 12px;
  padding-top: 12px;
  border-top: 1px solid var(--color-neutral-200);
}

.boton-cancelar {
  padding: 10px 16px;
  border-radius: var(--radio-md);
  color: var(--color-neutral-600);
  font-weight: 600;
  transition: background-color var(--transicion-rapida);
}

.boton-cancelar:hover {
  background-color: var(--color-neutral-200);
  color: var(--color-neutral-900);
}
</style>
