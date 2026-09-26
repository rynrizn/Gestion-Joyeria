<script setup>
import { ref, computed, onMounted } from 'vue'
import { useProductosStore } from '../stores/productos'
import { useVentasStore } from '../stores/ventas'
import { useClientesStore } from '../stores/clientes'
import { useReservasStore } from '../stores/reservas'
import { useAuthStore } from '../stores/auth'
import BuscadorProducto from '../components/admin/BuscadorProducto.vue'
import SelectorPago from '../components/admin/SelectorPago.vue'
import BotonPrincipal from '../components/common/BotonPrincipal.vue'
import ModalBase from '../components/common/ModalBase.vue'
import ModalAlerta from '../components/common/ModalAlerta.vue'
import InputTexto from '../components/common/InputTexto.vue'
import IconoLucide from '../components/common/IconoLucide.vue'

const productosStore = useProductosStore()
const ventasStore = useVentasStore()
const clientesStore = useClientesStore()
const reservasStore = useReservasStore()
const authStore = useAuthStore()

// Carrito de la venta actual (Multi-producto)
const itemsVenta = ref([])
const productoBuscador = ref(null)

// Datos de la clienta
const idClienteSeleccionado = ref('casual')
const modalNuevaClientaVisible = ref(false)
const nuevoClienteNombre = ref('')
const nuevoClienteTelefono = ref('')
const nuevoClienteCI = ref('')

// Finanzas y pago
const metodoPago = ref('EFECTIVO')
const montoEfectivo = ref(0)
const montoQR = ref(0)
const descuento = ref(0)
const observacion = ref('')

// Modales de confirmación y error
const modalExitoVisible = ref(false)
const ultimaVentaRegistrada = ref(null)
const modalErrorVisible = ref(false)
const modalErrorTitulo = ref('')
const modalErrorMensaje = ref('')
const modalErrorDetalles = ref('')

// Verificar si venimos de una reserva del Dashboard
onMounted(() => {
  if (reservasStore.reservaActivaParaVenta) {
    const res = reservasStore.reservaActivaParaVenta

    // 1. Cargar clienta
    if (res.cliente) {
      const encontrada = clientesStore.clientes.find(
        (c) => c.nombre.toLowerCase() === res.cliente.toLowerCase()
      )
      if (encontrada) {
        idClienteSeleccionado.value = encontrada.id
      } else {
        // Registramos temporalmente el nombre
        observacion.value = `Reserva #${res.id} convertida a venta`
      }
    }

    // 2. Cargar items reservados
    if (res.items && res.items.length) {
      itemsVenta.value = res.items.map((it) => {
        const prodCompleto = productosStore.obtenerPorId(it.id)
        return {
          id: it.id,
          nombre: it.nombre,
          precio: Number(it.precio),
          cantidad: Number(it.cantidad || 1),
          imagen: prodCompleto?.imagen || '',
          stockMaximo: prodCompleto?.stockTienda ?? prodCompleto?.stock ?? 10,
        }
      })
    } else if (res.idProducto) {
      const prod = productosStore.obtenerPorId(res.idProducto)
      if (prod) {
        itemsVenta.value = [
          {
            id: prod.id,
            nombre: prod.nombre,
            precio: Number(prod.precio_venta || prod.precio),
            cantidad: Number(res.cantidad || 1),
            imagen: prod.imagen || '',
            stockMaximo: prod.stockTienda ?? prod.stock ?? 10,
          },
        ]
      }
    }

    // 3. Limpiar reserva activa para no duplicar en futuros accesos
    reservasStore.limpiarReservaActiva()
  }
})

