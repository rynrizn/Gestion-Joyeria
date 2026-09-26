<script setup>
import { ref } from 'vue'
import { useClientesStore } from '../stores/clientes'
import { useProductosStore } from '../stores/productos'
import { useReservasStore } from '../stores/reservas'
import TablaClientes from '../components/admin/TablaClientes.vue'
import BuscadorProducto from '../components/admin/BuscadorProducto.vue'
import Buscador from '../components/catalogo/Buscador.vue'
import ModalBase from '../components/common/ModalBase.vue'
import BotonPrincipal from '../components/common/BotonPrincipal.vue'
import InputTexto from '../components/common/InputTexto.vue'
import IconoLucide from '../components/common/IconoLucide.vue'

const clientesStore = useClientesStore()
const productosStore = useProductosStore()
const reservasStore = useReservasStore()

// Modales
const modalNuevoClienteVisible = ref(false)
const modalReservaVisible = ref(false)

// Formulario Nuevo Cliente
const nuevoNombre = ref('')
const nuevoTelefono = ref('')
const nuevoTipo = ref('NUEVA')
const nuevoNotas = ref('')

// Formulario de Reserva Temporal
const clienteReserva = ref(null)
const joyaReserva = ref(null)
const cantidadReserva = ref(1)
const plazoReserva = ref('Quedan 24h')

const abrirModalNuevoCliente = () => {
  nuevoNombre.value = ''
  nuevoTelefono.value = ''
  nuevoTipo.value = 'NUEVA'
  nuevoNotas.value = ''
  modalNuevoClienteVisible.value = true
}

const abrirModalReserva = (cliente) => {
  clienteReserva.value = cliente
  joyaReserva.value = null
  cantidadReserva.value = 1
  plazoReserva.value = 'Quedan 24h'
  modalReservaVisible.value = true
}

const guardarNuevoCliente = () => {
  if (!nuevoNombre.value.trim()) {
    alert('Por favor ingresa el nombre de la clienta.')
    return
  }

  clientesStore.registrarCliente({
    nombre: nuevoNombre.value,
    telefono: nuevoTelefono.value,
    tipo: nuevoTipo.value,
    notas: nuevoNotas.value,
  })

  modalNuevoClienteVisible.value = false
}

const confirmarReservaTemporal = () => {
  if (!clienteReserva.value || !joyaReserva.value) {
    alert('Por favor selecciona la joya a apartar.')
    return
  }

  const precioUnitario = Number(joyaReserva.value.precio_venta || joyaReserva.value.precio || 0)
  const total = precioUnitario * Number(cantidadReserva.value)

  reservasStore.crearReserva({
    cliente: clienteReserva.value.nombre,
    telefono: clienteReserva.value.telefono,
    tipoCliente: clienteReserva.value.tipo,
    producto: joyaReserva.value.nombre,
    idProducto: joyaReserva.value.id,
    cantidad: cantidadReserva.value,
    montoTotal: total,
    plazo: plazoReserva.value,
  })

  alert(`¡Reserva creada exitosamente para ${clienteReserva.value.nombre}!`)
  modalReservaVisible.value = false
}

const contactarWhatsApp = (cliente) => {
  if (!cliente.telefono) return
  const url = `https://wa.me/591${cliente.telefono}?text=Hola%20${encodeURIComponent(cliente.nombre)},%20te%20escribimos%20de%20Moonstone%20Joyer%C3%ADa.`
  window.open(url, '_blank')
}
</script>

