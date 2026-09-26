<script setup>
import { ref } from 'vue'
import { useInventarioStore } from '../stores/inventario'
import TablaInventario from '../components/admin/TablaInventario.vue'
import FormProducto from '../components/admin/FormProducto.vue'
import ModalBase from '../components/common/ModalBase.vue'
import BotonPrincipal from '../components/common/BotonPrincipal.vue'
import Buscador from '../components/catalogo/Buscador.vue'
import IconoLucide from '../components/common/IconoLucide.vue'

const inventarioStore = useInventarioStore()

// Modales
const modalAltaVisible = ref(false)
const modalTrasladoVisible = ref(false)
const joyaSeleccionada = ref(null)

// Datos del formulario de traslado
const cantidadTraslado = ref(1)
const origenTraslado = ref('central')
const destinoTraslado = ref('tienda')

const abrirAlta = () => {
  modalAltaVisible.value = true
}

const abrirTraslado = (joya) => {
  joyaSeleccionada.value = joya
  cantidadTraslado.value = 1
  origenTraslado.value = 'central'
  destinoTraslado.value = 'tienda'
  modalTrasladoVisible.value = true
}

const guardarNuevaJoya = (datos) => {
  inventarioStore.agregarProducto(datos)
  modalAltaVisible.value = false
}

const ejecutarTraslado = () => {
  if (!joyaSeleccionada.value) return

  const exito = inventarioStore.moverStock(
    joyaSeleccionada.value.id,
    origenTraslado.value,
    destinoTraslado.value,
    Number(cantidadTraslado.value)
  )

  if (exito) {
    modalTrasladoVisible.value = false
  } else {
    alert('Stock insuficiente en la sede de origen para realizar el traslado.')
  }
}
</script>

<template>
  <div class="pantalla-inventario">
    <!-- Encabezado con Botón de Alta -->
    <header class="cabecera-inventario">
      <div>
        <h1 class="titulo-vista">Inventario Multisede</h1>
        <p class="subtitulo-vista">
          Control de existencias entre Central (Dueña) y Tienda Física (Mercadito Creativo)
        </p>
      </div>

      <BotonPrincipal @click="abrirAlta">
        <template #iconoIzquierda>
          <IconoLucide nombre="Plus" :tamano="18" />
        </template>
        <span>Nueva Joya</span>
      </BotonPrincipal>
    </header>

    <!-- Barra de Búsqueda y Filtros de Inventario -->
    <div class="barra-herramientas">
      <div class="buscador-ancho">
        <Buscador
          v-model="inventarioStore.busqueda"
          placeholder="Buscar joya por nombre o categoría..."
        />
      </div>
    </div>

    <!-- Tabla Principal de Existencias -->
    <TablaInventario
      :items="inventarioStore.itemsFiltrados"
      @mover-stock="abrirTraslado"
      @editar="(joya) => alert(`Modo edición para: ${joya.nombre}`)"
    />

    <!-- Modal 1: Alta de Joya -->
    <ModalBase
      :visible="modalAltaVisible"
      titulo="Registrar Nueva Joya en Inventario"
      ancho-maximo="560px"
      @cerrar="modalAltaVisible = false"
    >
      <FormProducto
        @guardar="guardarNuevaJoya"
        @cancelar="modalAltaVisible = false"
      />
    </ModalBase>

    <!-- Modal 2: Traslado Rápido entre Sedes -->
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
            <span class="etiqueta-sede">Stock Central (Dueña)</span>
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
            <option value="central">De Central (Dueña) ➔ Hacia Tienda (Mercadito Creativo)</option>
            <option value="tienda">De Tienda (Mercadito Creativo) ➔ Hacia Central (Dueña)</option>
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
  font-weight: 700;
  color: var(--color-neutral-900);
}

.subtitulo-vista {
  font-size: var(--tamano-cuerpo);
  color: var(--color-neutral-600);
}

.barra-herramientas {
  display: flex;
  align-items: center;
  gap: 16px;
}

.buscador-ancho {
  width: 100%;
  max-width: 480px;
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
  font-weight: 500;
}

.cifra-sede {
  font-size: 18px;
  font-weight: 700;
  color: var(--color-neutral-900);
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
  font-size: var(--tamano-cuerpo);
  color: var(--color-neutral-900);
  outline: none;
  transition: border-color var(--transicion-rapida);
}

.control-select:focus,
.input-control:focus {
  border-color: var(--color-neutral-900);
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
</style>
