<script setup>
import IconoLucide from '../common/IconoLucide.vue'

defineProps({
  ventas: {
    type: Array,
    required: true,
  },
  totales: {
    type: Object,
    required: true,
  },
})

defineEmits(['ver-detalle'])
</script>

<template>
  <div class="envoltura-reportes">
    <!-- Tarjetas de Resumen Financiero -->
    <div class="grid-resumen-reporte">
      <div class="tarjeta-kpi-cierre">
        <span class="etiqueta-cierre">Total Efectivo</span>
        <span class="monto-cierre">Bs. {{ totales.totalEfectivo }}</span>
        <span class="subtexto-cierre">En caja física (inc. híbridos)</span>
      </div>

      <div class="tarjeta-kpi-cierre">
        <span class="etiqueta-cierre">Total QR / Transferencia</span>
        <span class="monto-cierre">Bs. {{ totales.totalQR }}</span>
        <span class="subtexto-cierre">Banco verificado (inc. híbridos)</span>
      </div>

      <div class="tarjeta-kpi-cierre">
        <span class="etiqueta-cierre">Ventas por Turno</span>
        <span class="monto-cierre">{{ totales.ventasManana }} / {{ totales.ventasTarde }}</span>
        <span class="subtexto-cierre">Mañana / Tarde</span>
      </div>

      <div class="tarjeta-kpi-cierre total-general">
        <span class="etiqueta-cierre">Gran Total del Período</span>
        <span class="monto-cierre destacado">Bs. {{ totales.totalGeneral }}</span>
        <span class="subtexto-cierre">{{ ventas.length }} transacciones registradas</span>
      </div>
    </div>

    <!-- Tabla Detallada de Transacciones -->
    <div class="contenedor-tabla-reporte">
      <div class="cabecera-tabla-reporte">
        <div>
          <h3 class="titulo-detalle">Auditoría y Registro de Transacciones</h3>
          <p class="subtitulo-detalle">Haz clic en cualquier venta para ver el ticket detallado</p>
        </div>
      </div>

      <div class="scroll-tabla">
        <table class="tabla-transacciones">
          <thead>
            <tr>
              <th>Ticket</th>
              <th>Fecha y Hora</th>
              <th>Clienta</th>
              <th>Responsable / Turno</th>
              <th>Joya(s)</th>
              <th>Método de Cobro</th>
              <th class="col-monto">Total</th>
              <th class="col-accion">Detalle</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="venta in ventas"
              :key="venta.id"
              class="fila-transaccion-interactiva"
              @click="$emit('ver-detalle', venta)"
            >
              <td class="id-transaccion">#{{ venta.id }}</td>
              <td class="fecha-transaccion">{{ venta.fechaHora }}</td>
              <td class="cliente-transaccion">{{ venta.cliente || 'Cliente Casual' }}</td>
              <td class="vendedora-transaccion">
                <span class="nombre-vend">{{ venta.vendedora || 'Personal' }}</span>
                <span class="turno-vend">{{ venta.turno }}</span>
              </td>
              <td class="joya-transaccion">
                <span class="texto-joyas-truncado">{{ venta.producto }}</span>
              </td>
              <td>
                <span
                  class="badge-metodo"
                  :class="venta.metodoPago.toLowerCase()"
                >
                  <IconoLucide
                    :nombre="
                      venta.metodoPago === 'EFECTIVO'
                        ? 'Banknote'
                        : venta.metodoPago === 'QR'
                        ? 'QrCode'
                        : 'Split'
                    "
                    :tamano="13"
                  />
                  <span>{{ venta.metodoPago }}</span>
                </span>
              </td>
              <td class="col-monto monto-negrita">Bs. {{ venta.montoTotal }}</td>
              <td class="col-accion" @click.stop="$emit('ver-detalle', venta)">
                <button
                  type="button"
                  class="btn-ver-ticket"
                  title="Ver desglose del ticket"
                >
                  <IconoLucide nombre="Eye" :tamano="14" />
                  <span>Ver</span>
                </button>
              </td>
            </tr>

            <tr v-if="ventas.length === 0">
              <td colspan="8" class="fila-sin-ventas">
                No hay ventas registradas en el período seleccionado.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<style scoped>
