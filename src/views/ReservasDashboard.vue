<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useReservasStore } from '../stores/reservas'
import { useInventarioStore } from '../stores/inventario'
import { useVentasStore } from '../stores/ventas'
import TarjetaMetrica from '../components/admin/TarjetaMetrica.vue'
import BadgeEstado from '../components/common/BadgeEstado.vue'
import ModalAlerta from '../components/common/ModalAlerta.vue'
import IconoLucide from '../components/common/IconoLucide.vue'

const router = useRouter()
const reservasStore = useReservasStore()
const inventarioStore = useInventarioStore()
const ventasStore = useVentasStore()

// Estado para modal de confirmación al liberar reserva
const modalLiberarVisible = ref(false)
const reservaSeleccionadaParaLiberar = ref(null)

// 1. Acción: Completar Venta (transfiere productos al POS)
const completarVentaEnPOS = (reserva) => {
  reservasStore.prepararVentaDesdeReserva(reserva.id)
  router.push('/admin/ventas')
}

// 2. Acción: Solicitar confirmación para liberar reserva
const solicitarLiberarReserva = (reserva) => {
  reservaSeleccionadaParaLiberar.value = reserva
  modalLiberarVisible.value = true
}

// Confirmar liberación en el modal
const ejecutarLiberacionReserva = () => {
  if (reservaSeleccionadaParaLiberar.value) {
    reservasStore.liberarReserva(reservaSeleccionadaParaLiberar.value.id)
    modalLiberarVisible.value = false
    reservaSeleccionadaParaLiberar.value = null
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

      <!-- Selector de Turno de Tienda -->
      <div class="selector-turno-caja">
        <IconoLucide nombre="Clock" :tamano="16" />
        <span class="etiqueta-turno">Turno activo:</span>
        <select v-model="ventasStore.turnoActual" class="select-turno">
          <option value="Turno Mañana">Turno Mañana</option>
          <option value="Turno Tarde">Turno Tarde</option>
        </select>
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
              <th>Origen / Clienta</th>
              <th>Joya(s) Apartada(s)</th>
              <th>Importe Total</th>
              <th>Plazo Límite</th>
              <th>Estado</th>
              <th class="col-acciones">Acciones de Pedido</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="res in reservasStore.reservasPendientes"
              :key="res.id"
              :class="{ 'fila-urgente': res.esUrgente }"
            >
              <!-- Cliente y Origen -->
              <td>
                <div class="celda-cliente">
                  <div class="fila-origen-cliente">
                    <span
                      class="badge-origen"
                      :class="res.origen === 'WHATSAPP' ? 'badge-whatsapp' : 'badge-tienda'"
                    >
                      <IconoLucide
                        :nombre="res.origen === 'WHATSAPP' ? 'MessageCircle' : 'Store'"
                        :tamano="12"
                      />
                      <span>{{ res.origen === 'WHATSAPP' ? 'WhatsApp' : 'Mostrador' }}</span>
                    </span>
                    <span class="nombre-cliente">{{ res.cliente }}</span>
                  </div>

                  <button
                    v-if="res.telefono"
                    type="button"
                    class="boton-whatsapp-mini"
                    title="Escribir por WhatsApp"
                    @click="contactarWhatsApp(res)"
                  >
                    <IconoLucide nombre="MessageCircle" :tamano="13" />
                    <span>{{ res.telefono }}</span>
                  </button>
                </div>
              </td>

              <!-- Joya(s) -->
              <td>
                <div class="celda-joyas">
                  <span class="producto-nombre">{{ res.producto }}</span>
                  <span class="cantidad-badge">{{ res.cantidad }} pieza{{ res.cantidad > 1 ? 's' : '' }}</span>
                </div>
              </td>

              <!-- Monto -->
              <td class="monto-negrita">Bs. {{ res.montoTotal }}</td>

              <!-- Vencimiento / Plazo de 24 horas -->
              <td>
                <div class="bloque-vencimiento">
                  <span class="vencimiento-etiqueta" :class="{ urgente: res.esUrgente }">
                    <IconoLucide nombre="Clock" :tamano="14" />
                    <strong>{{ res.vencimiento }}</strong>
                  </span>
                  <span class="fecha-creacion">Creado: {{ res.fecha }}</span>
                </div>
              </td>

              <!-- Estado -->
              <td>
                <BadgeEstado :estado="res.estado" />
              </td>

              <!-- Acciones Rápidas -->
              <td class="col-acciones">
                <div class="grupo-botones-accion">
                  <!-- Botón 1: Completar Venta (transfiere al POS) -->
                  <button
                    type="button"
                    class="boton-accion completar"
                    title="Transferir datos al formulario de venta para registrar cobro"
                    @click="completarVentaEnPOS(res)"
                  >
                    <IconoLucide nombre="CheckCheck" :tamano="15" />
                    <span>Completar Venta</span>
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
              <td colspan="6" class="celda-vacia">
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

.celda-cliente {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.fila-origen-cliente {
  display: flex;
  align-items: center;
  gap: 8px;
}

.badge-origen {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 10px;
  font-weight: 700;
  padding: 2px 6px;
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

.nombre-cliente {
  font-weight: 700;
  color: var(--color-neutral-900);
}

.boton-whatsapp-mini {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  color: var(--color-whatsapp);
  font-size: 12px;
  font-weight: 600;
  width: fit-content;
}

.boton-whatsapp-mini:hover {
  text-decoration: underline;
}

.celda-joyas {
  display: flex;
  flex-direction: column;
  gap: 2px;
  max-width: 320px;
}

.producto-nombre {
  font-weight: 600;
  color: var(--color-neutral-900);
  line-height: 1.35;
}

.cantidad-badge {
  font-size: 11px;
  color: var(--color-neutral-600);
}

.monto-negrita {
  font-weight: 800;
  color: var(--color-primario);
  font-size: 15px;
}

.bloque-vencimiento {
  display: flex;
  flex-direction: column;
  gap: 2px;
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

.fecha-creacion {
  font-size: 11px;
  color: var(--color-neutral-600);
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

.boton-accion.completar {
  background-color: var(--color-primario);
  color: var(--color-blanco);
  border: 1px solid var(--color-primario);
}

.boton-accion.completar:hover {
  background-color: var(--color-primario-hover);
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
