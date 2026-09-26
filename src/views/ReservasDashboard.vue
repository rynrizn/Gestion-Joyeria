<script setup>
import { useReservasStore } from '../stores/reservas'
import { useInventarioStore } from '../stores/inventario'
import { useVentasStore } from '../stores/ventas'
import TarjetaMetrica from '../components/admin/TarjetaMetrica.vue'
import BadgeEstado from '../components/common/BadgeEstado.vue'
import IconoLucide from '../components/common/IconoLucide.vue'

const reservasStore = useReservasStore()
const inventarioStore = useInventarioStore()
const ventasStore = useVentasStore()

// Acciones de gestión rápida
const entregarReserva = (id) => {
  reservasStore.cobrarReserva(id)
}

const anularReserva = (id) => {
  if (confirm('¿Deseas liberar esta joya y devolverla al stock disponible?')) {
    reservasStore.liberarReserva(id)
  }
}

const contactarWhatsApp = (reserva) => {
  const tel = reserva.telefono ? `591${reserva.telefono}` : ''
  const mensaje = `Hola ${reserva.cliente}, te escribimos de Moonstone Joyería respecto a tu reserva de: ${reserva.producto}.`
  window.open(`https://wa.me/${tel}?text=${encodeURIComponent(mensaje)}`, '_blank')
}
</script>

<template>
  <div class="pantalla-dashboard">
    <!-- Encabezado de la Vista y Barra de Turno -->
    <header class="cabecera-dashboard">
      <div>
        <h1 class="titulo-vista">Dashboard Operativo</h1>
        <p class="subtitulo-vista">Resumen en vivo del día y alertas de atención urgente</p>
      </div>

      <!-- Selector de Turno de Tienda -->
      <div class="selector-turno-caja">
        <IconoLucide nombre="Clock" :tamano="16" />
        <span class="etiqueta-turno">Vendedora actual:</span>
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
        titulo="Reservas por Vencer"
        :valor="reservasStore.contadorPorVencer"
        subtexto="Plazo crítico (< 4 horas)"
        icono="Clock"
        :variante="reservasStore.contadorPorVencer > 0 ? 'alerta' : 'normal'"
      />

      <!-- KPI 2: Alertas de Stock Bajo -->
      <TarjetaMetrica
        titulo="Alertas de Stock Bajo"
        :valor="inventarioStore.alertasStockBajo.length"
        subtexto="Piezas con ≤ 2 unidades físicas"
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

    <!-- Tabla Rápida: Reservas Activas Prioritarias -->
    <section class="seccion-tabla-rapida">
      <div class="cabecera-seccion-tabla">
        <div>
          <h2 class="titulo-seccion">Reservas Activas Prioritarias</h2>
          <p class="subtitulo-seccion">Clientas con apartado temporal en espera de cobro o retiro</p>
        </div>
      </div>

      <div class="contenedor-tabla-responsiva">
        <table class="tabla-operativa">
          <thead>
            <tr>
              <th>Cliente</th>
              <th>Joya Apartada</th>
              <th>Monto</th>
              <th>Vencimiento</th>
              <th>Estado</th>
              <th class="col-acciones">Acciones Rápidas</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="res in reservasStore.reservasPendientes"
              :key="res.id"
              :class="{ 'fila-urgente': res.esUrgente }"
            >
              <!-- Cliente y contacto -->
              <td>
                <div class="celda-cliente">
                  <span class="nombre-cliente">{{ res.cliente }}</span>
                  <button
                    v-if="res.telefono"
                    type="button"
                    class="boton-whatsapp-mini"
                    title="Escribir por WhatsApp"
                    @click="contactarWhatsApp(res)"
                  >
                    <IconoLucide nombre="MessageCircle" :tamano="14" />
                    <span>{{ res.telefono }}</span>
                  </button>
                </div>
              </td>

              <!-- Joya y cantidad -->
              <td>
                <span class="producto-nombre">{{ res.producto }}</span>
                <span class="cantidad-badge">x{{ res.cantidad }}</span>
              </td>

              <!-- Monto -->
              <td class="monto-negrita">Bs. {{ res.montoTotal }}</td>

              <!-- Vencimiento -->
              <td>
                <span class="vencimiento-etiqueta" :class="{ urgente: res.esUrgente }">
                  <IconoLucide nombre="Clock" :tamano="14" />
                  {{ res.vencimiento }}
                </span>
              </td>

              <!-- Estado -->
              <td>
                <BadgeEstado :estado="res.estado" />
              </td>

              <!-- Acciones -->
              <td class="col-acciones">
                <div class="grupo-botones-accion">
                  <button
                    type="button"
                    class="boton-accion cobrar"
                    title="Registrar cobro y entrega física"
                    @click="entregarReserva(res.id)"
                  >
                    <IconoLucide nombre="Check" :tamano="14" />
                    <span>Cobrar</span>
                  </button>
                  <button
                    type="button"
                    class="boton-accion liberar"
                    title="Liberar joya y devolver al stock"
                    @click="anularReserva(res.id)"
                  >
                    <IconoLucide nombre="X" :tamano="14" />
                    <span>Liberar</span>
                  </button>
                </div>
              </td>
            </tr>

            <!-- Estado si no hay reservas -->
            <tr v-if="reservasStore.reservasPendientes.length === 0">
              <td colspan="6" class="celda-vacia">
                No hay reservas activas pendientes en este momento.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
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
  font-weight: 700;
  color: var(--color-neutral-900);
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
  padding: 6px 12px;
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
  font-weight: 600;
  color: var(--color-neutral-900);
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
  padding: 16px 20px;
  border-bottom: 1px solid var(--color-neutral-200);
}