// Acciones sobre el carrito de venta
const agregarJoyaAlTicket = (joya) => {
  if (!joya) return

  const stockDisponible = joya.stockTienda !== undefined ? joya.stockTienda : (joya.stock || 0)

  if (stockDisponible <= 0) {
    modalErrorTitulo.value = 'Pieza Sin Stock Físico'
    modalErrorMensaje.value = `La joya "${joya.nombre}" no tiene unidades disponibles en tienda física para venta directa.`
    modalErrorDetalles.value = 'Por favor realiza un traslado de stock desde Central antes de vender.'
    modalErrorVisible.value = true
    productoBuscador.value = null
    return
  }

  const existente = itemsVenta.value.find((i) => i.id === joya.id)

  if (existente) {
    if (existente.cantidad < stockDisponible) {
      existente.cantidad += 1
    } else {
      modalErrorTitulo.value = 'Límite de Stock Alcanzado'
      modalErrorMensaje.value = `Ya has alcanzado el máximo disponible de "${joya.nombre}" (${stockDisponible} unidades).`
      modalErrorDetalles.value = ''
      modalErrorVisible.value = true
    }
  } else {
    itemsVenta.value.push({
      id: joya.id,
      nombre: joya.nombre,
      precio: Number(joya.precio_venta || joya.precio || 0),
      cantidad: 1,
      imagen: joya.imagen || '',
      stockMaximo: stockDisponible,
    })
  }

  productoBuscador.value = null
}

const incrementarCantidad = (item) => {
  if (item.cantidad < item.stockMaximo) {
    item.cantidad += 1
  } else {
    modalErrorTitulo.value = 'Stock Físico Insuficiente'
    modalErrorMensaje.value = `Solo se cuenta con ${item.stockMaximo} unidad(es) de "${item.nombre}" en tienda.`
    modalErrorDetalles.value = ''
    modalErrorVisible.value = true
  }
}

const decrementarCantidad = (index) => {
  if (itemsVenta.value[index].cantidad > 1) {
    itemsVenta.value[index].cantidad -= 1
  } else {
    itemsVenta.value.splice(index, 1)
  }
}

const eliminarDelTicket = (index) => {
  itemsVenta.value.splice(index, 1)
}

// Cálculos financieros
const subtotalBruto = computed(() => {
  return itemsVenta.value.reduce((acc, it) => acc + (it.precio * it.cantidad), 0)
})

const totalFinal = computed(() => {
  return Math.max(0, subtotalBruto.value - Number(descuento.value || 0))
})

// Lógica de validación para método de pago Híbrido
const sumaMontosHibrido = computed(() => {
  return Number(montoEfectivo.value || 0) + Number(montoQR.value || 0)
})

const diferenciaHibrido = computed(() => {
  return totalFinal.value - sumaMontosHibrido.value
})

const pagoHibridoCuadra = computed(() => {
  if (metodoPago.value !== 'HIBRIDO') return true
  return Math.abs(diferenciaHibrido.value) < 0.01
})

// Obtener nombre de la clienta
const nombreClientaFinal = computed(() => {
  if (idClienteSeleccionado.value === 'casual') return 'Cliente Casual / Anónimo'
  const c = clientesStore.obtenerPorId(idClienteSeleccionado.value)
  return c ? c.nombre : 'Cliente Casual'
})

// Registro de nueva clienta rápida
const guardarNuevaClientaRapida = () => {
  if (!nuevoClienteNombre.value.trim()) {
    modalErrorTitulo.value = 'Nombre Obligatorio'
    modalErrorMensaje.value = 'Por favor ingresa al menos el nombre de la clienta.'
    modalErrorDetalles.value = ''
    modalErrorVisible.value = true
    return
  }

  const creada = clientesStore.registrarCliente({
    nombre: nuevoClienteNombre.value,
    telefono: nuevoClienteTelefono.value,
    ci: nuevoClienteCI.value,
    tipo: 'NUEVA',
    notas: 'Registrada en punto de venta mostrador',
  })

  idClienteSeleccionado.value = creada.id
  modalNuevaClientaVisible.value = false
  nuevoClienteNombre.value = ''
  nuevoClienteTelefono.value = ''
  nuevoClienteCI.value = ''
}

