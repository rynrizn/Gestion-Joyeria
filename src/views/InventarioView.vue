<script setup>
import { ref, computed, onMounted } from 'vue'
import { useInventarioStore } from '../stores/inventario'
import { useProductosStore } from '../stores/productos'
import { useAuthStore } from '../stores/auth'
import TablaInventario from '../components/admin/TablaInventario.vue'
import FormProducto from '../components/admin/FormProducto.vue'
import ModalBase from '../components/common/ModalBase.vue'
import ModalAlerta from '../components/common/ModalAlerta.vue'
import BotonPrincipal from '../components/common/BotonPrincipal.vue'
import Buscador from '../components/catalogo/Buscador.vue'
import IconoLucide from '../components/common/IconoLucide.vue'

const inventarioStore = useInventarioStore()
const productosStore = useProductosStore()
const authStore = useAuthStore()

onMounted(async () => {
  await inventarioStore.cargarInventarioSupabase()
})

const categoriasParaFiltro = computed(() => {
  return productosStore.categorias.filter((c) => c !== 'TODOS')
})

// Modales
const modalAltaVisible = ref(false)
const modalEdicionVisible = ref(false)
const modalTrasladoVisible = ref(false)
const modalConfirmarEliminarVisible = ref(false)
const joyaSeleccionada = ref(null)
const joyaEnEdicion = ref(null)
const joyaParaEliminar = ref(null)

// Modal de Error / Feedback
const modalErrorVisible = ref(false)
const modalErrorTitulo = ref('')
const modalErrorMensaje = ref('')
const modalErrorDetalles = ref('')

// Datos del formulario de traslado
const cantidadTraslado = ref(1)
const origenTraslado = ref('central')
const destinoTraslado = ref('tienda')

const abrirAlta = () => {
  if (!authStore.esAdmin) {
    modalErrorTitulo.value = 'Permiso Denegado'
    modalErrorMensaje.value = 'Solo la Administradora tiene autorización para dar de alta nuevos productos en el inventario.'
    modalErrorDetalles.value = ''
    modalErrorVisible.value = true
    return
  }
  modalAltaVisible.value = true
}

const abrirEdicion = (joya) => {
  if (!authStore.esAdmin) {
    modalErrorTitulo.value = 'Permiso Denegado'
    modalErrorMensaje.value = 'Solo la Administradora tiene autorización para editar los datos o precios de los productos.'
    modalErrorDetalles.value = ''
    modalErrorVisible.value = true
    return
  }
  joyaEnEdicion.value = joya
  modalEdicionVisible.value = true
}

const abrirTraslado = (joya) => {
  if (!authStore.esAdmin) {
    modalErrorTitulo.value = 'Permiso Denegado'
    modalErrorMensaje.value = 'Solo la Administradora puede autorizar y realizar traslados de stock entre sedes.'
    modalErrorDetalles.value = ''
    modalErrorVisible.value = true
    return
  }
  joyaSeleccionada.value = joya
  cantidadTraslado.value = 1
  origenTraslado.value = 'central'
  destinoTraslado.value = 'tienda'
  modalTrasladoVisible.value = true
}

const guardarNuevaJoya = async (datos) => {
  const prod = await productosStore.agregarProducto(datos)
  inventarioStore.agregarProducto({ ...datos, id: prod?.id })
  modalAltaVisible.value = false
}

const guardarEdicionJoya = async (datos) => {
  await productosStore.actualizarProducto(datos.id, datos)
  inventarioStore.actualizarProducto(datos.id, datos)
  modalEdicionVisible.value = false
  joyaEnEdicion.value = null
}

const abrirEliminar = (joya) => {
  if (!authStore.esAdmin) {
    modalErrorTitulo.value = 'Permiso Denegado'
    modalErrorMensaje.value = 'Solo la Administradora tiene autorización para eliminar productos del sistema.'
    modalErrorDetalles.value = ''
    modalErrorVisible.value = true
    return
  }
  joyaParaEliminar.value = joya
  modalConfirmarEliminarVisible.value = true
}