<template>
  <div class="pantalla-clientes">
    <!-- Cabecera -->
    <header class="cabecera-clientes">
      <div>
        <h1 class="titulo-vista">Directorio de Clientas y Reservas</h1>
        <p class="subtitulo-vista">
          Registro de confianza de clientas y creación de apartados bajo palabra o con seña
        </p>
      </div>

      <BotonPrincipal @click="abrirModalNuevoCliente">
        <template #iconoIzquierda>
          <IconoLucide nombre="UserPlus" :tamano="18" />
        </template>
        <span>Nueva Clienta</span>
      </BotonPrincipal>
    </header>

    <!-- Barra de Búsqueda -->
    <div class="barra-herramientas">
      <div class="buscador-ancho">
        <Buscador
          v-model="clientesStore.busqueda"
          placeholder="Buscar por nombre o número de WhatsApp..."
        />
      </div>
    </div>

    <!-- Tabla de Clientas -->
    <TablaClientes
      :clientes="clientesStore.clientesFiltrados"
      @crear-reserva="abrirModalReserva"
      @contactar="contactarWhatsApp"
    />

    <!-- Modal 1: Registro de Nueva Clienta -->
    <ModalBase
      :visible="modalNuevoClienteVisible"
      titulo="Registrar Nueva Clienta"
      ancho-maximo="480px"
      @cerrar="modalNuevoClienteVisible = false"
    >
      <form class="formulario-cliente" @submit.prevent="guardarNuevoCliente">
        <InputTexto
          v-model="nuevoNombre"
          etiqueta="Nombre y Apellidos *"
          placeholder="Ej. Valeria Castro"
          requerido
        />

        <InputTexto
          v-model="nuevoTelefono"
          tipo="tel"
          etiqueta="Número de WhatsApp *"
          placeholder="Ej. 71234567"
        />

        <div class="campo-select">
          <label class="etiqueta-select">Nivel de confianza de la clienta</label>
          <select v-model="nuevoTipo" class="control-select">
            <option value="NUEVA">Cliente Nueva (Requiere pago total o seña)</option>
            <option value="HABITUAL">Cliente Habitual (Permite reserva sin seña bajo palabra)</option>
          </select>
        </div>

        <InputTexto
          v-model="nuevoNotas"
          etiqueta="Notas sobre gustos o preferencias"
          placeholder="Ej. Le gustan las cadenas de acero dorado"
        />

        <div class="acciones-modal">
          <button
            type="button"
            class="boton-cancelar"
            @click="modalNuevoClienteVisible = false"
          >
            Cancelar
          </button>
          <BotonPrincipal tipo="submit">
            Guardar Clienta
          </BotonPrincipal>
        </div>
      </form>
    </ModalBase>

    <!-- Modal 2: Crear Reserva Temporal -->
    <ModalBase
      :visible="modalReservaVisible"
      :titulo="`Crear Reserva para: ${clienteReserva?.nombre || ''}`"
      ancho-maximo="520px"
      @cerrar="modalReservaVisible = false"
    >
      <div v-if="clienteReserva" class="cuerpo-modal-reserva">
        <!-- Badge de Confianza del Cliente -->
        <div class="aviso-confianza" :class="clienteReserva.tipo === 'HABITUAL' ? 'habitual' : 'nueva'">
          <IconoLucide :nombre="clienteReserva.tipo === 'HABITUAL' ? 'ShieldCheck' : 'AlertCircle'" :tamano="18" />
          <div class="texto-aviso">
            <strong>{{ clienteReserva.tipo === 'HABITUAL' ? 'Clienta de Confianza' : 'Clienta Nueva' }}</strong>
            <p>
              {{
                clienteReserva.tipo === 'HABITUAL'
                  ? 'Permite apartar piezas hasta 48 horas sin anticipo previo.'
                  : 'Se recomienda exigir el pago completo o seña por QR antes de apartar.'
              }}
            </p>
          </div>
        </div>

        <!-- Selector de Joya -->
        <BuscadorProducto
          v-model="joyaReserva"
          :productos="productosStore.productos"
        />

        <!-- Cantidad y Plazo -->
        <div class="fila-dos-campos">
          <div class="campo-grupo">
            <label class="etiqueta-campo">Cantidad a apartar *</label>
            <input
              v-model.number="cantidadReserva"
              type="number"
              min="1"
              max="5"
              class="input-control"
            />
          </div>

          <div class="campo-grupo">
            <label class="etiqueta-campo">Plazo límite de retiro *</label>
            <select v-model="plazoReserva" class="control-select">
              <option value="Quedan 24h">24 horas (Recomendado)</option>
              <option value="Quedan 48h">48 horas (Clientas habituales)</option>
              <option value="Quedan 3h">3 horas (Fin de turno)</option>
            </select>
          </div>
        </div>

        <!-- Resumen de Importe -->
        <div v-if="joyaReserva" class="resumen-reserva-caja">
          <span>Total a Pagar al Retirar:</span>
          <strong class="precio-reserva-total">
            Bs. {{ Number(joyaReserva.precio_venta || joyaReserva.precio) * cantidadReserva }}
          </strong>
        </div>

        <!-- Acciones -->
        <div class="acciones-modal">
          <button
            type="button"
            class="boton-cancelar"
            @click="modalReservaVisible = false"
          >
            Cancelar
          </button>
          <BotonPrincipal
            :deshabilitado="!joyaReserva"
            @click="confirmarReservaTemporal"
          >
            Confirmar Apartado
          </BotonPrincipal>
        </div>
      </div>
    </ModalBase>
  </div>