// Procesar confirmación de venta
const procesarRegistroVenta = () => {
  // 1. Validar que haya joyas seleccionadas
  if (itemsVenta.value.length === 0) {
    modalErrorTitulo.value = 'Ticket Vacío'
    modalErrorMensaje.value = 'Debes añadir al menos una joya al ticket antes de confirmar la venta.'
    modalErrorDetalles.value = 'Usa el buscador superior para agregar productos.'
    modalErrorVisible.value = true
    return
  }

  // 2. Validar método de pago híbrido
  if (metodoPago.value === 'HIBRIDO') {
    if (!pagoHibridoCuadra.value) {
      modalErrorTitulo.value = 'Importe Híbrido Descuadrado'
      modalErrorMensaje.value = `La suma de Efectivo (Bs. ${montoEfectivo.value}) y QR (Bs. ${montoQR.value}) es de Bs. ${sumaMontosHibrido.value}, pero el total a cobrar es de Bs. ${totalFinal.value}.`
      modalErrorDetalles.value = diferenciaHibrido.value > 0
        ? `Faltan Bs. ${diferenciaHibrido.value} para completar el importe.`
        : `Hay un exceso de Bs. ${Math.abs(diferenciaHibrido.value)} sobre el total.`
      modalErrorVisible.value = true
      return
    }
  }

  // 3. Registrar venta en el store de ventas con registro implícito de la vendedora en turno
  const vendedoraNombre = authStore.usuario?.nombre || (authStore.esAdmin ? 'Dueña del Negocio' : 'Personal de Tienda')
  const idVendedora = authStore.usuario?.id || 1

  const ventaRegistrada = ventasStore.registrarVenta({
    items: itemsVenta.value,
    cliente: nombreClientaFinal.value,
    metodoPago: metodoPago.value,
    montoEfectivo: metodoPago.value === 'HIBRIDO' ? montoEfectivo.value : (metodoPago.value === 'EFECTIVO' ? totalFinal.value : 0),
    montoQR: metodoPago.value === 'HIBRIDO' ? montoQR.value : (metodoPago.value === 'QR' ? totalFinal.value : 0),
    descuento: Number(descuento.value || 0),
    observacion: observacion.value.trim(),
    vendedora: vendedoraNombre,
    idVendedora,
    turno: ventasStore.turnoActual,
  })

  // 4. Descontar stock localmente en productosStore
  itemsVenta.value.forEach((it) => {
    const prod = productosStore.obtenerPorId(it.id)
    if (prod) {
      if (prod.stockTienda !== undefined) {
        prod.stockTienda = Math.max(0, prod.stockTienda - it.cantidad)
      } else if (prod.stock !== undefined) {
        prod.stock = Math.max(0, prod.stock - it.cantidad)
      }
    }
  })

  // 5. Mostrar modal de comprobante y reiniciar estado
  ultimaVentaRegistrada.value = ventaRegistrada
  modalExitoVisible.value = true

  itemsVenta.value = []
  idClienteSeleccionado.value = 'casual'
  metodoPago.value = 'EFECTIVO'
  montoEfectivo.value = 0
  montoQR.value = 0
  descuento.value = 0
  observacion.value = ''
}
</script>

