<script setup>
import { ref, computed } from 'vue'
import { useProductosStore } from '../stores/productos'
import { useVentasStore } from '../stores/ventas'
import { useAuthStore } from '../stores/auth'
import BuscadorProducto from '../components/admin/BuscadorProducto.vue'
import SelectorPago from '../components/admin/SelectorPago.vue'
import BotonPrincipal from '../components/common/BotonPrincipal.vue'
import ModalBase from '../components/common/ModalBase.vue'
import IconoLucide from '../components/common/IconoLucide.vue'

const productosStore = useProductosStore()
const ventasStore = useVentasStore()
const authStore = useAuthStore()

// Estado del formulario de venta rápida
const joyaSeleccionada = ref(null)
const cantidad = ref(1)
const descuento = ref(0)
const metodoPago = ref('EFECTIVO')
const observacion = ref('')

// Estado de confirmación / Modal de éxito
const modalExitoVisible = ref(false)
const ultimaVentaRegistrada = ref(null)

// Validaciones y cálculos
const stockMaximo = computed(() => {
  if (!joyaSeleccionada.value) return 0
  return joyaSeleccionada.value.stockTienda !== undefined
    ? joyaSeleccionada.value.stockTienda
    : joyaSeleccionada.value.stock
})

const subtotal = computed(() => {
  if (!joyaSeleccionada.value) return 0
  const precio = Number(joyaSeleccionada.value.precio_venta || joyaSeleccionada.value.precio || 0)
  return precio * Number(cantidad.value || 0)
})

const totalFinal = computed(() => {
  return Math.max(0, subtotal.value - Number(descuento.value || 0))
})

const formularioValido = computed(() => {
  return (
    joyaSeleccionada.value &&
    cantidad.value > 0 &&
    cantidad.value <= stockMaximo.value &&
    totalFinal.value >= 0
  )
})

const registrarVentaMostrador = () => {
  if (!formularioValido.value) return

  const venta = ventasStore.registrarVenta({
    producto: joyaSeleccionada.value,
    cantidad: cantidad.value,
    metodoPago: metodoPago.value,
    observacion: observacion.value,
  })

  // Decrementamos stock localmente
  if (joyaSeleccionada.value.stockTienda !== undefined) {
    joyaSeleccionada.value.stockTienda -= cantidad.value
  } else if (joyaSeleccionada.value.stock !== undefined) {
    joyaSeleccionada.value.stock -= cantidad.value
  }

  ultimaVentaRegistrada.value = venta
  modalExitoVisible.value = true

  // Reseteamos formulario
  joyaSeleccionada.value = null
  cantidad.value = 1
  descuento.value = 0
  observacion.value = ''
}
</script>

<template>
  <div class="pantalla-registro-venta">
    <header class="cabecera-registro">
      <div>
        <h1 class="titulo-vista">Registrar Venta en Mostrador</h1>
        <p class="subtitulo-vista">Punto de cobro directo y entrega física presencial</p>
      </div>

      <!-- Indicador automático de vendedora y turno -->
      <div class="badge-vendedora-turno">
        <IconoLucide nombre="UserCheck" :tamano="16" />
        <span>Vendedora: <strong>{{ authStore.usuario?.nombre || 'Administradora' }}</strong> ({{ ventasStore.turnoActual }})</span>
      </div>
    </header>

    <div class="contenedor-formulario-venta">
      <form class="tarjeta-formulario-venta" @submit.prevent="registrarVentaMostrador">
        <!-- 1. Buscador Rápido de Joya -->
        <BuscadorProducto
          v-model="joyaSeleccionada"
          :productos="productosStore.productos"
        />

        <!-- 2. Cantidad y Descuento -->
        <div class="fila-dos-campos">
          <div class="campo-grupo">
            <label class="etiqueta-campo">Cantidad a vender *</label>
            <input
              v-model.number="cantidad"
              type="number"
              min="1"
              :max="stockMaximo || 1"
              :disabled="!joyaSeleccionada || stockMaximo === 0"
              class="input-control"
            />
            <span v-if="joyaSeleccionada" class="ayuda-stock">
              Disponible físico: <strong>{{ stockMaximo }} unidades</strong>
            </span>
          </div>

          <div class="campo-grupo">
            <label class="etiqueta-campo">Descuento aplicado (Bs.)</label>
            <input
              v-model.number="descuento"
              type="number"
              min="0"
              :max="subtotal"
              :disabled="!joyaSeleccionada"
              class="input-control"
            />
          </div>
        </div>

        <!-- 3. Selector de Método de Pago -->
        <div class="campo-grupo">
          <label class="etiqueta-campo">Método de cobro verificado *</label>
          <SelectorPago v-model="metodoPago" />
        </div>

        <!-- 4. Observaciones opcionales -->
        <div class="campo-grupo">
          <label class="etiqueta-campo">Nota o referencia de pago (opcional)</label>
          <input
            v-model="observacion"
            type="text"
            placeholder="Ej. N° de transacción QR, cliente frecuente, etc."
            class="input-control"
          />
        </div>

        <!-- 5. Resumen de Liquidación -->
        <div class="resumen-ticket-cobro">
          <div class="fila-ticket">
            <span>Subtotal:</span>
            <span>Bs. {{ subtotal }}</span>
          </div>
          <div v-if="descuento > 0" class="fila-ticket descuento">
            <span>Descuento:</span>
            <span>- Bs. {{ descuento }}</span>
          </div>
          <div class="fila-ticket total">
            <span>Total a Cobrar:</span>
            <span class="monto-final">Bs. {{ totalFinal }}</span>
          </div>
        </div>

        <!-- Botón de Confirmación -->
        <BotonPrincipal
          tipo="submit"
          ancho-completo
          :deshabilitado="!formularioValido"
        >
          <template #iconoIzquierda>
            <IconoLucide nombre="CheckCircle" :tamano="20" />
          </template>
          <span>Confirmar y Registrar Venta</span>
        </BotonPrincipal>
      </form>
    </div>

    <!-- Modal de Comprobante / Venta Exitosa -->
    <ModalBase
      :visible="modalExitoVisible"
      titulo="¡Venta Registrada Exitosamente!"
      ancho-maximo="460px"
      @cerrar="modalExitoVisible = false"
    >
      <div v-if="ultimaVentaRegistrada" class="comprobante-exito">
        <div class="icono-check-grande">
          <IconoLucide nombre="Check" :tamano="36" />
        </div>
        <h3 class="titulo-ticket">Ticket N° {{ ultimaVentaRegistrada.id }}</h3>
        <p class="fecha-ticket">{{ ultimaVentaRegistrada.fechaHora }} &bull; {{ ultimaVentaRegistrada.turno }}</p>

        <div class="cuerpo-ticket">
          <div class="item-ticket-fila">
            <span>Joya:</span>
            <strong>{{ ultimaVentaRegistrada.producto }}</strong>
          </div>
          <div class="item-ticket-fila">
            <span>Cantidad:</span>
            <strong>{{ ultimaVentaRegistrada.cantidad }} unidades</strong>
          </div>
          <div class="item-ticket-fila">
            <span>Método de Cobro:</span>
            <strong>{{ ultimaVentaRegistrada.metodoPago }}</strong>
          </div>
          <div class="divisor-ticket"></div>
          <div class="item-ticket-fila total-resaltado">
            <span>Importe Cobrado:</span>
            <span class="total-valor">Bs. {{ ultimaVentaRegistrada.montoTotal }}</span>
          </div>
        </div>

        <BotonPrincipal
          ancho-completo
          @click="modalExitoVisible = false"
        >
          Aceptar y Realizar Otra Venta
        </BotonPrincipal>
      </div>
    </ModalBase>
  </div>
