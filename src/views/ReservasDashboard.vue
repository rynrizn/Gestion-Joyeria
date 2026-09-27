<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useReservasStore, calcularDisponibilidadPedido } from '../stores/reservas'
import { useInventarioStore } from '../stores/inventario'
import { useVentasStore } from '../stores/ventas'
import TarjetaMetrica from '../components/admin/TarjetaMetrica.vue'
import ModalDetallePedido from '../components/admin/ModalDetallePedido.vue'
import ModalAlerta from '../components/common/ModalAlerta.vue'
import IconoLucide from '../components/common/IconoLucide.vue'

const router = useRouter()
const reservasStore = useReservasStore()
const inventarioStore = useInventarioStore()
const ventasStore = useVentasStore()

// Estado para recarga de datos en segundo plano
const recargando = ref(false)

const recargarDatos = async () => {
  recargando.value = true
  try {
    await Promise.allSettled([
      reservasStore.cargarReservasSupabase(),
      inventarioStore.cargarInventarioSupabase(),
    ])
  } finally {
    setTimeout(() => {
      recargando.value = false
    }, 400)
  }
}

let intervaloActualizacion = null

onMounted(async () => {
  await recargarDatos()

  // Recarga automática periódica (cada 20s) para mostrar nuevos pedidos web en tiempo real
  intervaloActualizacion = setInterval(() => {
    reservasStore.cargarReservasSupabase()
  }, 20000)

  // Recargar al regresar a la pestaña del navegador
  window.addEventListener('focus', recargarDatos)
})

onUnmounted(() => {
  if (intervaloActualizacion) {
    clearInterval(intervaloActualizacion)
  }
  window.removeEventListener('focus', recargarDatos)
})

// Estado para modal de detalle de pedido
const modalDetalleVisible = ref(false)
const reservaSeleccionadaParaDetalle = ref(null)

// Estado para modal de confirmación al liberar reserva
const modalLiberarVisible = ref(false)
const reservaSeleccionadaParaLiberar = ref(null)

// 1. Acción: Abrir modal de detalle con desglose de productos y ubicaciones
const abrirDetallePedido = (reserva) => {
  reservaSeleccionadaParaDetalle.value = reserva
  modalDetalleVisible.value = true
}

// 2. Acción: Completar Venta desde el modal de detalle (transfiere productos al POS)
const completarVentaDesdeModal = (reserva) => {
  modalDetalleVisible.value = false
  reservasStore.prepararVentaDesdeReserva(reserva.id)
  router.push('/admin/ventas')
}

// 3. Acción: Solicitar confirmación para liberar reserva
const solicitarLiberarReserva = (reserva) => {
  reservaSeleccionadaParaLiberar.value = reserva
  modalLiberarVisible.value = true
}

// Confirmar liberación en el modal
const ejecutarLiberacionReserva = async () => {
  if (reservaSeleccionadaParaLiberar.value) {
    await reservasStore.liberarReserva(reservaSeleccionadaParaLiberar.value.id)
    modalLiberarVisible.value = false
    reservaSeleccionadaParaLiberar.value = null
    // Refrescar inventario para ver las piezas liberadas
    inventarioStore.cargarInventarioSupabase()
  }
}

// Contactar por WhatsApp si tiene teléfono
const contactarWhatsApp = (reserva) => {
  const tel = reserva.telefono ? `591${reserva.telefono}` : ''
  const mensaje = `Hola ${reserva.cliente}, te escribimos de Moonstone Joyería respecto a tu pedido de: ${reserva.producto}.`
  window.open(`https://wa.me/${tel}?text=${encodeURIComponent(mensaje)}`, '_blank')
}
</script>

