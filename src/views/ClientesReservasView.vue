<script setup>
import { ref, computed } from 'vue'
import { useClientesStore } from '../stores/clientes'
import { useProductosStore } from '../stores/productos'
import { useReservasStore } from '../stores/reservas'
import { useVentasStore } from '../stores/ventas'
import { useAuthStore } from '../stores/auth'
import TablaClientes from '../components/admin/TablaClientes.vue'
import BuscadorProducto from '../components/admin/BuscadorProducto.vue'
import Buscador from '../components/catalogo/Buscador.vue'
import ModalBase from '../components/common/ModalBase.vue'
import ModalAlerta from '../components/common/ModalAlerta.vue'
import BotonPrincipal from '../components/common/BotonPrincipal.vue'
import InputTexto from '../components/common/InputTexto.vue'
import IconoLucide from '../components/common/IconoLucide.vue'

const clientesStore = useClientesStore()
const productosStore = useProductosStore()
const reservasStore = useReservasStore()
const ventasStore = useVentasStore()
const authStore = useAuthStore()

// Modales
const modalNuevoClienteVisible = ref(false)
const modalEditarClienteVisible = ref(false)
const modalReservaVisible = ref(false)
const modalHistorialVisible = ref(false)
const clientaHistorial = ref(null)
const clientaEnEdicion = ref(null)

// Formulario de Edición de Clienta (Solo Dueña)
const editNombre = ref('')
const editTelefono = ref('')
const editCI = ref('')
const editCompras = ref(0)
const editNotas = ref('')

// Modal de Error / Feedback
const modalErrorVisible = ref(false)
const modalErrorTitulo = ref('')
const modalErrorMensaje = ref('')
const modalErrorDetalles = ref('')

// Formulario Nuevo Cliente
const nuevoNombre = ref('')
const nuevoTelefono = ref('')
const nuevoCI = ref('')
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
  nuevoCI.value = ''
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

const abrirModalHistorial = (cliente) => {
  clientaHistorial.value = cliente
  modalHistorialVisible.value = true
}

// Historial de compras filtrado bajo demanda para la clienta seleccionada
const comprasClienta = computed(() => {
  if (!clientaHistorial.value) return []
  const nombreLimpio = clientaHistorial.value.nombre.toLowerCase().trim()
  const primerNombre = nombreLimpio.split(' ')[0]

  return ventasStore.ventas.filter((v) => {
    const cliVenta = (v.cliente || '').toLowerCase()
    return cliVenta.includes(nombreLimpio) || (primerNombre.length > 2 && cliVenta.includes(primerNombre))
  })
})

const totalInvertidoClienta = computed(() => {
  return comprasClienta.value.reduce((acc, v) => acc + Number(v.montoTotal || 0), 0)
})

const guardarNuevoCliente = () => {
  if (!nuevoNombre.value.trim()) {
    modalErrorTitulo.value = 'Nombre Obligatorio'
    modalErrorMensaje.value = 'Por favor ingresa al menos el nombre de la clienta.'
    modalErrorDetalles.value = ''
    modalErrorVisible.value = true
    return
  }

  clientesStore.registrarCliente({
    nombre: nuevoNombre.value,
    telefono: nuevoTelefono.value,
    ci: nuevoCI.value,
    tipo: nuevoTipo.value,
    notas: nuevoNotas.value,
  })

  modalNuevoClienteVisible.value = false
}

const abrirModalEdicionCliente = (cliente) => {
  if (!authStore.esAdmin) {
    modalErrorTitulo.value = 'Permiso Denegado'
    modalErrorMensaje.value = 'Solo la Administradora tiene autorización para modificar la información de las clientas.'
    modalErrorDetalles.value = ''
    modalErrorVisible.value = true
    return
  }

  clientaEnEdicion.value = cliente
  editNombre.value = cliente.nombre || ''
  editTelefono.value = cliente.telefono || cliente.contacto_telefono || ''
  editCI.value = cliente.ci || ''
  editCompras.value = Number(cliente.cantidadCompras || 0)
  editNotas.value = cliente.notas || ''
  modalEditarClienteVisible.value = true
}