const confirmarEliminarJoya = async () => {
  if (!joyaParaEliminar.value) return

  const id = joyaParaEliminar.value.id
  const nombreProd = joyaParaEliminar.value.nombre

  const resInv = await inventarioStore.eliminarProducto(id)
  const resProd = await productosStore.eliminarProducto(id)

  modalConfirmarEliminarVisible.value = false
  joyaParaEliminar.value = null

  if ((resInv && !resInv.exito) || (resProd && !resProd.exito)) {
    modalErrorTitulo.value = 'No se puede eliminar'
    modalErrorMensaje.value = `El producto "${nombreProd}" tiene ventas, reservas o movimientos registrados en la base de datos y no puede borrarse físicamente.`
    modalErrorDetalles.value = 'Recomendación: En lugar de borrarlo, edítalo y desactiva el switch "Producto Activo" para ocultarlo del catálogo público sin alterar el historial contable.'
    modalErrorVisible.value = true
  }
}

const ejecutarTraslado = () => {
  if (!joyaSeleccionada.value) return

  const stockDisponible = origenTraslado.value === 'central'
    ? joyaSeleccionada.value.stockCentral
    : joyaSeleccionada.value.stockTienda

  if (Number(cantidadTraslado.value) > stockDisponible) {
    modalErrorTitulo.value = 'Stock Insuficiente en Origen'
    modalErrorMensaje.value = `No es posible trasladar ${cantidadTraslado.value} unidades. La sede de origen solo dispone de ${stockDisponible} unidad(es).`
    modalErrorDetalles.value = `Origen: ${origenTraslado.value === 'central' ? 'Stock Central' : 'Tienda (Mercadito Creativo)'}`
    modalErrorVisible.value = true
    return
  }

  const exito = inventarioStore.moverStock(
    joyaSeleccionada.value.id,
    origenTraslado.value,
    destinoTraslado.value,
    Number(cantidadTraslado.value)
  )

  if (exito) {
    modalTrasladoVisible.value = false
  } else {
    modalErrorTitulo.value = 'Error en el Traslado'
    modalErrorMensaje.value = 'Ocurrió un error al procesar el movimiento de existencias.'
    modalErrorDetalles.value = ''
    modalErrorVisible.value = true
  }
}
</script>

