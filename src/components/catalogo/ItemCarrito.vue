<script setup>
import IconoLucide from '../common/IconoLucide.vue'

defineProps({
  item: {
    type: Object,
    required: true,
  },
  alMaximo: {
    type: Boolean,
    default: false,
  },
})

defineEmits(['incrementar', 'decrementar', 'eliminar'])
</script>

<template>
  <div class="item-carrito">
    <!-- Miniatura (48x48 px) -->
    <img
      :src="item.producto.imagen"
      :alt="item.producto.nombre"
      class="miniatura-joya"
    />

    <!-- Información de Joya -->
    <div class="info-joya">
      <h4 class="nombre-joya texto-truncado">{{ item.producto.nombre }}</h4>
      <span class="precio-unitario">Bs. {{ item.producto.precio_venta }} c/u</span>

      <!-- Control de Cantidad -->
      <div class="fila-control-stock">
        <div class="control-cantidad">
          <button
            type="button"
            class="boton-cantidad"
            aria-label="Disminuir cantidad"
            @click="$emit('decrementar')"
          >
            <IconoLucide nombre="Minus" :tamano="14" />
          </button>
          <span class="numero-cantidad">{{ item.cantidad }}</span>
          <button
            type="button"
            class="boton-cantidad"
            :class="{ 'boton-deshabilitado': alMaximo }"
            :disabled="alMaximo"
            :title="alMaximo ? 'Stock máximo disponible alcanzado' : 'Aumentar cantidad'"
            aria-label="Aumentar cantidad"
            @click="$emit('incrementar')"
          >
            <IconoLucide nombre="Plus" :tamano="14" />
          </button>
        </div>

        <span v-if="alMaximo" class="badge-max-stock" title="Límite de unidades disponibles alcanzado">
          Máx stock
        </span>
      </div>
    </div>

    <!-- Subtotal por ítem y botón de eliminar -->
    <div class="acciones-item">
      <span class="precio-subtotal">
        Bs. {{ Number(item.producto.precio_venta) * item.cantidad }}
      </span>
      <button
        type="button"
        class="boton-eliminar"
        title="Quitar producto"
        @click="$emit('eliminar')"
      >
        <IconoLucide nombre="Trash2" :tamano="16" />
      </button>
    </div>
  </div>
</template>

<style scoped>
.item-carrito {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 0;
  border-bottom: 1px solid var(--color-neutral-200);
}

.miniatura-joya {
  width: 48px;
  height: 48px;
  border-radius: var(--radio-sm);
  object-fit: cover;
  flex-shrink: 0;
  background-color: var(--color-neutral-50);
  border: 1px solid var(--color-neutral-200);
}

.info-joya {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.nombre-joya {
  font-size: 13px;
  font-weight: 600;
  color: var(--color-neutral-900);
}

.precio-unitario {
  font-size: 12px;
  color: var(--color-neutral-600);
}

.fila-control-stock {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 2px;
}

.control-cantidad {
  display: inline-flex;
  align-items: center;
  border: 1px solid var(--color-neutral-200);
  border-radius: var(--radio-sm);
  background-color: var(--color-neutral-50);
  width: fit-content;
}

.boton-cantidad {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  color: var(--color-neutral-600);
  transition: all var(--transicion-rapida);
}

.boton-cantidad:hover:not(:disabled) {
  background-color: var(--color-neutral-200);
  color: var(--color-neutral-900);
}

.boton-cantidad:disabled,
.boton-cantidad.boton-deshabilitado {
  opacity: 0.35;
  cursor: not-allowed;
}

.badge-max-stock {
  font-size: 10px;
  font-weight: 700;
  color: #B45309;
  background-color: #FEF3C7;
  padding: 2px 6px;
  border-radius: var(--radio-sm);
  border: 1px solid #FDE68A;
}

.numero-cantidad {
  min-width: 24px;
  text-align: center;
  font-size: 12px;
  font-weight: 600;
  color: var(--color-neutral-900);
}

.acciones-item {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 8px;
}

.precio-subtotal {
  font-size: 14px;
  font-weight: 700;
  color: var(--color-neutral-900);
}

.boton-eliminar {
  color: var(--color-neutral-600);
  padding: 4px;
  border-radius: var(--radio-sm);
  transition: color var(--transicion-rapida);
}

.boton-eliminar:hover {
  color: var(--color-peligro);
}
</style>
