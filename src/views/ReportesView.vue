<script setup>
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import Chart from 'chart.js/auto'
import { useVentasStore } from '../stores/ventas'
import TablaReportes from '../components/admin/TablaReportes.vue'
import ModalBase from '../components/common/ModalBase.vue'
import BotonPrincipal from '../components/common/BotonPrincipal.vue'
import IconoLucide from '../components/common/IconoLucide.vue'

const ventasStore = useVentasStore()

// Control de pestañas
const pestanaActiva = ref('graficos') // 'graficos' | 'transacciones'

// Filtros de fecha
const rangoSeleccionado = ref('hoy')
const fechaInicio = ref('')
const fechaFin = ref('')

const rangos = [
  { valor: 'hoy', etiqueta: 'Hoy' },
  { valor: 'semana', etiqueta: 'Esta semana' },
  { valor: 'mes', etiqueta: 'Este mes' },
  { valor: 'todos', etiqueta: 'Histórico Completo' },
  { valor: 'personalizado', etiqueta: 'Personalizado' },
]

// Modal de detalle individual de venta
const modalDetalleVisible = ref(false)
const ventaSeleccionada = ref(null)

const verDetalleVenta = (venta) => {
  ventaSeleccionada.value = venta
  modalDetalleVisible.value = true
}

// Totales para la tabla de reportes
const totalesCalculados = computed(() => {
  return {
    totalEfectivo: ventasStore.totalEfectivo,
    totalQR: ventasStore.totalQR,
    ventasManana: ventasStore.ventasManana,
    ventasTarde: ventasStore.ventasTarde,
    totalGeneral: ventasStore.totalGeneral,
  }
})

// Referencias de canvas para Chart.js
const canvasBarras = ref(null)
const canvasLineas = ref(null)
const canvasDona = ref(null)

let chartBarras = null
let chartLineas = null
let chartDona = null

const inicializarGraficos = () => {
  if (chartBarras) chartBarras.destroy()
  if (chartLineas) chartLineas.destroy()
  if (chartDona) chartDona.destroy()

  // 1. Gráfico de Barras: Comparativa por Turno
  if (canvasBarras.value) {
    const ctxBarras = canvasBarras.value.getContext('2d')
    const ventasPorTurno = {
      'Turno Mañana': 0,
      'Turno Tarde': 0,
    }
    ventasStore.ventas.forEach((v) => {
      if (v.turno === 'Turno Mañana') ventasPorTurno['Turno Mañana'] += Number(v.montoTotal)
      else ventasPorTurno['Turno Tarde'] += Number(v.montoTotal)
    })

    chartBarras = new Chart(ctxBarras, {
      type: 'bar',
      data: {
        labels: ['Turno Mañana', 'Turno Tarde'],
        datasets: [
          {
            label: 'Ingresos por Turno (Bs.)',
            data: [ventasPorTurno['Turno Mañana'], ventasPorTurno['Turno Tarde']],
            backgroundColor: ['#C5A059', '#3E1218'],
            borderRadius: 6,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (ctx) => ` Bs. ${ctx.parsed.y}`,
            },
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: (val) => `Bs. ${val}`,
            },
          },
        },
      },
    })
  }

  // 2. Gráfico de Líneas: Evolución de Ventas
  if (canvasLineas.value) {
    const ctxLineas = canvasLineas.value.getContext('2d')
    const ventasCronologicas = [...ventasStore.ventas].reverse()
    const etiquetas = ventasCronologicas.map((v) => v.fechaHora.split(' ')[1] || v.fechaHora)
    const montos = ventasCronologicas.map((v) => Number(v.montoTotal))

    chartLineas = new Chart(ctxLineas, {
      type: 'line',
      data: {
        labels: etiquetas,
        datasets: [
          {
            label: 'Monto de Transacción (Bs.)',
            data: montos,
            borderColor: '#3E1218',
            backgroundColor: 'rgba(62, 18, 24, 0.12)',
            fill: true,
            tension: 0.35,
            pointBackgroundColor: '#C5A059',
            pointRadius: 5,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (ctx) => ` Bs. ${ctx.parsed.y}`,
            },
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: (val) => `Bs. ${val}`,
            },
          },
        },
      },
    })
  }

  // 3. Gráfico de Dona: Distribución de Métodos de Cobro
  if (canvasDona.value) {
    const ctxDona = canvasDona.value.getContext('2d')

    let efectivoTotal = 0
    let qrTotal = 0
    let hibridoTotal = 0

    ventasStore.ventas.forEach((v) => {
      if (v.metodoPago === 'EFECTIVO') efectivoTotal += Number(v.montoTotal)
      else if (v.metodoPago === 'QR') qrTotal += Number(v.montoTotal)
      else if (v.metodoPago === 'HIBRIDO') hibridoTotal += Number(v.montoTotal)
    })

    chartDona = new Chart(ctxDona, {
      type: 'doughnut',
      data: {
        labels: ['Efectivo', 'QR / Banco', 'Híbrido'],
        datasets: [
          {
            data: [efectivoTotal, qrTotal, hibridoTotal],
            backgroundColor: ['#16A34A', '#D97706', '#3E1218'],
            borderWidth: 2,
            borderColor: '#FFFFFF',
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              boxWidth: 12,
              font: { size: 11, weight: 'bold' },
            },
          },
          tooltip: {
            callbacks: {
              label: (ctx) => ` ${ctx.label}: Bs. ${ctx.parsed}`,
            },
          },
        },
      },
    })
  }
}