<template>
  <div class="pantalla-inventario">
    <!-- Encabezado con Indicador de Rol y Botón de Alta -->
    <header class="cabecera-inventario">
      <div>
        <h1 class="titulo-vista">Inventario Multisede</h1>
        <p class="subtitulo-vista">
          Control de existencias entre Stock Central y Tienda Física (Mercadito Creativo)
        </p>
      </div>

      <div class="acciones-cabecera">
        <!-- Badge informativo de permisos -->
        <span
          class="badge-permiso"
          :class="authStore.esAdmin ? 'badge-admin' : 'badge-vendedora'"
        >
          <IconoLucide :nombre="authStore.esAdmin ? 'ShieldCheck' : 'Eye'" :tamano="14" />
          <span>{{ authStore.esAdmin ? 'Permiso Total: Administradora' : 'Solo Consulta: Personal de Tienda' }}</span>
        </span>

        <!-- Botón de Alta (Solo Dueña) -->
        <BotonPrincipal v-if="authStore.esAdmin" @click="abrirAlta">
          <template #iconoIzquierda>
            <IconoLucide nombre="Plus" :tamano="18" />
          </template>
          <span>Nuevo Producto</span>
        </BotonPrincipal>
      </div>
    </header>

    <!-- Barra de Búsqueda y Filtros de Inventario -->
    <div class="barra-herramientas">
      <div class="buscador-ancho">
        <Buscador
          v-model="inventarioStore.busqueda"
          placeholder="Buscar producto por nombre, material o categoría..."
        />
      </div>

      <!-- Filtro por Categoría -->
      <div class="selector-filtro">
        <select v-model="inventarioStore.filtroCategoria" class="control-select-filtro">
          <option value="TODAS">Todas las categorías</option>
          <option
            v-for="cat in categoriasParaFiltro"
            :key="cat"
            :value="cat"
          >
            {{ cat }}
          </option>
        </select>
      </div>

      <!-- Selector de Ordenamiento -->
      <div class="selector-filtro">
        <select v-model="inventarioStore.ordenSeleccionado" class="control-select-filtro">
          <option value="az">Orden: Nombre (A - Z)</option>
          <option value="za">Orden: Nombre (Z - A)</option>
          <option value="precio_desc">Orden: Precio (Mayor a Menor)</option>
          <option value="precio_asc">Orden: Precio (Menor a Mayor)</option>
        </select>
      </div>
    </div>

    <!-- Tabla Principal de Existencias con Control de Permisos -->
    <TablaInventario
      :items="inventarioStore.itemsFiltrados"
      :es-admin="authStore.esAdmin"
      @mover-stock="abrirTraslado"
      @editar="abrirEdicion"
      @eliminar="abrirEliminar"
    />

    <!-- Modal 1: Alta de Producto (Solo Dueña) -->
    <ModalBase
      :visible="modalAltaVisible"
      titulo="Registrar Nuevo Producto en Inventario"
      ancho-maximo="560px"
      @cerrar="modalAltaVisible = false"
    >
      <FormProducto
        modo="crear"
        @guardar="guardarNuevaJoya"
        @cancelar="modalAltaVisible = false"
      />
    </ModalBase>

    <!-- Modal 2: Edición Completa de Producto (Solo Dueña) -->
    <ModalBase
      :visible="modalEdicionVisible"
      :titulo="`Editar Producto: ${joyaEnEdicion?.nombre || ''}`"
      ancho-maximo="560px"
      @cerrar="modalEdicionVisible = false"
    >
      <FormProducto
        v-if="joyaEnEdicion"
        modo="editar"
        :producto-inicial="joyaEnEdicion"
        @guardar="guardarEdicionJoya"
        @cancelar="modalEdicionVisible = false"
      />
    </ModalBase>

    <!-- Modal 3: Traslado Rápido entre Sedes (Solo Dueña) -->
    <ModalBase
      :visible="modalTrasladoVisible"
      :titulo="`Trasladar Stock: ${joyaSeleccionada?.nombre || ''}`"
      ancho-maximo="460px"
      @cerrar="modalTrasladoVisible = false"
    >
      <div v-if="joyaSeleccionada" class="cuerpo-modal-traslado">
        <!-- Resumen de existencias actuales -->
        <div class="resumen-sedes">
          <div class="caja-sede">
            <span class="etiqueta-sede">Stock Central</span>
            <span class="cifra-sede">{{ joyaSeleccionada.stockCentral }} u.</span>
          </div>
          <div class="flecha-indicadora">
            <IconoLucide nombre="ArrowRight" :tamano="20" />
          </div>
          <div class="caja-sede">
            <span class="etiqueta-sede">Stock Tienda (Físico)</span>
            <span class="cifra-sede">{{ joyaSeleccionada.stockTienda }} u.</span>
          </div>
        </div>

        <!-- Dirección del traslado -->
        <div class="grupo-campo">
          <label class="etiqueta-campo">Dirección del movimiento *</label>
          <select
            v-model="origenTraslado"
            class="control-select"
            @change="destinoTraslado = origenTraslado === 'central' ? 'tienda' : 'central'"
          >
            <option value="central">De Stock Central ➔ Hacia Tienda (Mercadito Creativo)</option>
            <option value="tienda">De Tienda (Mercadito Creativo) ➔ Hacia Stock Central</option>
          </select>
        </div>

        <!-- Cantidad a trasladar -->
        <div class="grupo-campo">
          <label class="etiqueta-campo">Cantidad de unidades a mover *</label>
          <input
            v-model.number="cantidadTraslado"
            type="number"
            min="1"
            :max="origenTraslado === 'central' ? joyaSeleccionada.stockCentral : joyaSeleccionada.stockTienda"
            class="input-control"
          />
          <span class="ayuda-stock">
            Disponible en origen:
            <strong>
              {{ origenTraslado === 'central' ? joyaSeleccionada.stockCentral : joyaSeleccionada.stockTienda }} u.
            </strong>
          </span>
        </div>

        <!-- Botones de Acción -->
        <div class="acciones-traslado">
          <button
            type="button"
            class="boton-cancelar"
            @click="modalTrasladoVisible = false"
          >
            Cancelar
          </button>
          <BotonPrincipal @click="ejecutarTraslado">
            Confirmar Traslado
          </BotonPrincipal>
        </div>
      </div>
    </ModalBase>

    <!-- Modal 5: Confirmación de Eliminación de Producto (Solo Dueña) -->
    <ModalBase
      :visible="modalConfirmarEliminarVisible"
      titulo="Eliminar Producto"
      ancho-maximo="460px"
      @cerrar="modalConfirmarEliminarVisible = false"
    >
      <div v-if="joyaParaEliminar" class="cuerpo-modal-eliminar">
        <p class="texto-confirmar-eliminar">
          ¿Estás segura de eliminar permanentemente la joya
          <strong>"{{ joyaParaEliminar.nombre }}"</strong>?
        </p>
        <p class="advertencia-eliminar">
          Esta acción removerá el producto de la base de datos, el inventario y el catálogo.
        </p>
        <div class="acciones-eliminar">
          <button
            type="button"
            class="boton-cancelar"
            @click="modalConfirmarEliminarVisible = false"
          >
            Cancelar
          </button>
          <BotonPrincipal variante="peligro" @click="confirmarEliminarJoya">
            Sí, Eliminar Producto
          </BotonPrincipal>
        </div>
      </div>
    </ModalBase>

    <!-- Modal 4: Modal de Alerta y Errores de Inventario -->
    <ModalAlerta
      :visible="modalErrorVisible"
      tipo="error"
      :titulo="modalErrorTitulo"
      :mensaje="modalErrorMensaje"
      :detalles="modalErrorDetalles"
      texto-boton="Entendido"
      @cerrar="modalErrorVisible = false"
    />
  </div>