const guardarEdicionCliente = () => {
  if (!editNombre.value.trim()) {
    modalErrorTitulo.value = 'Nombre Obligatorio'
    modalErrorMensaje.value = 'Por favor ingresa el nombre de la clienta.'
    modalErrorDetalles.value = ''
    modalErrorVisible.value = true
    return
  }

  clientesStore.actualizarCliente(clientaEnEdicion.value.id, {
    nombre: editNombre.value,
    telefono: editTelefono.value,
    contacto_telefono: editTelefono.value,
    ci: editCI.value,
    cantidadCompras: Number(editCompras.value),
    notas: editNotas.value,
  })

  modalEditarClienteVisible.value = false
  clientaEnEdicion.value = null
}

const confirmarReservaTemporal = () => {
  if (!clienteReserva.value || !joyaReserva.value) {
    modalErrorTitulo.value = 'Joya Requerida'
    modalErrorMensaje.value = 'Por favor selecciona la joya que deseas apartar.'
    modalErrorDetalles.value = ''
    modalErrorVisible.value = true
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
        <h1 class="titulo-vista">Directorio de Clientas</h1>
        <p class="subtitulo-vista">
          Historial de compras bajo demanda, registro de confianza y creación de apartados
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
          placeholder="Buscar por nombre, CI o número de WhatsApp..."
        />
      </div>
    </div>

    <!-- Tabla de Clientas con Acción de Ver Historial y Edición (Dueña) -->
    <TablaClientes
      :clientes="clientesStore.clientesFiltrados"
      :es-admin="authStore.esAdmin"
      @crear-reserva="abrirModalReserva"
      @contactar="contactarWhatsApp"
      @ver-historial="abrirModalHistorial"
      @editar="abrirModalEdicionCliente"
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
          placeholder="Ej. Valeria Castro Pinto"
          requerido
        />

        <div class="fila-dos-inputs">
          <InputTexto
            v-model="nuevoTelefono"
            tipo="tel"
            etiqueta="WhatsApp *"
            placeholder="Ej. 71234567"
          />

          <InputTexto
            v-model="nuevoCI"
            etiqueta="C.I. / NIT (opcional)"
            placeholder="Ej. 8392102 SC"
          />
        </div>

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
          placeholder="Ej. Le gustan las cadenas de acero dorado y piedras facetadas"
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
            <strong>{{ clienteReserva.tipo === 'HABITUAL' ? 'Clienta Habitual de Confianza' : 'Clienta Nueva' }}</strong>
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
              <option value="Quedan 24h">24 horas (Predeterminado)</option>
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

    <!-- Modal 3: Historial de Compras por Clienta (Consulta Bajo Demanda) -->
    <ModalBase
      :visible="modalHistorialVisible"
      :titulo="`Historial de Compras: ${clientaHistorial?.nombre || ''}`"
      ancho-maximo="640px"
      @cerrar="modalHistorialVisible = false"
    >
      <div v-if="clientaHistorial" class="cuerpo-modal-historial">
        <!-- Resumen Superior de la Clienta -->
        <div class="tarjeta-resumen-clienta">
          <div class="datos-principales-historial">
            <h3 class="nombre-modal-historial">{{ clientaHistorial.nombre }}</h3>
            <span class="subtexto-historial">
              WhatsApp: {{ clientaHistorial.telefono || 'Sin registrar' }}
              <template v-if="clientaHistorial.ci"> &bull; CI: {{ clientaHistorial.ci }}</template>
            </span>
          </div>

          <div class="stats-historial-grid">
            <div class="stat-item-historial">
              <span class="etiqueta-stat">Compras Registradas</span>
              <span class="cifra-stat">{{ comprasClienta.length }}</span>
            </div>
            <div class="stat-item-historial">
              <span class="etiqueta-stat">Inversión Total</span>
              <span class="cifra-stat monto-oro">Bs. {{ totalInvertidoClienta }}</span>
            </div>
          </div>
        </div>

        <!-- Listado de Transacciones de la Clienta -->
        <div class="contenedor-lista-transacciones">
          <table class="tabla-compras-clienta">
            <thead>
              <tr>
                <th>Ticket</th>
                <th>Fecha y Hora</th>
                <th>Joya(s) Comprada(s)</th>
                <th>Método</th>
                <th class="col-monto">Total</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="compra in comprasClienta" :key="compra.id">
                <td class="id-ticket-celda">#{{ compra.id }}</td>
                <td class="fecha-ticket-celda">{{ compra.fechaHora }}</td>
                <td class="joyas-ticket-celda">
                  <strong>{{ compra.producto }}</strong>
                </td>
                <td>
                  <span
                    class="badge-metodo-chip"
                    :class="compra.metodoPago.toLowerCase()"
                  >
                    {{ compra.metodoPago }}
                  </span>
                </td>
                <td class="col-monto monto-negrita">Bs. {{ compra.montoTotal }}</td>
              </tr>

              <tr v-if="comprasClienta.length === 0">
                <td colspan="5" class="fila-sin-compras">
                  <div class="caja-sin-compras">
                    <IconoLucide nombre="ShoppingBag" :tamano="28" />
                    <span>No hay compras previas registradas para esta clienta.</span>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="acciones-modal-historial">
          <BotonPrincipal @click="modalHistorialVisible = false">
            Cerrar Historial
          </BotonPrincipal>
        </div>
      </div>
    </ModalBase>

    <!-- Modal 5: Edición de Datos de Clienta (Exclusivo Dueña) -->
    <ModalBase
      :visible="modalEditarClienteVisible"
      :titulo="`Editar Clienta: ${clientaEnEdicion?.nombre || ''}`"
      ancho-maximo="480px"
      @cerrar="modalEditarClienteVisible = false"
    >
      <form v-if="clientaEnEdicion" class="formulario-cliente" @submit.prevent="guardarEdicionCliente">
        <InputTexto
          v-model="editNombre"
          etiqueta="Nombre y Apellidos *"
          placeholder="Ej. Valeria Castro Pinto"
          requerido
        />

        <div class="fila-dos-inputs">
          <InputTexto
            v-model="editTelefono"
            tipo="tel"
            etiqueta="WhatsApp / Contacto *"
            placeholder="Ej. 71234567"
          />

          <InputTexto
            v-model="editCI"
            etiqueta="C.I. / NIT (opcional)"
            placeholder="Ej. 8392102 SC"
          />
        </div>

        <div class="campo-grupo">
          <label class="etiqueta-campo">Compras Realizadas (Ajuste Administradora) *</label>
          <input
            v-model.number="editCompras"
            type="number"
            min="0"
            class="input-control"
            required
          />
          <span class="ayuda-subtexto">
            Tipo calculado: <strong>{{ editCompras > 1 ? 'Habitual (Mayor a 1 compra)' : 'Nuevo (0 a 1 compra)' }}</strong>
          </span>
        </div>

        <InputTexto
          v-model="editNotas"
          etiqueta="Notas sobre gustos o preferencias"
          placeholder="Ej. Le gustan los aros mini y piercings plateados"
        />

        <div class="acciones-modal">
          <button
            type="button"
            class="boton-cancelar"
            @click="modalEditarClienteVisible = false"
          >
            Cancelar
          </button>
          <BotonPrincipal tipo="submit">
            Guardar Cambios
          </BotonPrincipal>
        </div>
      </form>
    </ModalBase>

    <!-- Modal 4: Alerta de Errores -->
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
  font-weight: 800;
  color: var(--color-primario);
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

.fila-dos-inputs {
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;
}

@media (min-width: 480px) {
  .fila-dos-inputs {
    grid-template-columns: 1fr 1fr;
  }
}

.campo-select {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.etiqueta-select {
  font-size: var(--tamano-cuerpo);
  font-weight: 700;
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
  border-color: var(--color-primario);
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
  border: 1px solid var(--color-exito-borde);
}

.aviso-confianza.nueva {
  background-color: var(--color-alerta-fondo);
  color: var(--color-alerta);
  border: 1px solid var(--color-alerta-borde);
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
  font-weight: 700;
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

.input-control:focus {
  border-color: var(--color-primario);
}

.resumen-reserva-caja {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background-color: var(--color-fondo-panel);
  border: 1px solid var(--color-neutral-200);
  border-radius: var(--radio-md);
  font-size: 14px;
}

.precio-reserva-total {
  font-size: 18px;
  color: var(--color-primario);
  font-weight: 800;
}

/* Modal de Historial de Compras */
.cuerpo-modal-historial {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.tarjeta-resumen-clienta {
  background-color: var(--color-fondo-panel);
  border: 1px solid var(--color-neutral-200);
  border-radius: var(--radio-md);
  padding: 14px 18px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
}

.datos-principales-historial {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.nombre-modal-historial {
  font-size: 16px;
  font-weight: 800;
  color: var(--color-primario);
}

.subtexto-historial {
  font-size: 12px;
  color: var(--color-neutral-600);
}

.stats-historial-grid {
  display: flex;
  gap: 16px;
}

.stat-item-historial {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.etiqueta-stat {
  font-size: 10px;
  color: var(--color-neutral-600);
  text-transform: uppercase;
  font-weight: 700;
}

.cifra-stat {
  font-size: 16px;
  font-weight: 800;
  color: var(--color-neutral-900);
}

.cifra-stat.monto-oro {
  color: var(--color-dorado-oscuro, #9A7B38);
}

.contenedor-lista-transacciones {
  max-height: 340px;
  overflow-y: auto;
  border: 1px solid var(--color-neutral-200);
  border-radius: var(--radio-md);
}

.tabla-compras-clienta {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
  font-size: 13px;
}

.tabla-compras-clienta th {
  background-color: var(--color-neutral-50);
  padding: 10px 14px;
  font-size: 11px;
  font-weight: 700;
  color: var(--color-neutral-600);
  text-transform: uppercase;
  border-bottom: 1px solid var(--color-neutral-200);
}

.tabla-compras-clienta td {
  padding: 12px 14px;
  border-bottom: 1px solid var(--color-neutral-100);
  vertical-align: middle;
}

.id-ticket-celda {
  font-weight: 700;
  color: var(--color-neutral-600);
  font-size: 11px;
}

.fecha-ticket-celda {
  font-size: 11px;
  color: var(--color-neutral-600);
  white-space: nowrap;
}

.joyas-ticket-celda {
  max-width: 200px;
  font-size: 12px;
}

.badge-metodo-chip {
  display: inline-flex;
  padding: 2px 6px;
  border-radius: var(--radio-sm);
  font-size: 10px;
  font-weight: 700;
}

.badge-metodo-chip.efectivo {
  background-color: var(--color-exito-fondo);
  color: var(--color-exito);
}

.badge-metodo-chip.qr {
  background-color: var(--color-alerta-fondo);
  color: var(--color-alerta);
}

.badge-metodo-chip.hibrido {
  background-color: var(--color-primario-fondo);
  color: var(--color-primario);
}

.col-monto {
  text-align: right;
  white-space: nowrap;
}

.monto-negrita {
  font-weight: 800;
  color: var(--color-primario);
}

.fila-sin-compras {
  text-align: center;
  padding: 32px 16px;
}

.caja-sin-compras {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  color: var(--color-neutral-600);
}

.acciones-modal-historial {
  display: flex;
  justify-content: flex-end;
  padding-top: 10px;
  border-top: 1px solid var(--color-neutral-200);
}
</style>