onMounted(() => {
  nextTick(() => {
    inicializarGraficos()
  })
})

// Re-renderizar si cambiamos de pestaña a gráficos o si cambian las ventas
watch(
  () => pestanaActiva.value,
  (nueva) => {
    if (nueva === 'graficos') {
      nextTick(() => {
        inicializarGraficos()
      })
    }
  }
)

watch(
  () => ventasStore.ventas.length,
  () => {
    if (pestanaActiva.value === 'graficos') {
      nextTick(() => {
        inicializarGraficos()
      })
    }
  }
)

// Función para exportar a CSV descargable
const exportarCSV = () => {
  const encabezados = [
    'ID',
    'FechaHora',
    'Clienta',
    'Vendedora',
    'Turno',
    'MetodoPago',
    'MontoEfectivo',
    'MontoQR',
    'TotalBs',
    'Joyas',
    'Observacion',
  ]

  const filas = ventasStore.ventas.map((v) => [
    v.id,
    `"${v.fechaHora}"`,
    `"${v.cliente || 'Casual'}"`,
    `"${v.vendedora || 'Personal'}"`,
    `"${v.turno}"`,
    v.metodoPago,
    v.montoEfectivo || 0,
    v.montoQR || 0,
    v.montoTotal,
    `"${v.producto.replace(/"/g, '""')}"`,
    `"${(v.observacion || '').replace(/"/g, '""')}"`,
  ])

  const contenidoCSV = [encabezados.join(','), ...filas.map((f) => f.join(','))].join('\n')
  const blob = new Blob([contenidoCSV], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const enlace = document.createElement('a')
  enlace.setAttribute('href', url)
  enlace.setAttribute('download', `reporte_ventas_moonstone_${new Date().toISOString().slice(0, 10)}.csv`)
  document.body.appendChild(enlace)
  enlace.click()
  document.body.removeChild(enlace)
}

// Función para imprimir reporte
const descargarPDF = () => {
  window.print()
}
</script>

<template>
  <div class="pantalla-reportes">
    <!-- Cabecera -->
    <header class="cabecera-reportes">
      <div>
        <h1 class="titulo-vista">Reportes y Cierre de Caja</h1>
        <p class="subtitulo-vista">
          Gráficos interactivos de ingresos por turno, métodos de pago e historial detallado
        </p>
      </div>

      <!-- Botones de Exportación -->
      <div class="botones-exportacion no-print">
        <button
          type="button"
          class="boton-exportar csv"
          title="Exportar archivo CSV para Excel"
          @click="exportarCSV"
        >
          <IconoLucide nombre="FileSpreadsheet" :tamano="16" />
          <span>Exportar a Excel (.CSV)</span>
        </button>

        <button
          type="button"
          class="boton-exportar pdf"
          title="Imprimir o guardar como PDF"
          @click="descargarPDF"
        >
          <IconoLucide nombre="FileText" :tamano="16" />
          <span>Imprimir Reporte</span>
        </button>
      </div>
    </header>

    <!-- Barra de Pestañas y Filtro de Fechas -->
    <div class="barra-navegacion-reportes no-print">
      <!-- Selector de Pestañas -->
      <div class="selector-pestanas">
        <button
          type="button"
          class="boton-pestana"
          :class="{ activa: pestanaActiva === 'graficos' }"
          @click="pestanaActiva = 'graficos'"
        >
          <IconoLucide nombre="BarChart3" :tamano="16" />
          <span>Gráficos y Métricas</span>
        </button>

        <button
          type="button"
          class="boton-pestana"
          :class="{ activa: pestanaActiva === 'transacciones' }"
          @click="pestanaActiva = 'transacciones'"
        >
          <IconoLucide nombre="Receipt" :tamano="16" />
          <span>Historial de Transacciones ({{ ventasStore.ventas.length }})</span>
        </button>
      </div>

      <!-- Selector de Rango de Fechas -->
      <div class="chips-rango">
        <button
          v-for="r in rangos"
          :key="r.valor"
          type="button"
          class="chip-rango-btn"
          :class="{ activo: rangoSeleccionado === r.valor }"
          @click="rangoSeleccionado = r.valor"
        >
          {{ r.etiqueta }}
        </button>
      </div>
    </div>

    <!-- Pestaña 1: Gráficos Interactivos y KPIs -->
    <div v-show="pestanaActiva === 'graficos'" class="seccion-graficos">
      <!-- Tarjetas de Resumen Financiero -->
      <div class="grid-resumen-reporte">
        <div class="tarjeta-kpi-cierre">
          <span class="etiqueta-cierre">Total Efectivo</span>
          <span class="monto-cierre">Bs. {{ totalesCalculados.totalEfectivo }}</span>
          <span class="subtexto-cierre">En caja física</span>
        </div>

        <div class="tarjeta-kpi-cierre">
          <span class="etiqueta-cierre">Total QR / Banco</span>
          <span class="monto-cierre">Bs. {{ totalesCalculados.totalQR }}</span>
          <span class="subtexto-cierre">Banco verificado</span>
        </div>

        <div class="tarjeta-kpi-cierre">
          <span class="etiqueta-cierre">Ventas por Turno</span>
          <span class="monto-cierre">{{ totalesCalculados.ventasManana }} / {{ totalesCalculados.ventasTarde }}</span>
          <span class="subtexto-cierre">Mañana / Tarde</span>
        </div>

        <div class="tarjeta-kpi-cierre total-general">
          <span class="etiqueta-cierre">Gran Total del Período</span>
          <span class="monto-cierre destacado">Bs. {{ totalesCalculados.totalGeneral }}</span>
          <span class="subtexto-cierre">{{ ventasStore.ventas.length }} transacciones</span>
        </div>
      </div>

      <!-- Grilla de Gráficos Interactivos (Chart.js) -->
      <div class="cuadricula-graficos">
        <!-- Gráfico 1: Barras por Turno -->
        <div class="tarjeta-grafico">
          <div class="cabecera-grafico">
            <h3 class="titulo-grafico">Ingresos por Turno</h3>
            <span class="subtitulo-grafico">Comparativa Mañana vs Tarde</span>
          </div>
          <div class="contenedor-canvas">
            <canvas ref="canvasBarras"></canvas>
          </div>
        </div>

        <!-- Gráfico 2: Líneas de Tendencia -->
        <div class="tarjeta-grafico">
          <div class="cabecera-grafico">
            <h3 class="titulo-grafico">Evolución de Transacciones</h3>
            <span class="subtitulo-grafico">Tendencia de cobros</span>
          </div>
          <div class="contenedor-canvas">
            <canvas ref="canvasLineas"></canvas>
          </div>
        </div>

        <!-- Gráfico 3: Dona Métodos de Cobro -->
        <div class="tarjeta-grafico dona">
          <div class="cabecera-grafico">
            <h3 class="titulo-grafico">Métodos de Cobro</h3>
            <span class="subtitulo-grafico">Efectivo vs QR vs Híbrido</span>
          </div>
          <div class="contenedor-canvas">
            <canvas ref="canvasDona"></canvas>
          </div>
        </div>
      </div>
    </div>

    <!-- Pestaña 2: Tabla de Transacciones y Auditoría -->
    <div v-show="pestanaActiva === 'transacciones'">
      <TablaReportes
        :ventas="ventasStore.ventas"
        :totales="totalesCalculados"
        @ver-detalle="verDetalleVenta"
      />
    </div>

    <!-- Modal de Detalle Completo de una Venta Individual -->
    <ModalBase
      :visible="modalDetalleVisible"
      :titulo="`Detalle de Venta: Ticket #${ventaSeleccionada?.id || ''}`"
      ancho-maximo="520px"
      @cerrar="modalDetalleVisible = false"
    >
      <div v-if="ventaSeleccionada" class="cuerpo-modal-ticket-detalle">
        <div class="cabecera-ticket-modal">
          <h3 class="marca-ticket">MOONSTONE JOYERÍA</h3>
          <span class="tipo-comprobante">Recibo de Venta Oficial</span>
          <span class="fecha-ticket">{{ ventaSeleccionada.fechaHora }} &bull; {{ ventaSeleccionada.turno }}</span>
        </div>

        <div class="datos-principales-ticket">
          <div class="fila-dato-ticket">
            <span>Atendido por:</span>
            <strong>{{ ventaSeleccionada.vendedora || 'Personal de Tienda' }}</strong>
          </div>
          <div class="fila-dato-ticket">
            <span>Clienta:</span>
            <strong>{{ ventaSeleccionada.cliente || 'Cliente Casual / Anónimo' }}</strong>
          </div>
          <div class="fila-dato-ticket">
            <span>Método de Cobro:</span>
            <strong>{{ ventaSeleccionada.metodoPago }}</strong>
          </div>
          <div v-if="ventaSeleccionada.metodoPago === 'HIBRIDO'" class="fila-desglose-hibrido-ticket">
            <span>Efectivo: <strong>Bs. {{ ventaSeleccionada.montoEfectivo }}</strong></span>
            <span>QR / Banco: <strong>Bs. {{ ventaSeleccionada.montoQR }}</strong></span>
          </div>

          <div v-if="ventaSeleccionada.observacion" class="fila-nota-ticket">
            <span>Nota / Obsequio:</span>
            <em>{{ ventaSeleccionada.observacion }}</em>
          </div>
        </div>

        <!-- Joyas Incluidas en la Venta -->
        <div class="seccion-articulos-ticket">
          <h4 class="subtitulo-ticket-items">Joyas Incluidas en el Ticket</h4>
          <div class="tabla-mini-articulos">
            <div
              v-for="(it, idx) in (ventaSeleccionada.items || [{ nombre: ventaSeleccionada.producto, cantidad: ventaSeleccionada.cantidad, precio: ventaSeleccionada.montoTotal / ventaSeleccionada.cantidad }])"
              :key="idx"
              class="fila-articulo-ticket"
            >
              <span class="nombre-articulo">{{ it.nombre }} (x{{ it.cantidad }})</span>
              <span class="subtotal-articulo">Bs. {{ (it.precio * it.cantidad) || it.subtotal || ventaSeleccionada.montoTotal }}</span>
            </div>
          </div>
        </div>

        <!-- Total Liquidado -->
        <div class="total-ticket-bloque">
          <div v-if="ventaSeleccionada.descuento > 0" class="fila-descuento-ticket">
            <span>Descuento aplicado:</span>
            <span>- Bs. {{ ventaSeleccionada.descuento }}</span>
          </div>
          <div class="fila-gran-total-ticket">
            <span>Total Cobrado:</span>
            <span class="monto-gran-total">Bs. {{ ventaSeleccionada.montoTotal }}</span>
          </div>
        </div>

        <div class="acciones-ticket-modal no-print">
          <button
            type="button"
            class="boton-imprimir-ticket"
            @click="descargarPDF"
          >
            <IconoLucide nombre="Printer" :tamano="16" />
            <span>Imprimir Ticket</span>
          </button>
          <BotonPrincipal @click="modalDetalleVisible = false">
            Cerrar Detalle
          </BotonPrincipal>
        </div>
      </div>
    </ModalBase>
  </div>
</template>

<style scoped>
.pantalla-reportes {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.cabecera-reportes {
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

.botones-exportacion {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.boton-exportar {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 14px;
  border-radius: var(--radio-md);
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  transition: all var(--transicion-rapida);
  border: 1px solid var(--color-neutral-200);
  background-color: var(--color-blanco);
  color: var(--color-neutral-900);
  box-shadow: var(--sombra-sutil);
}

.boton-exportar:hover {
  background-color: var(--color-neutral-50);
}

.boton-exportar.csv:hover {
  color: #107C41;
  border-color: #107C41;
}

.boton-exportar.pdf:hover {
  color: var(--color-primario);
  border-color: var(--color-primario);
}

/* Barra de Navegación de Reportes */
.barra-navegacion-reportes {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 14px;
}

.selector-pestanas {
  display: inline-flex;
  background-color: var(--color-blanco);
  border: 1px solid var(--color-neutral-200);
  border-radius: var(--radio-md);
  padding: 4px;
  box-shadow: var(--sombra-sutil);
  gap: 4px;
}

.boton-pestana {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  border-radius: var(--radio-sm);
  font-size: 13px;
  font-weight: 600;
  color: var(--color-neutral-600);
  cursor: pointer;
  transition: all var(--transicion-rapida);
}

.boton-pestana.activa {
  background-color: var(--color-primario);
  color: var(--color-blanco);
}

.chips-rango {
  display: inline-flex;
  background-color: var(--color-blanco);
  border: 1px solid var(--color-neutral-200);
  border-radius: var(--radio-md);
  padding: 3px;
  box-shadow: var(--sombra-sutil);
}

.chip-rango-btn {
  padding: 6px 12px;
  border-radius: var(--radio-sm);
  font-size: 12px;
  font-weight: 600;
  color: var(--color-neutral-600);
  cursor: pointer;
  transition: all var(--transicion-rapida);
}

.chip-rango-btn.activo {
  background-color: var(--color-neutral-900);
  color: var(--color-blanco);
}

/* Sección de Gráficos */
.seccion-graficos {
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

/* Grilla de Gráficos */
.cuadricula-graficos {
  display: grid;
  grid-template-columns: 1fr;
  gap: 20px;
}

@media (min-width: 768px) {
  .cuadricula-graficos {
    grid-template-columns: 1fr 1fr;
  }
}

@media (min-width: 1100px) {
  .cuadricula-graficos {
    grid-template-columns: 1.1fr 1.1fr 0.8fr;
  }
}

.tarjeta-grafico {
  background-color: var(--color-blanco);
  border: 1px solid var(--color-neutral-200);
  border-radius: var(--radio-lg);
  padding: 18px 20px;
  box-shadow: var(--sombra-sutil);
  display: flex;
  flex-direction: column;
  gap: 14px;
  min-height: 320px;
}

.cabecera-grafico {
  display: flex;
  flex-direction: column;
  gap: 2px;
  border-bottom: 1px solid var(--color-neutral-100);
  padding-bottom: 8px;
}

.titulo-grafico {
  font-size: 15px;
  font-weight: 700;
  color: var(--color-neutral-900);
}

.subtitulo-grafico {
  font-size: 11px;
  color: var(--color-neutral-600);
}

.contenedor-canvas {
  position: relative;
  flex: 1;
  width: 100%;
  min-height: 220px;
}

/* Modal Detalle Ticket */
.cuerpo-modal-ticket-detalle {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.cabecera-ticket-modal {
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding-bottom: 12px;
  border-bottom: 1px dashed var(--color-neutral-300);
}

.marca-ticket {
  font-size: 18px;
  font-weight: 800;
  color: var(--color-primario);
  letter-spacing: 0.1em;
}

.tipo-comprobante {
  font-size: 13px;
  font-weight: 700;
  color: var(--color-neutral-900);
}

.fecha-ticket {
  font-size: 11px;
  color: var(--color-neutral-600);
}

.datos-principales-ticket {
  display: flex;
  flex-direction: column;
  gap: 6px;
  background-color: var(--color-fondo-panel);
  border: 1px solid var(--color-neutral-200);
  border-radius: var(--radio-md);
  padding: 12px 14px;
}

.fila-dato-ticket {
  display: flex;
  justify-content: space-between;
  font-size: 12.5px;
  color: var(--color-neutral-600);
}

.fila-dato-ticket strong {
  color: var(--color-neutral-900);
}

.fila-desglose-hibrido-ticket {
  display: flex;
  justify-content: space-between;
  font-size: 11.5px;
  background-color: var(--color-primario-fondo);
  padding: 4px 8px;
  border-radius: var(--radio-sm);
  color: var(--color-primario);
  margin-top: 4px;
}

.fila-nota-ticket {
  display: flex;
  flex-direction: column;
  gap: 2px;
  margin-top: 6px;
  padding-top: 6px;
  border-top: 1px solid var(--color-neutral-200);
  font-size: 11.5px;
  color: var(--color-neutral-800);
}

.seccion-articulos-ticket {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.subtitulo-ticket-items {
  font-size: 13px;
  font-weight: 700;
  color: var(--color-neutral-900);
}

.tabla-mini-articulos {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.fila-articulo-ticket {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
  padding: 6px 0;
  border-bottom: 1px solid var(--color-neutral-100);
}

.nombre-articulo {
  color: var(--color-neutral-900);
}

.subtotal-articulo {
  font-weight: 700;
  color: var(--color-neutral-900);
}

.total-ticket-bloque {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding-top: 10px;
  border-top: 1px dashed var(--color-neutral-300);
}

.fila-descuento-ticket {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
  color: var(--color-peligro);
  font-weight: 600;
}

.fila-gran-total-ticket {
  display: flex;
  justify-content: space-between;
  font-size: 16px;
  font-weight: 800;
  color: var(--color-neutral-900);
}

.monto-gran-total {
  font-size: 20px;
  color: var(--color-primario);
}

.acciones-ticket-modal {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 10px;
  padding-top: 12px;
  border-top: 1px solid var(--color-neutral-200);
}

.boton-imprimir-ticket {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 10px 14px;
  border-radius: var(--radio-md);
  background-color: var(--color-neutral-50);
  border: 1px solid var(--color-neutral-200);
  color: var(--color-neutral-800);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transicion-rapida);
}

.boton-imprimir-ticket:hover {
  background-color: var(--color-neutral-200);
}

@media print {
  .no-print {
    display: none !important;
  }
}
</style>