<template>
  <div class="pantalla-dashboard">
    <!-- Encabezado de la Vista y Turno Activo -->
    <header class="cabecera-dashboard">
      <div>
        <h1 class="titulo-vista">Dashboard de Control</h1>
        <p class="subtitulo-vista">
          Gestión de reservas web (24h de vigencia) y estado de ventas en tiempo real
        </p>
      </div>

      <!-- Acciones de Cabecera: Botón Recargar y Selector de Turno -->
      <div class="acciones-cabecera">
        <button
          type="button"
          class="boton-recargar-dashboard"
          :class="{ 'girando': recargando }"
          title="Actualizar pedidos y reservas desde Supabase"
          @click="recargarDatos"
        >
          <IconoLucide nombre="RefreshCw" :tamano="15" />
          <span>{{ recargando ? 'Actualizando...' : 'Actualizar' }}</span>
        </button>

        <div class="selector-turno-caja">
          <IconoLucide nombre="Clock" :tamano="16" />
          <span class="etiqueta-turno">Turno:</span>
          <select v-model="ventasStore.turnoActual" class="select-turno">
            <option value="Turno Mañana">Turno Mañana</option>
            <option value="Turno Tarde">Turno Tarde</option>
          </select>
        </div>
      </div>
    </header>

    <!-- 3 Tarjetas de Métricas Resumidas (KPIs) -->
    <section class="seccion-kpis">
      <!-- KPI 1: Reservas por Vencer -->
      <TarjetaMetrica
        titulo="Reservas Activas (24h)"
        :valor="reservasStore.reservasPendientes.length"
        :subtexto="`${reservasStore.contadorPorVencer} con vencimiento próximo (< 4h)`"
        icono="Clock"
        :variante="reservasStore.contadorPorVencer > 0 ? 'alerta' : 'normal'"
      />

      <!-- KPI 2: Alertas de Stock Bajo -->
      <TarjetaMetrica
        titulo="Alertas de Stock Bajo"
        :valor="inventarioStore.alertasStockBajo.length"
        subtexto="Joyas con ≤ 2 piezas en tienda física"
        icono="AlertTriangle"
        :variante="inventarioStore.alertasStockBajo.length > 0 ? 'peligro' : 'normal'"
      />

      <!-- KPI 3: Total Ventas del Día -->
      <TarjetaMetrica
        titulo="Total Ventas del Día"
        :valor="`Bs. ${ventasStore.totalGeneral}`"
        :subtexto="`Efectivo: Bs. ${ventasStore.totalEfectivo} | QR: Bs. ${ventasStore.totalQR}`"
        icono="DollarSign"
        variante="exito"
      />
    </section>

    <!-- Tabla Principal: Reservas Pendientes con Acciones Completar/Liberar -->
    <section class="seccion-tabla-rapida">
      <div class="cabecera-seccion-tabla">
        <div class="textos-cabecera-seccion">
          <h2 class="titulo-seccion">Pedidos y Reservas Pendientes</h2>
          <p class="subtitulo-seccion">
            Pedidos recibidos por WhatsApp o mostrador con plazo predeterminado de 24 horas
          </p>
        </div>
      </div>

      <div class="contenedor-tabla-responsiva">
        <table class="tabla-operativa">
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Disponibilidad</th>
              <th>Total de Venta</th>
              <th class="col-acciones">Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="res in reservasStore.reservasPendientes"
              :key="res.id"
              :class="{ 'fila-urgente': res.esUrgente }"
            >
              <!-- 1. Columna Fecha: Hora del pedido, tiempo que queda y titular -->
              <td>
                <div class="celda-fecha-col">
                  <div class="fila-plazo-urgencia">
                    <span class="vencimiento-etiqueta" :class="{ urgente: res.esUrgente }">
                      <IconoLucide nombre="Clock" :tamano="14" />
                      <strong>{{ res.vencimiento }}</strong>
                    </span>
                    <span class="hora-creacion">{{ res.fecha }}</span>
                  </div>

                  <div class="titular-pedido-fila">
                    <span
                      class="badge-origen"
                      :class="res.origen === 'WHATSAPP' ? 'badge-whatsapp' : 'badge-tienda'"
                    >
                      <IconoLucide
                        :nombre="res.origen === 'WHATSAPP' ? 'MessageCircle' : 'Store'"
                        :tamano="11"
                      />
                      <span>{{ res.origen === 'WHATSAPP' ? 'WhatsApp' : 'Mostrador' }}</span>
                    </span>
                    <strong class="nombre-clienta-reserva">{{ res.cliente }}</strong>
                  </div>
                </div>
              </td>

              <!-- 2. Columna Disponibilidad: Evaluación multisede (Central / Tienda / Ambas) -->
              <td>
                <div
                  v-if="calcularDisponibilidadPedido(res, inventarioStore.productos)"
                  class="badge-disponibilidad-tabla"
                  :class="calcularDisponibilidadPedido(res, inventarioStore.productos).clase"
                >
                  <IconoLucide
                    :nombre="calcularDisponibilidadPedido(res, inventarioStore.productos).icono"
                    :tamano="14"
                  />
                  <span>{{ calcularDisponibilidadPedido(res, inventarioStore.productos).badge }}</span>
                </div>
              </td>

              <!-- 3. Columna Total de Venta: Suma total de los productos solicitados -->
              <td>
                <div class="celda-total-venta">
                  <span class="monto-total-cifra">Bs. {{ res.montoTotal }}</span>
                  <span class="piezas-conteo-sub">
                    {{ res.cantidad }} pieza{{ res.cantidad > 1 ? 's' : '' }}
                    <template v-if="(res.items || []).length > 1">
                      &bull; {{ (res.items || []).length }} productos
                    </template>
                  </span>
                </div>
              </td>

              <!-- 4. Columna Acciones: Botón Ver Detalle (reemplaza completar venta) y Remover -->
              <td class="col-acciones">
                <div class="grupo-botones-accion">
                  <!-- Botón 1: Ver Detalle (Abre modal con desglose de productos y botón de completar venta) -->
                  <button
                    type="button"
                    class="boton-accion ver-detalle"
                    title="Ver lista de productos, stock en ubicaciones y procesar venta"
                    @click="abrirDetallePedido(res)"
                  >
                    <IconoLucide nombre="Eye" :tamano="15" />
                    <span>Ver Detalle</span>
                  </button>

                  <!-- Botón 2: Remover / Liberar Reserva -->
                  <button
                    type="button"
                    class="boton-accion liberar"
                    title="Liberar piezas y devolver al inventario disponible"
                    @click="solicitarLiberarReserva(res)"
                  >
                    <IconoLucide nombre="Trash2" :tamano="15" />
                    <span>Remover</span>
                  </button>
                </div>
              </td>
            </tr>

            <!-- Estado vacío -->
            <tr v-if="reservasStore.reservasPendientes.length === 0">
              <td colspan="4" class="celda-vacia">
                <div class="caja-vacia-dashboard">
                  <IconoLucide nombre="Inbox" :tamano="36" />
                  <p>No hay pedidos ni reservas pendientes en este momento.</p>
                  <span>Los pedidos realizados por las clientas en WhatsApp aparecerán aquí automáticamente.</span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <!-- Modal de Detalle de Pedido (con desglose por ubicación y botón Completar Venta) -->
    <ModalDetallePedido
      :visible="modalDetalleVisible"
      :reserva="reservaSeleccionadaParaDetalle"
      :productos-inventario="inventarioStore.productos"
      @cerrar="modalDetalleVisible = false"
      @completar-venta="completarVentaDesdeModal"
      @contactar-whatsapp="contactarWhatsApp"
    />

    <!-- Modal de Confirmación para Remover Reserva -->
    <ModalAlerta
      :visible="modalLiberarVisible"
      tipo="confirmacion"
      titulo="¿Liberar y Anular Reserva?"
      :mensaje="`Estás a punto de remover la reserva #${reservaSeleccionadaParaLiberar?.id} de ${reservaSeleccionadaParaLiberar?.cliente}. Las joyas apartadas se devolverán de inmediato al stock disponible.`"
      :detalles="`Joyas: ${reservaSeleccionadaParaLiberar?.producto || ''} • Total: Bs. ${reservaSeleccionadaParaLiberar?.montoTotal || 0}`"
      texto-boton="Sí, Liberar Piezas"
      texto-cancelar="Conservar Reserva"
      mostrar-cancelar
      @confirmar="ejecutarLiberacionReserva"
      @cerrar="modalLiberarVisible = false"
    />
  </div>