<template>
  <div class="pantalla-registro-venta">
    <!-- Encabezado con Indicador Implícito de Vendedora y Turno -->
    <header class="cabecera-registro">
      <div>
        <h1 class="titulo-vista">Punto de Cobro (POS)</h1>
        <p class="subtitulo-vista">Registro de ventas multi-producto, pago híbrido y asignación de clientas</p>
      </div>

      <div class="badge-vendedora-turno">
        <IconoLucide nombre="ShieldCheck" :tamano="16" />
        <span>
          Responsable: <strong>{{ authStore.esAdmin ? 'Dueña (Admin)' : 'Personal de Tienda' }}</strong>
          &bull; {{ ventasStore.turnoActual }}
        </span>
      </div>
    </header>

    <div class="cuadricula-pos">
      <!-- Columna Izquierda: Selección de Joyas y Carrito de Venta -->
      <section class="tarjeta-panel-pos columna-productos">
        <div class="cabecera-bloque">
          <IconoLucide nombre="Search" :tamano="18" />
          <h2 class="titulo-bloque">1. Añadir Joyas al Ticket</h2>
        </div>

        <!-- Buscador de Joyas -->
        <BuscadorProducto
          v-model="productoBuscador"
          :productos="productosStore.productos"
          @seleccionar="agregarJoyaAlTicket"
        />

        <!-- Lista de Joyas Añadidas al Ticket -->
        <div class="seccion-ticket-items">
          <div class="cabecera-lista-items">
            <span>Joyas a Cobrar ({{ itemsVenta.length }})</span>
            <span v-if="itemsVenta.length > 0" class="total-piezas-texto">
              {{ itemsVenta.reduce((acc, it) => acc + it.cantidad, 0) }} piezas en total
            </span>
          </div>

          <div v-if="itemsVenta.length > 0" class="lista-items-venta">
            <div
              v-for="(item, index) in itemsVenta"
              :key="item.id"
              class="fila-item-ticket"
            >
              <img
                v-if="item.imagen"
                :src="item.imagen"
                :alt="item.nombre"
                class="miniatura-ticket"
              />
              <div v-else class="sin-foto-ticket">
                <IconoLucide nombre="Package" :tamano="18" />
              </div>

              <div class="info-item-ticket">
                <span class="nombre-item-ticket">{{ item.nombre }}</span>
                <span class="precio-unitario-ticket">Bs. {{ item.precio }} c/u</span>
              </div>

              <!-- Controles de Cantidad -->
              <div class="controles-cantidad-ticket">
                <button
                  type="button"
                  class="btn-cantidad-ticket"
                  title="Restar una unidad"
                  @click="decrementarCantidad(index)"
                >
                  <IconoLucide nombre="Minus" :tamano="13" />
                </button>
                <span class="cifra-cantidad-ticket">{{ item.cantidad }}</span>
                <button
                  type="button"
                  class="btn-cantidad-ticket"
                  title="Sumar una unidad"
                  @click="incrementarCantidad(item)"
                >
                  <IconoLucide nombre="Plus" :tamano="13" />
                </button>
              </div>

              <!-- Subtotal por Joya -->
              <span class="subtotal-item-ticket">Bs. {{ item.precio * item.cantidad }}</span>

              <!-- Botón Eliminar -->
              <button
                type="button"
                class="boton-eliminar-item"
                title="Eliminar del ticket"
                @click="eliminarDelTicket(index)"
              >
                <IconoLucide nombre="X" :tamano="15" />
              </button>
            </div>
          </div>

          <div v-else class="ticket-vacio">
            <IconoLucide nombre="ShoppingBag" :tamano="32" />
            <p>El ticket de venta está vacío.</p>
            <span>Busca una joya en la barra superior para agregarla a este cobro.</span>
          </div>
        </div>
      </section>

      <!-- Columna Derecha: Clienta, Método de Pago, Notas y Cobro -->
      <section class="tarjeta-panel-pos columna-liquidacion">
        <!-- 2. Clienta y Notas -->
        <div class="bloque-liquidacion">
          <div class="cabecera-bloque">
            <IconoLucide nombre="User" :tamano="18" />
            <h2 class="titulo-bloque">2. Clienta y Observaciones</h2>
          </div>

          <!-- Selector de Clienta -->
          <div class="grupo-campo">
            <div class="fila-etiqueta-accion">
              <label class="etiqueta-campo">Asignar Clienta</label>
              <button
                type="button"
                class="enlace-nueva-clienta"
                @click="modalNuevaClientaVisible = true"
              >
                <IconoLucide nombre="UserPlus" :tamano="13" />
                <span>+ Nueva Clienta</span>
              </button>
            </div>

            <select v-model="idClienteSeleccionado" class="control-select">
              <option value="casual">Cliente Casual / Anónimo (Sin registrar)</option>
              <option
                v-for="c in clientesStore.clientes"
                :key="c.id"
                :value="c.id"
              >
                {{ c.nombre }} {{ c.telefono ? `(${c.telefono})` : '' }} &bull; {{ c.tipo }}
              </option>
            </select>
          </div>

          <!-- Notas / Obsequio Especial -->
          <div class="grupo-campo">
            <label class="etiqueta-campo">Nota de Venta / Obsequio (opcional)</label>
            <input
              v-model="observacion"
              type="text"
              placeholder="Ej. Regalo adicional por compra mayor, descuento de dueña..."
              class="input-control"
            />
          </div>
        </div>

        <!-- 3. Método de Cobro y Pago Híbrido -->
        <div class="bloque-liquidacion">
          <div class="cabecera-bloque">
            <IconoLucide nombre="CreditCard" :tamano="18" />
            <h2 class="titulo-bloque">3. Método de Pago</h2>
          </div>

          <SelectorPago v-model="metodoPago" />

          <!-- Campos Dinámicos para Pago Híbrido -->
          <div v-if="metodoPago === 'HIBRIDO'" class="caja-pago-hibrido">
            <div class="cabecera-hibrido">
              <IconoLucide nombre="Split" :tamano="16" />
              <span>Desglose de Pago Híbrido</span>
            </div>

            <div class="fila-dos-montos">
              <div class="campo-grupo">
                <label class="etiqueta-sub">Monto Efectivo (Bs.) *</label>
                <input
                  v-model.number="montoEfectivo"
                  type="number"
                  min="0"
                  class="input-control"
                  placeholder="0"
                />
              </div>

              <div class="campo-grupo">
                <label class="etiqueta-sub">Monto QR / Transf. (Bs.) *</label>
                <input
                  v-model.number="montoQR"
                  type="number"
                  min="0"
                  class="input-control"
                  placeholder="0"
                />
              </div>
            </div>

            <!-- Validación Visual en Tiempo Real -->
            <div
              class="alerta-balance-hibrido"
              :class="{ correcto: pagoHibridoCuadra, error: !pagoHibridoCuadra }"
            >
              <IconoLucide
                :nombre="pagoHibridoCuadra ? 'CheckCircle2' : 'AlertCircle'"
                :tamano="16"
              />
              <span v-if="pagoHibridoCuadra">
                ¡Los montos cuadran perfectamente con el total (Bs. {{ totalFinal }})!
              </span>
              <span v-else-if="diferenciaHibrido > 0">
                Faltan <strong>Bs. {{ diferenciaHibrido }}</strong> para cubrir el total.
              </span>
              <span v-else>
                Hay un exceso de <strong>Bs. {{ Math.abs(diferenciaHibrido) }}</strong> sobre el total.
              </span>
            </div>
          </div>
        </div>

        <!-- 4. Resumen y Confirmación -->
        <div class="resumen-ticket-cobro">
          <div class="fila-ticket">
            <span>Subtotal Bruto:</span>
            <span>Bs. {{ subtotalBruto }}</span>
          </div>

          <!-- Descuento Opcional -->
          <div class="fila-ticket">
            <label for="input-descuento">Descuento aplicado:</label>
            <div class="caja-descuento">
              <span>Bs.</span>
              <input
                id="input-descuento"
                v-model.number="descuento"
                type="number"
                min="0"
                :max="subtotalBruto"
                class="input-descuento-mini"
              />
            </div>
          </div>

          <div class="fila-ticket total">
            <span>Total a Cobrar:</span>
            <span class="monto-final">Bs. {{ totalFinal }}</span>
          </div>
        </div>

        <!-- Botón de Confirmación Principal -->
        <BotonPrincipal
          ancho-completo
          :deshabilitado="itemsVenta.length === 0 || (metodoPago === 'HIBRIDO' && !pagoHibridoCuadra)"
          @click="procesarRegistroVenta"
        >
          <template #iconoIzquierda>
            <IconoLucide nombre="CheckCircle" :tamano="18" />
          </template>
          <span>Confirmar y Cobrar (Bs. {{ totalFinal }})</span>
        </BotonPrincipal>
      </section>
    </div>

    <!-- Modal 1: Alta Rápida de Nueva Clienta -->
    <ModalBase
      :visible="modalNuevaClientaVisible"
      titulo="Registro Rápido de Clienta"
      ancho-maximo="460px"
      @cerrar="modalNuevaClientaVisible = false"
    >
      <form class="formulario-modal-clienta" @submit.prevent="guardarNuevaClientaRapida">
        <InputTexto
          v-model="nuevoClienteNombre"
          etiqueta="Nombre Completo *"
          placeholder="Ej. Valeria Castro Pinto"
          requerido
        />

        <InputTexto
          v-model="nuevoClienteTelefono"
          tipo="tel"
          etiqueta="Número de WhatsApp *"
          placeholder="Ej. 71234567"
        />

        <InputTexto
          v-model="nuevoClienteCI"
          etiqueta="C.I. / NIT (opcional para recibo)"
          placeholder="Ej. 8392102 SC"
        />

        <div class="acciones-modal">
          <button
            type="button"
            class="boton-cancelar-modal"
            @click="modalNuevaClientaVisible = false"
          >
            Cancelar
          </button>
          <BotonPrincipal tipo="submit">
            Guardar y Asignar
          </BotonPrincipal>
        </div>
      </form>
    </ModalBase>

    <!-- Modal 2: Ticket / Comprobante de Venta Exitosa -->
    <ModalBase
      :visible="modalExitoVisible"
      titulo="¡Cobro Registrado con Éxito!"
      ancho-maximo="480px"
      @cerrar="modalExitoVisible = false"
    >
      <div v-if="ultimaVentaRegistrada" class="comprobante-exito">
        <div class="icono-check-circulo">
          <IconoLucide nombre="Check" :tamano="36" />
        </div>
        <h3 class="ticket-titulo">MOONSTONE JOYERÍA</h3>
        <p class="ticket-subtitulo">Comprobante Oficial de Mostrador &bull; Ticket #{{ ultimaVentaRegistrada.id }}</p>
        <span class="ticket-meta">{{ ultimaVentaRegistrada.fechaHora }} &bull; {{ ultimaVentaRegistrada.turno }}</span>

        <div class="ticket-detalles-caja">
          <div class="fila-meta-ticket">
            <span>Atendido por:</span>
            <strong>{{ ultimaVentaRegistrada.vendedora }}</strong>
          </div>
          <div class="fila-meta-ticket">
            <span>Clienta:</span>
            <strong>{{ ultimaVentaRegistrada.cliente }}</strong>
          </div>
          <div class="fila-meta-ticket">
            <span>Método de Cobro:</span>
            <strong>
              {{ ultimaVentaRegistrada.metodoPago }}
              <template v-if="ultimaVentaRegistrada.metodoPago === 'HIBRIDO'">
                (Efectivo: Bs. {{ ultimaVentaRegistrada.montoEfectivo }} | QR: Bs. {{ ultimaVentaRegistrada.montoQR }})
              </template>
            </strong>
          </div>

          <div v-if="ultimaVentaRegistrada.observacion" class="fila-meta-ticket nota">
            <span>Nota:</span>
            <em>{{ ultimaVentaRegistrada.observacion }}</em>
          </div>

          <div class="divisor-ticket"></div>

          <!-- Items Vendidos -->
          <div class="items-vendidos-lista">
            <div
              v-for="it in ultimaVentaRegistrada.items"
              :key="it.id"
              class="fila-item-comprobante"
            >
              <span>{{ it.nombre }} (x{{ it.cantidad }})</span>
              <span>Bs. {{ it.precio * it.cantidad }}</span>
            </div>
          </div>

          <div class="divisor-ticket"></div>

          <div class="fila-meta-ticket total-destacado">
            <span>Total Cobrado:</span>
            <span class="monto-destacado">Bs. {{ ultimaVentaRegistrada.montoTotal }}</span>
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

    <!-- Modal 3: Alerta de Error (Descuadre Híbrido / Stock) -->
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
.pantalla-registro-venta {
  display: flex;
  flex-direction: column;
  gap: 22px;
}