</template>

<style scoped>
.pantalla-inventario {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.cabecera-inventario {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 16px;
}

.titulo-vista {
  font-size: var(--tamano-h1-escritorio);
  font-weight: 800;
  color: var(--color-primario);
}

.subtitulo-vista {
  font-size: var(--tamano-cuerpo);
  color: var(--color-neutral-600);
}

.acciones-cabecera {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.badge-permiso {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 700;
  padding: 6px 12px;
  border-radius: var(--radio-md);
}

.badge-permiso.badge-admin {
  background-color: var(--color-primario-fondo);
  color: var(--color-primario);
  border: 1px solid rgba(62, 18, 24, 0.2);
}

.badge-permiso.badge-vendedora {
  background-color: var(--color-neutral-100);
  color: var(--color-neutral-600);
  border: 1px solid var(--color-neutral-200);
}

.barra-herramientas {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.buscador-ancho {
  flex: 1;
  min-width: 260px;
}

.selector-filtro {
  min-width: 190px;
}

.control-select-filtro {
  width: 100%;
  padding: 10px 14px;
  background-color: var(--color-blanco);
  border: 1px solid var(--color-neutral-200);
  border-radius: var(--radio-md);
  font-size: var(--tamano-cuerpo);
  color: var(--color-neutral-900);
  outline: none;
  cursor: pointer;
  transition: border-color var(--transicion-rapida);
}

.control-select-filtro:focus {
  border-color: var(--color-primario);
}

/* Modal de Traslado */
.cuerpo-modal-traslado {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.resumen-sedes {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: var(--color-neutral-50);
  border: 1px solid var(--color-neutral-200);
  border-radius: var(--radio-md);
  padding: 14px 16px;
}

.caja-sede {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.etiqueta-sede {
  font-size: 11px;
  color: var(--color-neutral-600);
  font-weight: 600;
}

.cifra-sede {
  font-size: 18px;
  font-weight: 800;
  color: var(--color-primario);
}

.flecha-indicadora {
  color: var(--color-neutral-600);
}

.grupo-campo {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.etiqueta-campo {
  font-size: var(--tamano-cuerpo);
  font-weight: 700;
  color: var(--color-neutral-900);
}

.control-select,
.input-control {
  width: 100%;
  padding: 10px 14px;
  background-color: var(--color-blanco);
  border: 1px solid var(--color-neutral-200);
  border-radius: var(--radio-md);
  font-size: var(--tamano-cuerpo);
  color: var(--color-neutral-900);
  outline: none;
  transition: border-color var(--transicion-rapida);
}

.control-select:focus,
.input-control:focus {
  border-color: var(--color-primario);
}

.ayuda-stock {
  font-size: 12px;
  color: var(--color-neutral-600);
}

.acciones-traslado {
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

.cuerpo-modal-eliminar {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.texto-confirmar-eliminar {
  font-size: 15px;
  color: var(--color-neutral-800);
  line-height: 1.5;
}

.advertencia-eliminar {
  font-size: 13px;
  color: var(--color-neutral-600);
  background-color: var(--color-neutral-50);
  padding: 10px 14px;
  border-radius: var(--radio-md);
  border: 1px solid var(--color-neutral-200);
}

.acciones-eliminar {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 8px;
}
</style>