.titulo-seccion {
  font-size: var(--tamano-h2);
  font-weight: 600;
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
  font-weight: 600;
  color: var(--color-neutral-600);
  text-transform: uppercase;
  letter-spacing: 0.04em;
  border-bottom: 1px solid var(--color-neutral-200);
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
  background-color: #FFFBEB;
}

.celda-cliente {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.nombre-cliente {
  font-weight: 600;
  color: var(--color-neutral-900);
}

.boton-whatsapp-mini {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  color: var(--color-whatsapp);
  font-size: 12px;
  font-weight: 500;
  width: fit-content;
}

.boton-whatsapp-mini:hover {
  text-decoration: underline;
}

.producto-nombre {
  font-weight: 500;
  color: var(--color-neutral-900);
}

.cantidad-badge {
  font-size: 12px;
  color: var(--color-neutral-600);
  margin-left: 6px;
}

.monto-negrita {
  font-weight: 700;
  color: var(--color-neutral-900);
}

.vencimiento-etiqueta {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: var(--color-neutral-600);
  font-weight: 500;
}

.vencimiento-etiqueta.urgente {
  color: var(--color-alerta);
  font-weight: 700;
}

.col-acciones {
  text-align: right;
}

.grupo-botones-accion {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.boton-accion {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 6px 10px;
  border-radius: var(--radio-sm);
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transicion-rapida);
}

.boton-accion.cobrar {
  background-color: var(--color-exito-fondo);
  color: var(--color-exito);
  border: 1px solid rgba(22, 163, 74, 0.2);
}

.boton-accion.cobrar:hover {
  background-color: var(--color-exito);
  color: var(--color-blanco);
}

.boton-accion.liberar {
  background-color: var(--color-neutral-50);
  color: var(--color-neutral-600);
  border: 1px solid var(--color-neutral-200);
}

.boton-accion.liberar:hover {
  background-color: var(--color-peligro-fondo);
  color: var(--color-peligro);
  border-color: rgba(220, 38, 38, 0.2);
}

.celda-vacia {
  text-align: center;
  color: var(--color-neutral-600);
  padding: 32px 16px;
}
</style>