</template>

<style scoped>
.pantalla-registro-venta {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.cabecera-registro {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
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

.badge-vendedora-turno {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background-color: var(--color-blanco);
  border: 1px solid var(--color-neutral-200);
  padding: 6px 12px;
  border-radius: var(--radio-md);
  font-size: 13px;
  color: var(--color-neutral-900);
  box-shadow: var(--sombra-sutil);
}

.contenedor-formulario-venta {
  display: flex;
  justify-content: center;
}

.tarjeta-formulario-venta {
  width: 100%;
  max-width: 600px;
  background-color: var(--color-blanco);
  border: 1px solid var(--color-neutral-200);
  border-radius: var(--radio-lg);
  box-shadow: var(--sombra-sutil);
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 18px;
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
  transition: border-color var(--transicion-rapida);
}

.input-control:focus {
  border-color: var(--color-neutral-900);
}

.input-control:disabled {
  background-color: var(--color-neutral-50);
  cursor: not-allowed;
}

.ayuda-stock {
  font-size: 11px;
  color: var(--color-neutral-600);
}

.resumen-ticket-cobro {
  background-color: var(--color-neutral-50);
  border: 1px solid var(--color-neutral-200);
  border-radius: var(--radio-md);
  padding: 14px 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.fila-ticket {
  display: flex;
  justify-content: space-between;
  font-size: 14px;
  color: var(--color-neutral-600);
}

.fila-ticket.descuento {
  color: var(--color-peligro);
}

.fila-ticket.total {
  font-size: 16px;
  font-weight: 700;
  color: var(--color-neutral-900);
  padding-top: 8px;
  border-top: 1px dashed var(--color-neutral-200);
}

.monto-final {
  font-size: 20px;
  font-weight: 800;
}

/* Modal Comprobante */
.comprobante-exito {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  text-align: center;
  padding: 8px 0;
}

.icono-check-grande {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background-color: var(--color-exito-fondo);
  color: var(--color-exito);
  display: flex;
  align-items: center;
  justify-content: center;
}

.titulo-ticket {
  font-size: 18px;
  font-weight: 700;
  color: var(--color-neutral-900);
}

.fecha-ticket {
  font-size: 12px;
  color: var(--color-neutral-600);
}

.cuerpo-ticket {
  width: 100%;
  background-color: var(--color-neutral-50);
  border: 1px solid var(--color-neutral-200);
  border-radius: var(--radio-md);
  padding: 14px 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  text-align: left;
}

.item-ticket-fila {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
  color: var(--color-neutral-600);
}

.item-ticket-fila strong {
  color: var(--color-neutral-900);
}

.divisor-ticket {
  height: 1px;
  background-color: var(--color-neutral-200);
  margin: 4px 0;
}

.total-resaltado {
  font-size: 15px;
  font-weight: 700;
}

.total-valor {
  font-size: 18px;
  color: var(--color-exito);
  font-weight: 800;
}
</style>