</template>

<style scoped>
.pantalla-dashboard {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.cabecera-dashboard {
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
  letter-spacing: -0.01em;
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

.boton-recargar-dashboard {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background-color: var(--color-blanco);
  border: 1px solid var(--color-neutral-200);
  border-radius: var(--radio-md);
  padding: 8px 14px;
  font-size: 13px;
  font-weight: 600;
  color: var(--color-neutral-800);
  cursor: pointer;
  box-shadow: var(--sombra-sutil);
  transition: all var(--transicion-rapida);
}

.boton-recargar-dashboard:hover {
  background-color: var(--color-neutral-50);
  border-color: var(--color-neutral-300);
  color: var(--color-primario);
}

.boton-recargar-dashboard.girando svg {
  animation: girar 1s linear infinite;
}

@keyframes girar {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.selector-turno-caja {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background-color: var(--color-blanco);
  border: 1px solid var(--color-neutral-200);
  border-radius: var(--radio-md);
  padding: 8px 14px;
  font-size: var(--tamano-cuerpo);
  color: var(--color-neutral-900);
  box-shadow: var(--sombra-sutil);
}

.etiqueta-turno {
  font-size: 13px;
  color: var(--color-neutral-600);
}

.select-turno {
  border: none;
  background: transparent;
  font-size: 13px;
  font-weight: 700;
  color: var(--color-primario);
  outline: none;
  cursor: pointer;
}

/* Grilla de KPIs */
.seccion-kpis {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
}

@media (min-width: 640px) {
  .seccion-kpis {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1024px) {
  .seccion-kpis {
    grid-template-columns: repeat(3, 1fr);
    gap: 20px;
  }
}

/* Sección de Tabla Rápida */
.seccion-tabla-rapida {
  background-color: var(--color-blanco);
  border: 1px solid var(--color-neutral-200);
  border-radius: var(--radio-lg);
  box-shadow: var(--sombra-sutil);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.cabecera-seccion-tabla {
  padding: 18px 20px;
  border-bottom: 1px solid var(--color-neutral-200);
  background-color: var(--color-fondo-panel);
}

.titulo-seccion {
  font-size: var(--tamano-h2);
  font-weight: 700;
  color: var(--color-neutral-900);
}

.subtitulo-seccion {
  font-size: 13px;
  color: var(--color-neutral-600);
}

.contenedor-tabla-responsiva {
  width: 100%;
  overflow-x: auto;
}

.tabla-operativa {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
  font-size: var(--tamano-cuerpo);
}

.tabla-operativa th {
  background-color: var(--color-neutral-50);
  padding: 12px 16px;
  font-size: 12px;
  font-weight: 700;
  color: var(--color-neutral-600);
  text-transform: uppercase;
  letter-spacing: 0.04em;
  border-bottom: 1px solid var(--color-neutral-200);
  white-space: nowrap;
}

.tabla-operativa td {
  padding: 14px 16px;
  border-bottom: 1px solid var(--color-neutral-200);
  vertical-align: middle;
}

.tabla-operativa tr:last-child td {
  border-bottom: none;
}

.fila-urgente {
  background-color: #FFFDF5;
}

.celda-fecha-col {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.fila-plazo-urgencia {
  display: flex;
  align-items: center;
  gap: 8px;
}

.hora-creacion {
  font-size: 11px;
  color: var(--color-neutral-600);
}

.titular-pedido-fila {
  display: flex;
  align-items: center;
  gap: 6px;
}

.nombre-clienta-reserva {
  font-size: 13px;
  font-weight: 700;
  color: var(--color-neutral-900);
}

.badge-origen {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  font-size: 9px;
  font-weight: 700;
  padding: 1px 5px;
  border-radius: var(--radio-sm);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.badge-whatsapp {
  background-color: #DCFCE7;
  color: #15803D;
  border: 1px solid rgba(21, 128, 61, 0.2);
}

.badge-tienda {
  background-color: var(--color-neutral-100);
  color: var(--color-neutral-800);
  border: 1px solid var(--color-neutral-300);
}

/* Badge de Disponibilidad Multisede */
.badge-disponibilidad-tabla {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  font-weight: 700;
  padding: 4px 10px;
  border-radius: var(--radio-sm);
  white-space: nowrap;
}

.badge-disponibilidad-tabla.disp-tienda {
  background-color: #E8F5E9;
  color: #166534;
  border: 1px solid #BBF7D0;
}

.badge-disponibilidad-tabla.disp-central {
  background-color: #FEF3C7;
  color: #92400E;
  border: 1px solid #FDE68A;
}

.badge-disponibilidad-tabla.disp-ambas {
  background-color: #F3E8FF;
  color: #6B21A8;
  border: 1px solid #E9D5FF;
}

.badge-disponibilidad-tabla.disp-insuficiente {
  background-color: #FEE2E2;
  color: #991B1B;
  border: 1px solid #FECACA;
}

/* Celda Total de Venta */
.celda-total-venta {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.monto-total-cifra {
  font-size: 16px;
  font-weight: 800;
  color: var(--color-primario);
}

.piezas-conteo-sub {
  font-size: 11px;
  color: var(--color-neutral-600);
}

.vencimiento-etiqueta {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: var(--color-neutral-800);
}

.vencimiento-etiqueta.urgente {
  color: var(--color-alerta);
  font-weight: 800;
}

.col-acciones {
  text-align: right;
  white-space: nowrap;
}

.grupo-botones-accion {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.boton-accion {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 8px 12px;
  border-radius: var(--radio-sm);
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  transition: all var(--transicion-rapida);
}

.boton-accion.ver-detalle {
  background-color: var(--color-primario);
  color: var(--color-blanco);
  border: 1px solid var(--color-primario);
}

.boton-accion.ver-detalle:hover {
  background-color: #2b0b11;
  box-shadow: 0 2px 6px rgba(62, 18, 24, 0.2);
}

.boton-accion.liberar {
  background-color: var(--color-blanco);
  color: var(--color-peligro);
  border: 1px solid var(--color-peligro-borde);
}

.boton-accion.liberar:hover {
  background-color: var(--color-peligro-fondo);
}

.celda-vacia {
  text-align: center;
  padding: 48px 16px;
}

.caja-vacia-dashboard {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  color: var(--color-neutral-600);
}

.caja-vacia-dashboard p {
  font-size: 15px;
  font-weight: 600;
  color: var(--color-neutral-900);
}

.caja-vacia-dashboard span {
  font-size: 13px;
}
</style>
