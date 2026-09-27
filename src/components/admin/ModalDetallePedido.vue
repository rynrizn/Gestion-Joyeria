<script setup>
import { computed } from 'vue'
import ModalBase from '../common/ModalBase.vue'
import BotonPrincipal from '../common/BotonPrincipal.vue'
import IconoLucide from '../common/IconoLucide.vue'
import { calcularDisponibilidadPedido, enriquecerItemsReserva } from '../../stores/reservas'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
  reserva: {
    type: Object,
    default: null,
  },
  productosInventario: {
    type: Array,
    default: () => [],
  },
})

const emit = defineEmits(['cerrar', 'completar-venta', 'contactar-whatsapp'])

const itemsEnriquecidos = computed(() => {
  if (!props.reserva) return []
  return enriquecerItemsReserva(props.reserva, props.productosInventario)
})

const disponibilidad = computed(() => {
  if (!props.reserva) return null
  return calcularDisponibilidadPedido(props.reserva, props.productosInventario)
})
</script>

<template>
  <ModalBase
    :visible="visible"
    :titulo="`Detalle de Pedido #${reserva?.id || ''}`"
    ancho-maximo="640px"
    @cerrar="emit('cerrar')"
  >
    <div v-if="reserva" class="cuerpo-modal-detalle">
      <!-- 1. Tarjeta Resumen: Datos de Clienta y Plazo -->
      <section class="tarjeta-info-pedido">
        <div class="fila-superior-info">
          <div class="datos-clienta">
            <span class="etiqueta-pequena">Clienta solicitante</span>
            <div class="nombre-con-origen">
              <span
                class="chip-origen"
                :class="reserva.origen === 'WHATSAPP' ? 'whatsapp' : 'tienda'"
              >
                <IconoLucide
                  :nombre="reserva.origen === 'WHATSAPP' ? 'MessageCircle' : 'Store'"
                  :tamano="12"
                />
                <span>{{ reserva.origen === 'WHATSAPP' ? 'WhatsApp' : 'Mostrador' }}</span>
              </span>
              <strong class="nombre-titular">{{ reserva.cliente }}</strong>
            </div>

            <!-- Botón WhatsApp si tiene teléfono -->
            <button
              v-if="reserva.telefono"
              type="button"
              class="boton-contacto-wa"
              title="Abrir chat en WhatsApp"
              @click="emit('contactar-whatsapp', reserva)"
            >
              <IconoLucide nombre="MessageCircle" :tamano="14" />
              <span>{{ reserva.telefono }}</span>
            </button>
          </div>

          <!-- Plazo y Estado de Disponibilidad -->
          <div class="columna-plazo-disp">
            <div class="caja-vencimiento" :class="{ urgente: reserva.esUrgente }">
              <IconoLucide nombre="Clock" :tamano="14" />
              <span>{{ reserva.vencimiento }}</span>
            </div>

            <div
              v-if="disponibilidad"
              class="badge-disponibilidad"
              :class="disponibilidad.clase"
            >
              <IconoLucide :nombre="disponibilidad.icono" :tamano="14" />
              <span>{{ disponibilidad.badge }}</span>
            </div>
          </div>
        </div>

        <div class="fila-meta-pedido">
          <span class="fecha-texto">Registrado el: {{ reserva.fecha }}</span>
        </div>
      </section>

      <!-- 2. Listado de Productos del Pedido con Ubicación y Especificaciones -->
      <section class="seccion-productos-pedido">
        <h4 class="subtitulo-seccion-modal">
          Productos Solicitados ({{ itemsEnriquecidos.length }})
        </h4>

        <div class="lista-items-pedido">
          <article
            v-for="item in itemsEnriquecidos"
            :key="item.id"
            class="tarjeta-item-pedido"
          >
            <!-- Foto Miniatura -->
            <div class="envoltura-foto-item">
              <img
                :src="item.imagen"
                :alt="item.nombre"
                class="foto-item"
                loading="lazy"
              />
            </div>

            <!-- Datos Centrales del Producto -->
            <div class="info-central-item">
              <h5 class="nombre-producto-item">{{ item.nombre }}</h5>

              <div class="chips-especificaciones">
                <span class="chip-espec">{{ item.categoria }}</span>
                <span v-if="item.material" class="chip-espec">{{ item.material }}</span>
                <span v-if="item.color" class="chip-espec chip-color">Color: {{ item.color }}</span>
                <span v-if="item.talla" class="chip-espec chip-talla">Talla: {{ item.talla }}</span>
              </div>

              <!-- Disponibilidad en Ubicaciones Físicas -->
              <div class="caja-stock-ubicaciones">
                <span class="titulo-ubicaciones">Stock en Ubicaciones:</span>
                <div class="fila-badges-sedes">
                  <span
                    class="badge-sede central"
                    :class="{ 'stock-cero': item.stockCentral === 0 }"
                  >
                    <IconoLucide nombre="Building2" :tamano="12" />
                    <span>Central: <strong>{{ item.stockCentral }} u.</strong></span>
                  </span>

                  <span
                    class="badge-sede tienda"
                    :class="{ 'stock-cero': item.stockTienda === 0 }"
                  >
                    <IconoLucide nombre="Store" :tamano="12" />
                    <span>Tienda: <strong>{{ item.stockTienda }} u.</strong></span>
                  </span>
                </div>
              </div>
            </div>

            <!-- Cantidad y Precio -->
            <div class="columna-precio-item">
              <span class="cantidad-solicitada">{{ item.cantidad }} unidad{{ item.cantidad > 1 ? 'es' : '' }}</span>
              <span class="precio-unitario">Bs. {{ item.precioUnitario }} c/u</span>
              <span class="subtotal-item">Bs. {{ item.subtotal }}</span>
            </div>
          </article>
        </div>
      </section>

      <!-- 3. Resumen Financiero Total del Pedido -->
      <section class="resumen-total-pedido">
        <div class="fila-resumen-total">
          <span class="etiqueta-total-venta">Total de Venta:</span>
          <strong class="monto-total-venta">Bs. {{ reserva.montoTotal }}</strong>
        </div>
        <p class="nota-explicativa">
          Al pulsar <em>"Completar Venta"</em> se transferirán automáticamente las piezas solicitadas al Punto de Venta (POS) para cobrar y generar el comprobante.
        </p>
      </section>

      <!-- 4. Acciones del Modal -->
      <div class="acciones-modal-detalle">
        <button
          type="button"
          class="boton-cerrar-modal"
          @click="emit('cerrar')"
        >
          Cerrar
        </button>

        <BotonPrincipal
          @click="emit('completar-venta', reserva)"
        >
          <template #iconoIzquierda>
            <IconoLucide nombre="CheckCheck" :tamano="18" />
          </template>
          <span>Completar Venta</span>
        </BotonPrincipal>
      </div>
    </div>
  </ModalBase>
