<script setup>
import { ref, computed } from 'vue'
import IconoLucide from '../common/IconoLucide.vue'

const props = defineProps({
  productos: {
    type: Array,
    required: true,
  },
  modelValue: {
    type: Object,
    default: null,
  },
})

const emit = defineEmits(['update:modelValue', 'seleccionar'])

const textoBusqueda = ref('')
const desplegableAbierto = ref(false)

const resultados = computed(() => {
  if (!textoBusqueda.value.trim()) return []
  const q = textoBusqueda.value.toLowerCase().trim()
  return props.productos.filter((p) => {
    return (
      p.nombre.toLowerCase().includes(q) ||
      p.categoria.toLowerCase().includes(q) ||
      p.material.toLowerCase().includes(q)
    )
  })
})

const elegirProducto = (joya) => {
  emit('update:modelValue', joya)
  emit('seleccionar', joya)
  textoBusqueda.value = ''
  desplegableAbierto.value = false
}

const limpiarSeleccion = () => {
  emit('update:modelValue', null)
  textoBusqueda.value = ''
}
</script>

<template>
  <div class="contenedor-buscador-producto">
    <label class="etiqueta-selector">Buscar Joya en Mostrador *</label>

    <!-- Fila cuando ya hay un producto seleccionado -->
    <div v-if="modelValue" class="tarjeta-joya-seleccionada">
      <img
        :src="modelValue.imagen"
        :alt="modelValue.nombre"
        class="miniatura-seleccionada"
      />
      <div class="detalles-seleccion">
        <span class="nombre-seleccion">{{ modelValue.nombre }}</span>
        <span class="precio-y-stock">
          Bs. {{ modelValue.precio_venta || modelValue.precio }} &bull; Stock físico:
          <strong>{{ modelValue.stockTienda !== undefined ? modelValue.stockTienda : modelValue.stock }} u.</strong>
        </span>
      </div>
      <button
        type="button"
        class="boton-cambiar"
        title="Cambiar producto"
        @click="limpiarSeleccion"
      >
        <IconoLucide nombre="X" :tamano="16" />
      </button>
    </div>

    <!-- Input de búsqueda cuando no hay selección -->
    <div v-else class="caja-input-busqueda">
      <div class="input-posicionado">
        <span class="icono-lupa">
          <IconoLucide nombre="Search" :tamano="18" />
        </span>
        <input
          v-model="textoBusqueda"
          type="text"
          placeholder="Escribe el nombre o categoría de la joya..."
          class="input-busqueda-mostrador"
          @focus="desplegableAbierto = true"
        />
      </div>

      <!-- Menú desplegable de coincidencias instantáneas -->
      <div
        v-if="desplegableAbierto && resultados.length > 0"
        class="menu-desplegable-resultados"
      >
        <button
          v-for="joya in resultados"
          :key="joya.id"
          type="button"
          class="item-resultado-btn"
          @click="elegirProducto(joya)"
        >
          <img :src="joya.imagen" :alt="joya.nombre" class="img-resultado" />
          <div class="info-resultado">
            <span class="titulo-resultado">{{ joya.nombre }}</span>
            <span class="metadato-resultado">
              {{ joya.categoria }} &bull; {{ joya.material }}
            </span>
          </div>
          <div class="precio-resultado">
            <span class="valor-resultado">Bs. {{ joya.precio_venta || joya.precio }}</span>
            <span class="stock-disponible">
              Stock: {{ joya.stockTienda !== undefined ? joya.stockTienda : joya.stock }} u.
            </span>
          </div>
        </button>
      </div>

      <div
        v-else-if="desplegableAbierto && textoBusqueda.trim() && resultados.length === 0"
        class="menu-desplegable-resultados vacio"
      >
        <span>No se encontraron coincidencias para "{{ textoBusqueda }}".</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.contenedor-buscador-producto {
  display: flex;
  flex-direction: column;
  gap: 6px;
  position: relative;
  width: 100%;
}

.etiqueta-selector {
  font-size: var(--tamano-cuerpo);
  font-weight: 600;
  color: var(--color-neutral-900);
}

.tarjeta-joya-seleccionada {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 14px;
  border-radius: var(--radio-md);
  border: 1px solid var(--color-neutral-200);
  background-color: var(--color-blanco);
  box-shadow: var(--sombra-sutil);
}

.miniatura-seleccionada {
  width: 44px;
  height: 44px;
  border-radius: var(--radio-sm);
  object-fit: cover;
  flex-shrink: 0;
  border: 1px solid var(--color-neutral-200);
}

.detalles-seleccion {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.nombre-seleccion {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-neutral-900);
}

.precio-y-stock {
  font-size: 12px;
  color: var(--color-neutral-600);
}

.boton-cambiar {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border-radius: var(--radio-sm);
  color: var(--color-neutral-600);
  transition: all var(--transicion-rapida);
}

.boton-cambiar:hover {
  background-color: var(--color-neutral-200);
  color: var(--color-neutral-900);
}

.caja-input-busqueda {
  position: relative;
  width: 100%;
}

.input-posicionado {
  display: flex;
  align-items: center;
  width: 100%;
  background-color: var(--color-blanco);
  border: 1px solid var(--color-neutral-200);
  border-radius: var(--radio-md);
  position: relative;
}

.input-posicionado:focus-within {
  border-color: var(--color-neutral-900);
  box-shadow: 0 0 0 1px var(--color-neutral-900);
}

.icono-lupa {
  position: absolute;
  left: 12px;
  display: flex;
  align-items: center;
  color: var(--color-neutral-600);
  pointer-events: none;
}

.input-busqueda-mostrador {
  width: 100%;
  padding: 12px 14px 12px 40px;
  border: none;
  background: transparent;
  color: var(--color-neutral-900);
  font-size: var(--tamano-cuerpo);
  outline: none;
}

.menu-desplegable-resultados {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  right: 0;
  max-height: 240px;
  overflow-y: auto;
  background-color: var(--color-blanco);
  border: 1px solid var(--color-neutral-200);
  border-radius: var(--radio-md);
  box-shadow: var(--sombra-tarjeta);
  z-index: 100;
  display: flex;
  flex-direction: column;
}

.menu-desplegable-resultados.vacio {
  padding: 16px;
  font-size: 13px;
  color: var(--color-neutral-600);
  text-align: center;
}

.item-resultado-btn {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 14px;
  border: none;
  border-bottom: 1px solid var(--color-neutral-200);
  background: transparent;
  cursor: pointer;
  text-align: left;
  transition: background-color var(--transicion-rapida);
}

.item-resultado-btn:last-child {
  border-bottom: none;
}

.item-resultado-btn:hover {
  background-color: var(--color-neutral-50);
}

.img-resultado {
  width: 36px;
  height: 36px;
  border-radius: var(--radio-sm);
  object-fit: cover;
  flex-shrink: 0;
  border: 1px solid var(--color-neutral-200);
}

.info-resultado {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.titulo-resultado {
  font-size: 13px;
  font-weight: 600;
  color: var(--color-neutral-900);
}

.metadato-resultado {
  font-size: 11px;
  color: var(--color-neutral-600);
}

.precio-resultado {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.valor-resultado {
  font-size: 13px;
  font-weight: 700;
  color: var(--color-neutral-900);
}

.stock-disponible {
  font-size: 10px;
  color: var(--color-exito);
  font-weight: 600;
}
</style>
