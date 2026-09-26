<script setup>
import { watch, onMounted, onUnmounted } from 'vue'
import { useCarritoStore } from '../../stores/carrito'
import { useReservasStore } from '../../stores/reservas'
import IconoLucide from '../common/IconoLucide.vue'
import ItemCarrito from './ItemCarrito.vue'

const carrito = useCarritoStore()
const reservasStore = useReservasStore()

// Manejo de tecla ESC para cerrar el drawer
const manejarTeclaEsc = (evento) => {
  if (evento.key === 'Escape' && carrito.estaAbierto) {
    carrito.cerrarCarrito()
  }
}

// Bloqueo de scroll cuando el drawer está abierto
watch(
  () => carrito.estaAbierto,
  (abierto) => {
    if (abierto) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
  }
)

onMounted(() => {
  window.addEventListener('keydown', manejarTeclaEsc)
})

onUnmounted(() => {
  window.removeEventListener('keydown', manejarTeclaEsc)
  document.body.style.overflow = ''
})

const pedirPorWhatsApp = () => {
  // 1. Generar reserva temporal automática (24h) para que la dueña la gestione desde el dashboard
  reservasStore.crearReservaDesdeCarrito(carrito.items, carrito.subtotal)

  // 2. Abrir WhatsApp con el pedido formateado
  const url = carrito.generarEnlaceWhatsApp()
  window.open(url, '_blank')
}
</script>

<template>
  <Teleport to="body">
    <!-- Telón de fondo con Fade -->
    <Transition name="fade-fondo">
      <div
        v-if="carrito.estaAbierto"
        class="telon-carrito"
        @click="carrito.cerrarCarrito()"
      ></div>
    </Transition>

    <!-- Panel Drawer con Slide -->
    <Transition name="slide-drawer">
      <div v-if="carrito.estaAbierto" class="panel-drawer">
        <!-- Cabecera del Drawer -->
        <div class="cabecera-drawer">
          <div class="titulo-con-badge">
            <h2 class="titulo-drawer">Tu Selección</h2>
            <span class="badge-conteo">{{ carrito.totalItems }} piezas</span>
          </div>

          <button
            type="button"
            class="boton-cerrar"
            aria-label="Cerrar bolsa"
            @click="carrito.cerrarCarrito()"
          >
            <IconoLucide nombre="X" :tamano="20" />
          </button>
        </div>

        <!-- Lista de Artículos -->
        <div class="cuerpo-drawer">
          <template v-if="!carrito.estaVacio">
            <ItemCarrito
              v-for="item in carrito.items"
              :key="item.producto.id"
              :item="item"
              @incrementar="carrito.actualizarCantidad(item.producto.id, item.cantidad + 1)"
              @decrementar="carrito.actualizarCantidad(item.producto.id, item.cantidad - 1)"
              @eliminar="carrito.quitarProducto(item.producto.id)"
            />
          </template>

          <!-- Estado Vacío -->
          <div v-else class="estado-vacio">
            <div class="icono-vacio">
              <IconoLucide nombre="ShoppingBag" :tamano="36" />
            </div>
            <p class="texto-vacio">Aún no has agregado ninguna joya.</p>
            <button
              type="button"
              class="boton-explorar"
              @click="carrito.cerrarCarrito()"
            >
              Explorar Catálogo
            </button>
          </div>
        </div>

        <!-- Pie del Drawer con Costos y Botón WhatsApp -->
        <div v-if="!carrito.estaVacio" class="pie-drawer">
          <!-- Desglose de Costos -->
          <div class="fila-costo">
            <span class="etiqueta-subtotal">Subtotal</span>
            <span class="monto-subtotal">Bs. {{ carrito.subtotal }}</span>
          </div>

          <!-- Nota Informativa -->
          <p class="nota-coordinacion">
            El apartado y pago final se coordina por WhatsApp con la administradora.
          </p>

          <!-- Botón de Acción Principal (WhatsApp Green) -->
          <button
            type="button"
            class="boton-whatsapp-pedido"
            @click="pedirPorWhatsApp"
          >
            <IconoLucide nombre="MessageCircle" :tamano="20" />
            <span>Pedir por WhatsApp (Bs. {{ carrito.subtotal }})</span>
          </button>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.telon-carrito {
  position: fixed;
  inset: 0;
  background-color: rgba(17, 24, 39, 0.5);
  backdrop-filter: blur(2px);
  z-index: 1000;
}

