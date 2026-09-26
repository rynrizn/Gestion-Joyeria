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
</script>

<template>
  <div class="envoltura-reportes">
    <!-- Tarjetas de Resumen Financiero -->
    <div class="grid-resumen-reporte">
      <div class="tarjeta-kpi-cierre">
        <span class="etiqueta-cierre">Total Efectivo</span>
        <span class="monto-cierre">Bs. {{ totales.totalEfectivo }}</span>
        <span class="subtexto-cierre">En caja física</span>
      </div>

      <div class="tarjeta-kpi-cierre">
        <span class="etiqueta-cierre">Total QR / Transferencia</span>
        <span class="monto-cierre">Bs. {{ totales.totalQR }}</span>
        <span class="subtexto-cierre">Banco verificado</span>
      </div>

      <div class="tarjeta-kpi-cierre">
        <span class="etiqueta-cierre">Ventas por Turno</span>
        <span class="monto-cierre">{{ totales.ventasManana }} / {{ totales.ventasTarde }}</span>
        <span class="subtexto-cierre">Mañana / Tarde</span>
      </div>

      <div class="tarjeta-kpi-cierre total-general">
        <span class="etiqueta-cierre">Gran Total del Período</span>
        <span class="monto-cierre destacado">Bs. {{ totales.totalGeneral }}</span>
        <span class="subtexto-cierre">{{ ventas.length }} transacciones</span>
      </div>
    </div>

    <!-- Tabla Detallada de Transacciones -->
    <div class="contenedor-tabla-reporte">
      <div class="cabecera-tabla-reporte">
        <h3 class="titulo-detalle">Detalle de Transacciones</h3>
      </div>

      <div class="scroll-tabla">
        <table class="tabla-transacciones">
          <thead>
            <tr>
              <th>ID</th>
              <th>Fecha y Hora</th>
              <th>Joya Vendida</th>
              <th>Cantidad</th>
              <th>Método de Cobro</th>
              <th>Turno</th>
              <th class="col-monto">Total (Bs.)</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="venta in ventas" :key="venta.id">
              <td class="id-transaccion">#{{ venta.id }}</td>
              <td class="fecha-transaccion">{{ venta.fechaHora }}</td>
              <td class="joya-transaccion">
                <strong>{{ venta.producto }}</strong>
              </td>
              <td>{{ venta.cantidad }} u.</td>
              <td>
                <span
                  class="badge-metodo"
                  :class="venta.metodoPago === 'EFECTIVO' ? 'efectivo' : 'qr'"
                >
                  <IconoLucide
                    :nombre="venta.metodoPago === 'EFECTIVO' ? 'Banknote' : 'QrCode'"
                    :tamano="13"
                  />
                  <span>{{ venta.metodoPago }}</span>
                </span>
              </td>
              <td class="turno-texto">{{ venta.turno }}</td>
              <td class="col-monto monto-negrita">Bs. {{ venta.montoTotal }}</td>
            </tr>

            <tr v-if="ventas.length === 0">
              <td colspan="7" class="fila-sin-ventas">
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
  background-color: var(--color-neutral-900);
  border-color: var(--color-neutral-900);
  color: var(--color-blanco);
}

.tarjeta-kpi-cierre.total-general .etiqueta-cierre,
.tarjeta-kpi-cierre.total-general .subtexto-cierre {
  color: rgba(255, 255, 255, 0.7);
}

.etiqueta-cierre {
  font-size: 12px;
  color: var(--color-neutral-600);
  font-weight: 500;
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
}

.titulo-detalle {
  font-size: 15px;
  font-weight: 600;
  color: var(--color-neutral-900);
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
  padding: 12px 16px;
  font-size: 12px;
  font-weight: 600;
  color: var(--color-neutral-600);
  text-transform: uppercase;
  letter-spacing: 0.04em;
  border-bottom: 1px solid var(--color-neutral-200);
  white-space: nowrap;
}

.tabla-transacciones td {
  padding: 12px 16px;
  border-bottom: 1px solid var(--color-neutral-200);
  vertical-align: middle;
}

.tabla-transacciones tr:last-child td {
  border-bottom: none;
}

.id-transaccion {
  font-weight: 600;
  color: var(--color-neutral-600);
  font-size: 12px;
}

.fecha-transaccion {
  font-size: 12px;
  color: var(--color-neutral-600);
  white-space: nowrap;
}

.badge-metodo {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 8px;
  border-radius: var(--radio-sm);
  font-size: 11px;
  font-weight: 600;
}

.badge-metodo.efectivo {
  background-color: var(--color-exito-fondo);
  color: var(--color-exito);
}

.badge-metodo.qr {
  background-color: var(--color-alerta-fondo);
  color: var(--color-alerta);
}

.turno-texto {
  font-size: 12px;
  color: var(--color-neutral-600);
}

.col-monto {
  text-align: right;
  white-space: nowrap;
}

.monto-negrita {
  font-weight: 700;
  color: var(--color-neutral-900);
}

.fila-sin-ventas {
  text-align: center;
  color: var(--color-neutral-600);
  padding: 32px;
}
</style>