</template>

<style scoped>
.cuerpo-modal-detalle {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

/* Tarjeta de Información Superior */
.tarjeta-info-pedido {
  background-color: var(--color-fondo-panel);
  border: 1px solid var(--color-neutral-200);
  border-radius: var(--radio-md);
  padding: 14px 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.fila-superior-info {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
}

.datos-clienta {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.etiqueta-pequena {
  font-size: 11px;
  color: var(--color-neutral-600);
  text-transform: uppercase;
  font-weight: 700;
  letter-spacing: 0.4px;
}

.nombre-con-origen {
  display: flex;
  align-items: center;
  gap: 8px;
}

.chip-origen {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  font-weight: 600;
  padding: 2px 7px;
  border-radius: var(--radio-sm);
}

.chip-origen.whatsapp {
  background-color: #E8F5E9;
  color: #2E7D32;
}

.chip-origen.tienda {
  background-color: #EDE7F6;
  color: #512DA8;
}

.nombre-titular {
  font-size: 16px;
  color: var(--color-neutral-900);
}

.boton-contacto-wa {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: none;
  border: none;
  color: #2E7D32;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  padding: 0;
  margin-top: 2px;
}

.boton-contacto-wa:hover {
  text-decoration: underline;
}

.columna-plazo-disp {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 6px;
}

.caja-vencimiento {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 12px;
  font-weight: 700;
  color: var(--color-neutral-700);
  background-color: var(--color-blanco);
  border: 1px solid var(--color-neutral-200);
  padding: 3px 8px;
  border-radius: var(--radio-sm);
}

.caja-vencimiento.urgente {
  color: #B91C1C;
  background-color: #FEF2F2;
  border-color: #FCA5A5;
}

.badge-disponibilidad {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 11px;
  font-weight: 700;
  padding: 3px 9px;
  border-radius: var(--radio-sm);
}

.badge-disponibilidad.disp-tienda {
  background-color: #E8F5E9;
  color: #166534;
  border: 1px solid #BBF7D0;
}

.badge-disponibilidad.disp-central {
  background-color: #FEF3C7;
  color: #92400E;
  border: 1px solid #FDE68A;
}

.badge-disponibilidad.disp-ambas {
  background-color: #F3E8FF;
  color: #6B21A8;
  border: 1px solid #E9D5FF;
}

.badge-disponibilidad.disp-insuficiente {
  background-color: #FEE2E2;
  color: #991B1B;
  border: 1px solid #FECACA;
}

.fila-meta-pedido {
  font-size: 11px;
  color: var(--color-neutral-600);
  border-top: 1px dashed var(--color-neutral-200);
  padding-top: 6px;
}

/* Listado de Productos */
.subtitulo-seccion-modal {
  font-size: 13px;
  font-weight: 700;
  color: var(--color-neutral-800);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 8px;
}

.lista-items-pedido {
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-height: 280px;
  overflow-y: auto;
  padding-right: 4px;
}

.tarjeta-item-pedido {
  display: flex;
  align-items: center;
  gap: 12px;
  background-color: var(--color-blanco);
  border: 1px solid var(--color-neutral-200);
  border-radius: var(--radio-md);
  padding: 10px 12px;
  transition: border-color var(--transicion-rapida);
}

.tarjeta-item-pedido:hover {
  border-color: var(--color-neutral-300);
}

.envoltura-foto-item {
  width: 58px;
  height: 58px;
  border-radius: var(--radio-sm);
  overflow: hidden;
  background-color: var(--color-neutral-100);
  flex-shrink: 0;
  border: 1px solid var(--color-neutral-200);
}

.foto-item {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.info-central-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}

.nombre-producto-item {
  font-size: 14px;
  font-weight: 700;
  color: var(--color-neutral-900);
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.chips-especificaciones {
  display: flex;
  align-items: center;
  gap: 5px;
  flex-wrap: wrap;
}

.chip-espec {
  font-size: 10px;
  font-weight: 600;
  color: var(--color-neutral-700);
  background-color: var(--color-neutral-100);
  padding: 1px 6px;
  border-radius: var(--radio-sm);
}

.chip-color {
  color: var(--color-primario);
  background-color: var(--color-primario-fondo);
}

.chip-talla {
  color: #1E40AF;
  background-color: #EFF6FF;
}

.caja-stock-ubicaciones {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 2px;
  flex-wrap: wrap;
}

.titulo-ubicaciones {
  font-size: 10px;
  color: var(--color-neutral-600);
  font-weight: 600;
}

.fila-badges-sedes {
  display: inline-flex;
  gap: 6px;
}

.badge-sede {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  font-size: 10px;
  padding: 1px 6px;
  border-radius: var(--radio-sm);
  background-color: var(--color-neutral-100);
  color: var(--color-neutral-700);
}

.badge-sede.central {
  background-color: #FEF3C7;
  color: #78350F;
}

.badge-sede.tienda {
  background-color: #E0E7FF;
  color: #3730A3;
}

.badge-sede.stock-cero {
  opacity: 0.5;
  text-decoration: line-through;
}

.columna-precio-item {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 2px;
  flex-shrink: 0;
}

.cantidad-solicitada {
  font-size: 11px;
  font-weight: 700;
  color: var(--color-neutral-800);
  background-color: var(--color-neutral-100);
  padding: 1px 6px;
  border-radius: var(--radio-sm);
}

.precio-unitario {
  font-size: 10px;
  color: var(--color-neutral-600);
}

.subtotal-item {
  font-size: 14px;
  font-weight: 800;
  color: var(--color-primario);
}

/* Resumen Total */
.resumen-total-pedido {
  background-color: var(--color-neutral-50);
  border: 1px solid var(--color-neutral-200);
  border-radius: var(--radio-md);
  padding: 12px 16px;
}

.fila-resumen-total {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.etiqueta-total-venta {
  font-size: 15px;
  font-weight: 700;
  color: var(--color-neutral-800);
}

.monto-total-venta {
  font-size: 20px;
  font-weight: 800;
  color: var(--color-primario);
}

.nota-explicativa {
  font-size: 11px;
  color: var(--color-neutral-600);
  margin-top: 6px;
  margin-bottom: 0;
  line-height: 1.4;
}

/* Acciones */
.acciones-modal-detalle {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 12px;
  padding-top: 14px;
  border-top: 1px solid var(--color-neutral-200);
}

.boton-cerrar-modal {
  padding: 10px 18px;
  border-radius: var(--radio-md);
  color: var(--color-neutral-600);
  font-weight: 600;
  background: none;
  border: none;
  cursor: pointer;
}

.boton-cerrar-modal:hover {
  background-color: var(--color-neutral-200);
  color: var(--color-neutral-900);
}
</style>