.envoltura-reportes {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.grid-resumen-reporte {
  display: grid;
  grid-template-columns: 1fr;
  gap: 14px;
}

@media (min-width: 640px) {
  .grid-resumen-reporte {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1024px) {
  .grid-resumen-reporte {
    grid-template-columns: repeat(4, 1fr);
  }
}

.tarjeta-kpi-cierre {
  background-color: var(--color-blanco);
  border: 1px solid var(--color-neutral-200);
  border-radius: var(--radio-lg);
  padding: 16px 20px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  box-shadow: var(--sombra-sutil);
}

.tarjeta-kpi-cierre.total-general {
  background-color: var(--color-primario);
  border-color: var(--color-primario);
  color: var(--color-blanco);
}

.tarjeta-kpi-cierre.total-general .etiqueta-cierre,
.tarjeta-kpi-cierre.total-general .subtexto-cierre {
  color: rgba(255, 255, 255, 0.75);
}

.etiqueta-cierre {
  font-size: 12px;
  color: var(--color-neutral-600);
  font-weight: 600;
}

.monto-cierre {
  font-size: 22px;
  font-weight: 800;
  color: var(--color-neutral-900);
}

.monto-cierre.destacado {
  color: var(--color-blanco);
}

.subtexto-cierre {
  font-size: 11px;
  color: var(--color-neutral-600);
}

/* Tabla */
.contenedor-tabla-reporte {
  background-color: var(--color-blanco);
  border: 1px solid var(--color-neutral-200);
  border-radius: var(--radio-lg);
  box-shadow: var(--sombra-sutil);
  overflow: hidden;
}

.cabecera-tabla-reporte {
  padding: 16px 20px;
  border-bottom: 1px solid var(--color-neutral-200);
  background-color: var(--color-fondo-panel);
}

.titulo-detalle {
  font-size: 16px;
  font-weight: 700;
  color: var(--color-neutral-900);
}

.subtitulo-detalle {
  font-size: 12px;
  color: var(--color-neutral-600);
  margin-top: 2px;
}

.scroll-tabla {
  width: 100%;
  overflow-x: auto;
}

.tabla-transacciones {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
  font-size: var(--tamano-cuerpo);
}

.tabla-transacciones th {
  background-color: var(--color-neutral-50);
  padding: 12px 14px;
  font-size: 11px;
  font-weight: 700;
  color: var(--color-neutral-600);
  text-transform: uppercase;
  letter-spacing: 0.04em;
  border-bottom: 1px solid var(--color-neutral-200);
  white-space: nowrap;
}

.tabla-transacciones td {
  padding: 12px 14px;
  border-bottom: 1px solid var(--color-neutral-200);
  vertical-align: middle;
}

.fila-transaccion-interactiva {
  cursor: pointer;
  transition: background-color var(--transicion-rapida);
}

.fila-transaccion-interactiva:hover {
  background-color: var(--color-primario-fondo);
}

.id-transaccion {
  font-weight: 700;
  color: var(--color-neutral-600);
  font-size: 12px;
}

.fecha-transaccion {
  font-size: 12px;
  color: var(--color-neutral-600);
  white-space: nowrap;
}

.cliente-transaccion {
  font-weight: 600;
  color: var(--color-neutral-900);
}

.vendedora-transaccion {
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.nombre-vend {
  font-size: 12px;
  font-weight: 700;
  color: var(--color-neutral-900);
}

.turno-vend {
  font-size: 10px;
  color: var(--color-neutral-600);
}

.joya-transaccion {
  max-width: 220px;
}

.texto-joyas-truncado {
  display: block;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 12.5px;
}

.badge-metodo {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 8px;
  border-radius: var(--radio-sm);
  font-size: 11px;
  font-weight: 700;
}

.badge-metodo.efectivo {
  background-color: var(--color-exito-fondo);
  color: var(--color-exito);
}

.badge-metodo.qr {
  background-color: var(--color-alerta-fondo);
  color: var(--color-alerta);
}

.badge-metodo.hibrido {
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

.col-accion {
  text-align: center;
  white-space: nowrap;
}

.btn-ver-ticket {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 5px 10px;
  border-radius: var(--radio-sm);
  background-color: var(--color-blanco);
  border: 1px solid var(--color-neutral-200);
  font-size: 11px;
  font-weight: 700;
  color: var(--color-neutral-800);
  cursor: pointer;
  transition: all var(--transicion-rapida);
}

.btn-ver-ticket:hover {
  background-color: var(--color-primario);
  color: var(--color-blanco);
  border-color: var(--color-primario);
}

.fila-sin-ventas {
  text-align: center;
  color: var(--color-neutral-600);
  padding: 32px;
}
</style>
