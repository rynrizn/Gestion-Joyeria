<script setup>
import { ref, computed } from 'vue'
import { useVentasStore } from '../stores/ventas'
import TablaReportes from '../components/admin/TablaReportes.vue'
import IconoLucide from '../components/common/IconoLucide.vue'

const ventasStore = useVentasStore()

// Filtros de fecha
const rangoSeleccionado = ref('hoy')
const fechaInicio = ref('')
const fechaFin = ref('')

const rangos = [
  { valor: 'hoy', etiqueta: 'Hoy' },
  { valor: 'semana', etiqueta: 'Esta semana' },
  { valor: 'mes', etiqueta: 'Este mes' },
  { valor: 'personalizado', etiqueta: 'Personalizado' },
]

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

// Función para exportar a CSV descargable
const exportarCSV = () => {
  const encabezados = ['ID', 'FechaHora', 'Producto', 'Cantidad', 'MetodoPago', 'Turno', 'TotalBs']
  const filas = ventasStore.ventas.map((v) => [
    v.id,
    `"${v.fechaHora}"`,
    `"${v.producto}"`,
    v.cantidad,
    v.metodoPago,
    `"${v.turno}"`,
    v.montoTotal,
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

// Función para descargar / imprimir PDF
const descargarPDF = () => {
  window.print()
}
</script>

<template>
  <div class="pantalla-reportes">
    <!-- Cabecera -->
    <header class="cabecera-reportes">
      <div>
        <h1 class="titulo-vista">Reportes y Cierres de Caja</h1>
        <p class="subtitulo-vista">
          Balance de ventas por método de cobro y descargas para contabilidad
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
          <span>Descargar Reporte (.PDF)</span>
        </button>
      </div>
    </header>

    <!-- Selector de Rango de Fechas -->
    <section class="barra-filtro-fechas no-print">
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

      <!-- Selectores de Fecha si es personalizado -->
      <div v-if="rangoSeleccionado === 'personalizado'" class="campos-fecha-personalizada">
        <div class="campo-fecha">
          <label class="etiqueta-fecha">Desde:</label>
          <input v-model="fechaInicio" type="date" class="input-fecha" />
        </div>
        <div class="campo-fecha">
          <label class="etiqueta-fecha">Hasta:</label>
          <input v-model="fechaFin" type="date" class="input-fecha" />
        </div>
      </div>
    </section>

    <!-- Componente de Tabla y Resumen -->
    <TablaReportes
      :ventas="ventasStore.ventas"
      :totales="totalesCalculados"
    />
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
  font-weight: 700;
  color: var(--color-neutral-900);
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
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transicion-rapida);
  border: 1px solid var(--color-neutral-200);
  background-color: var(--color-blanco);
  color: var(--color-neutral-900);
  box-shadow: var(--sombra-sutil);
}

.boton-exportar:hover {
  background-color: var(--color-neutral-50);
  border-color: #d1d5db;
}

.boton-exportar.csv:hover {
  color: #107C41; /* Verde Excel sutil */
}

.boton-exportar.pdf:hover {
  color: #DC2626; /* Rojo PDF */
}

/* Barra de Filtro de Fechas */
.barra-filtro-fechas {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
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
  padding: 6px 14px;
  border-radius: var(--radio-sm);
  font-size: 13px;
  font-weight: 500;
  color: var(--color-neutral-600);
  cursor: pointer;
  transition: all var(--transicion-rapida);
}

.chip-rango-btn.activo {
  background-color: var(--color-neutral-900);
  color: var(--color-blanco);
  font-weight: 600;
}

.campos-fecha-personalizada {
  display: flex;
  align-items: center;
  gap: 12px;
}

.campo-fecha {
  display: flex;
  align-items: center;
  gap: 6px;
}

.etiqueta-fecha {
  font-size: 12px;
  font-weight: 600;
  color: var(--color-neutral-600);
}

.input-fecha {
  padding: 6px 10px;
  border: 1px solid var(--color-neutral-200);
  border-radius: var(--radio-md);
  background-color: var(--color-blanco);
  font-size: 13px;
  color: var(--color-neutral-900);
  outline: none;
}

/* Ajustes de impresión */
@media print {
  .no-print {
    display: none !important;
  }
}
</style>