</template>

<style scoped>
.pantalla-clientes {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.cabecera-clientes {
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

.formulario-cliente {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.campo-select {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.etiqueta-select {
  font-size: var(--tamano-cuerpo);
  font-weight: 600;
  color: var(--color-neutral-900);
}

.control-select {
  width: 100%;
  padding: 10px 14px;
  background-color: var(--color-blanco);
  border: 1px solid var(--color-neutral-200);
  border-radius: var(--radio-md);
  font-size: var(--tamano-cuerpo);
  color: var(--color-neutral-900);
  outline: none;
}

.control-select:focus {
  border-color: var(--color-neutral-900);
}

.acciones-modal {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 12px;
  padding-top: 14px;
  border-top: 1px solid var(--color-neutral-200);
}

.boton-cancelar {
  padding: 10px 16px;
  border-radius: var(--radio-md);
  color: var(--color-neutral-600);
  font-weight: 600;
}

.boton-cancelar:hover {
  background-color: var(--color-neutral-200);
  color: var(--color-neutral-900);
}

/* Modal de Reserva */
.cuerpo-modal-reserva {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.aviso-confianza {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px 14px;
  border-radius: var(--radio-md);
  font-size: 13px;
}

.aviso-confianza.habitual {
  background-color: var(--color-exito-fondo);
  color: var(--color-exito);
  border: 1px solid rgba(22, 163, 74, 0.2);
}

.aviso-confianza.nueva {
  background-color: var(--color-alerta-fondo);
  color: var(--color-alerta);
  border: 1px solid rgba(217, 119, 6, 0.2);
}

.texto-aviso p {
  color: inherit;
  font-size: 12px;
  margin-top: 2px;
}

.fila-dos-campos {
  display: grid;
  grid-template-columns: 1fr;
  gap: 14px;
}

@media (min-width: 480px) {
  .fila-dos-campos {
    grid-template-columns: 1fr 1fr;
  }
}

.campo-grupo {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.etiqueta-campo {
  font-size: var(--tamano-cuerpo);
  font-weight: 600;
  color: var(--color-neutral-900);
}

.input-control {
  width: 100%;
  padding: 10px 14px;
  background-color: var(--color-blanco);
  border: 1px solid var(--color-neutral-200);
  border-radius: var(--radio-md);
  font-size: var(--tamano-cuerpo);
  color: var(--color-neutral-900);
  outline: none;
}

.resumen-reserva-caja {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background-color: var(--color-neutral-50);
  border: 1px solid var(--color-neutral-200);
  border-radius: var(--radio-md);
  font-size: 14px;
}

.precio-reserva-total {
  font-size: 18px;
  color: var(--color-neutral-900);
}
</style>