.cabecera-registro {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 14px;
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

.badge-vendedora-turno {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background-color: var(--color-blanco);
  border: 1px solid var(--color-neutral-200);
  padding: 8px 14px;
  border-radius: var(--radio-md);
  font-size: 13px;
  color: var(--color-neutral-900);
  box-shadow: var(--sombra-sutil);
}

.badge-vendedora-turno strong {
  color: var(--color-primario);
}

/* Grilla POS */
.cuadricula-pos {
  display: grid;
  grid-template-columns: 1fr;
  gap: 20px;
}

@media (min-width: 900px) {
  .cuadricula-pos {
    grid-template-columns: 1.15fr 0.85fr;
  }
}

.tarjeta-panel-pos {
  background-color: var(--color-blanco);
  border: 1px solid var(--color-neutral-200);
  border-radius: var(--radio-lg);
  box-shadow: var(--sombra-sutil);
  padding: 22px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.cabecera-bloque {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--color-primario);
  border-bottom: 1px solid var(--color-neutral-100);
  padding-bottom: 10px;
}

.titulo-bloque {
  font-size: 15px;
  font-weight: 700;
  color: var(--color-neutral-900);
}

/* Ticket Items */
.seccion-ticket-items {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.cabecera-lista-items {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 13px;
  font-weight: 600;
  color: var(--color-neutral-600);
}

.total-piezas-texto {
  font-size: 12px;
  color: var(--color-primario);
  font-weight: 700;
}

.lista-items-venta {
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-height: 400px;
  overflow-y: auto;
}

.fila-item-ticket {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  background-color: var(--color-neutral-50);
  border: 1px solid var(--color-neutral-200);
  border-radius: var(--radio-md);
}

.miniatura-ticket {
  width: 44px;
  height: 44px;
  border-radius: var(--radio-sm);
  object-fit: cover;
  flex-shrink: 0;
  border: 1px solid var(--color-neutral-200);
}

.sin-foto-ticket {
  width: 44px;
  height: 44px;
  border-radius: var(--radio-sm);
  background-color: var(--color-neutral-100);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-neutral-600);
  flex-shrink: 0;
}

.info-item-ticket {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.nombre-item-ticket {
  font-size: 13px;
  font-weight: 700;
  color: var(--color-neutral-900);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.precio-unitario-ticket {
  font-size: 11px;
  color: var(--color-neutral-600);
}

.controles-cantidad-ticket {
  display: flex;
  align-items: center;
  gap: 6px;
  background-color: var(--color-blanco);
  border: 1px solid var(--color-neutral-200);
  border-radius: var(--radio-sm);
  padding: 2px 4px;
}

.btn-cantidad-ticket {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radio-sm);
  color: var(--color-neutral-900);
  transition: all var(--transicion-rapida);
}

.btn-cantidad-ticket:hover {
  background-color: var(--color-neutral-100);
}

.cifra-cantidad-ticket {
  font-size: 13px;
  font-weight: 700;
  min-width: 18px;
  text-align: center;
}

.subtotal-item-ticket {
  font-size: 14px;
  font-weight: 800;
  color: var(--color-primario);
  min-width: 65px;
  text-align: right;
}

.boton-eliminar-item {
  color: var(--color-neutral-600);
  padding: 6px;
  border-radius: var(--radio-sm);
  transition: all var(--transicion-rapida);
}

.boton-eliminar-item:hover {
  color: var(--color-peligro);
  background-color: var(--color-peligro-fondo);
}

.ticket-vacio {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 16px;
  text-align: center;
  background-color: var(--color-neutral-50);
  border: 1px dashed var(--color-neutral-300);
  border-radius: var(--radio-md);
  color: var(--color-neutral-600);
  gap: 8px;
}

.ticket-vacio p {
  font-size: 14px;
  font-weight: 700;
  color: var(--color-neutral-900);
}

.ticket-vacio span {
  font-size: 12px;
}

/* Columna Derecha (Liquidación) */
.columna-liquidacion {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.bloque-liquidacion {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.grupo-campo {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.fila-etiqueta-accion {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.etiqueta-campo {
  font-size: var(--tamano-cuerpo);
  font-weight: 700;
  color: var(--color-neutral-900);
}

.enlace-nueva-clienta {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  font-weight: 700;
  color: var(--color-primario);
  background: none;
  border: none;
  cursor: pointer;
}

.enlace-nueva-clienta:hover {
  text-decoration: underline;
}

.control-select,
.input-control {
  width: 100%;
  padding: 10px 12px;
  background-color: var(--color-blanco);
  border: 1px solid var(--color-neutral-200);
  border-radius: var(--radio-md);
  font-size: var(--tamano-cuerpo);
  color: var(--color-neutral-900);
  outline: none;
  transition: border-color var(--transicion-rapida);
}

.control-select:focus,
.input-control:focus {
  border-color: var(--color-primario);
}

/* Pago Híbrido */
.caja-pago-hibrido {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 14px;
  background-color: var(--color-neutral-50);
  border: 1px solid var(--color-neutral-200);
  border-radius: var(--radio-md);
}

.cabecera-hibrido {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 700;
  color: var(--color-primario);
}

.fila-dos-montos {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.campo-grupo {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.etiqueta-sub {
  font-size: 11px;
  font-weight: 600;
  color: var(--color-neutral-600);
}

.alerta-balance-hibrido {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: var(--radio-sm);
  font-size: 12px;
  font-weight: 600;
}

.alerta-balance-hibrido.correcto {
  background-color: var(--color-exito-fondo);
  color: var(--color-exito);
  border: 1px solid var(--color-exito-borde);
}

.alerta-balance-hibrido.error {
  background-color: var(--color-peligro-fondo);
  color: var(--color-peligro);
  border: 1px solid var(--color-peligro-borde);
}

/* Resumen Liquidación */
.resumen-ticket-cobro {
  background-color: var(--color-fondo-panel);
  border: 1px solid var(--color-neutral-200);
  border-radius: var(--radio-md);
  padding: 14px 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.fila-ticket {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 14px;
  color: var(--color-neutral-600);
}

.caja-descuento {
  display: flex;
  align-items: center;
  gap: 4px;
  font-weight: 700;
}

.input-descuento-mini {
  width: 70px;
  padding: 4px 8px;
  border: 1px solid var(--color-neutral-200);
  border-radius: var(--radio-sm);
  text-align: right;
  font-weight: 700;
  font-size: 13px;
  color: var(--color-peligro);
}

.fila-ticket.total {
  font-size: 16px;
  font-weight: 800;
  color: var(--color-neutral-900);
  padding-top: 10px;
  border-top: 1px dashed var(--color-neutral-300);
}

.monto-final {
  font-size: 22px;
  font-weight: 800;
  color: var(--color-primario);
}

/* Modal Alta Clienta */
.formulario-modal-clienta {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.acciones-modal {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 12px;
  padding-top: 12px;
  border-top: 1px solid var(--color-neutral-200);
}

.boton-cancelar-modal {
  padding: 10px 16px;
  border-radius: var(--radio-md);
  color: var(--color-neutral-600);
  font-weight: 600;
}

/* Modal Comprobante */
.comprobante-exito {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
  text-align: center;
}

.icono-check-circulo {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background-color: var(--color-exito-fondo);
  color: var(--color-exito);
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid var(--color-exito-borde);
}

.ticket-titulo {
  font-size: 18px;
  font-weight: 800;
  color: var(--color-primario);
  letter-spacing: 0.1em;
}

.ticket-subtitulo {
  font-size: 13px;
  font-weight: 600;
  color: var(--color-neutral-900);
}

.ticket-meta {
  font-size: 11px;
  color: var(--color-neutral-600);
}

.ticket-detalles-caja {
  width: 100%;
  background-color: var(--color-fondo-panel);
  border: 1px solid var(--color-neutral-200);
  border-radius: var(--radio-md);
  padding: 14px 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  text-align: left;
}

.fila-meta-ticket {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
  color: var(--color-neutral-600);
}

.fila-meta-ticket strong {
  color: var(--color-neutral-900);
}

.fila-meta-ticket.nota {
  font-size: 12px;
  color: var(--color-neutral-800);
  background-color: var(--color-neutral-100);
  padding: 6px 10px;
  border-radius: var(--radio-sm);
}

.divisor-ticket {
  height: 1px;
  background-color: var(--color-neutral-200);
  margin: 4px 0;
}

.items-vendidos-lista {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.fila-item-comprobante {
  display: flex;
  justify-content: space-between;
  font-size: 12.5px;
  color: var(--color-neutral-800);
}

.total-destacado {
  font-size: 15px;
  font-weight: 800;
  color: var(--color-neutral-900);
}

.monto-destacado {
  font-size: 19px;
  color: var(--color-exito);
  font-weight: 800;
}
</style>