.panel-drawer {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  width: 100%;
  max-width: 420px;
  background-color: var(--color-blanco);
  z-index: 1001;
  display: flex;
  flex-direction: column;
  box-shadow: -4px 0 25px rgba(0, 0, 0, 0.15);
}

/* En móvil se comporta como panel completo */
@media (max-width: 480px) {
  .panel-drawer {
    max-width: 100%;
  }
}

.cabecera-drawer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid var(--color-neutral-200);
}

.titulo-con-badge {
  display: flex;
  align-items: center;
  gap: 10px;
}

.titulo-drawer {
  font-size: var(--tamano-h1-movil);
  font-weight: 700;
  color: var(--color-neutral-900);
}

.badge-conteo {
  background-color: var(--color-neutral-200);
  color: var(--color-neutral-900);
  font-size: 11px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: var(--radio-completo);
}

.boton-cerrar {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: var(--radio-sm);
  color: var(--color-neutral-600);
  transition: all var(--transicion-rapida);
}

.boton-cerrar:hover {
  background-color: var(--color-neutral-200);
  color: var(--color-neutral-900);
}

.cuerpo-drawer {
  flex: 1;
  padding: 16px 20px;
  overflow-y: auto;
}

.estado-vacio {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  text-align: center;
  gap: 12px;
  padding: 40px 0;
}

.icono-vacio {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background-color: var(--color-neutral-50);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-neutral-600);
}

.texto-vacio {
  font-size: var(--tamano-cuerpo);
  color: var(--color-neutral-600);
}

.boton-explorar {
  margin-top: 8px;
  padding: 8px 16px;
  border-radius: var(--radio-md);
  background-color: var(--color-neutral-900);
  color: var(--color-blanco);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
}

.pie-drawer {
  padding: 20px;
  border-top: 1px solid var(--color-neutral-200);
  background-color: var(--color-neutral-50);
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.fila-costo {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.etiqueta-subtotal {
  font-size: 15px;
  font-weight: 500;
  color: var(--color-neutral-600);
}

.monto-subtotal {
  font-size: 20px;
  font-weight: 700;
  color: var(--color-neutral-900);
}

.nota-coordinacion {
  font-size: 12px;
  color: var(--color-neutral-600);
  line-height: 1.4;
  background-color: #F3F4F6;
  padding: 8px 12px;
  border-radius: var(--radio-sm);
  border-left: 3px solid var(--color-neutral-600);
}

.boton-whatsapp-pedido {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 14px 20px;
  border-radius: var(--radio-md);
  background-color: var(--color-whatsapp);
  color: var(--color-blanco);
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  transition: all var(--transicion-rapida);
  box-shadow: 0 4px 12px rgba(37, 211, 102, 0.25);
}

.boton-whatsapp-pedido:hover {
  background-color: var(--color-whatsapp-hover);
  transform: translateY(-1px);
}

.boton-whatsapp-pedido:active {
  transform: translateY(0);
}

/* Transiciones */
.fade-fondo-enter-active,
.fade-fondo-leave-active {
  transition: opacity var(--transicion-rapida);
}
.fade-fondo-enter-from,
.fade-fondo-leave-to {
  opacity: 0;
}

.slide-drawer-enter-active,
.slide-drawer-leave-active {
  transition: transform 250ms ease-out;
}
.slide-drawer-enter-from,
.slide-drawer-leave-to {
  transform: translateX(100%);
}
</style>
