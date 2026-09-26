<script setup>
import { computed } from 'vue'
import IconoLucide from '../common/IconoLucide.vue'

const props = defineProps({
  producto: {
    type: Object,
    required: true,
  },
})

defineEmits(['agregar', 'ver-detalle'])

const estaDisponible = computed(() => {
  return Number(props.producto.stock || 0) > 0
})

const esUltimaUnidad = computed(() => {
  return Number(props.producto.stock || 0) === 1
})
</script>

<template>
  <article class="tarjeta-joya">
    <!-- Contenedor de Imagen Cuadrada (1:1) -->
    <div class="envoltura-imagen" @click="$emit('ver-detalle', producto)">
      <img
        :src="producto.imagen"
        :alt="producto.nombre"
        loading="lazy"
        class="imagen-joya"
      />

      <!-- Badge de Material -->
      <span class="badge-material">
        {{ producto.material }}
      </span>

      <!-- Indicador si está agotado o queda 1 sola unidad -->
      <span v-if="!estaDisponible" class="badge-alerta agotado">
        Agotado
      </span>
      <span v-else-if="esUltimaUnidad" class="badge-alerta ultima">
        ¡Última pieza!
      </span>
    </div>

    <!-- Contenido y Metadatos -->
    <div class="cuerpo-tarjeta">
      <h3
        class="nombre-joya texto-truncado"
        :title="producto.nombre"
        @click="$emit('ver-detalle', producto)"
      >
        {{ producto.nombre }}
      </h3>

      <div class="fila-precio">
        <span class="precio-destacado">Bs. {{ producto.precio_venta }}</span>
        <span v-if="producto.categoria" class="categoria-subtexto">{{ producto.categoria }}</span>
      </div>

      <!-- Botón de Acción Principal -->
      <button
        type="button"
        class="boton-accion-joya"
        :disabled="!estaDisponible"
        :class="{ 'boton-agotado': !estaDisponible }"
        @click.stop="$emit('agregar', producto)"
      >
        <template v-if="estaDisponible">
          <IconoLucide nombre="Plus" :tamano="16" />
          <span>Añadir</span>
        </template>
        <template v-else>
          <span>Sin Stock</span>
        </template>
      </button>
    </div>
  </article>
</template>

<style scoped>
.tarjeta-joya {
  background-color: var(--color-blanco);
  border: 1px solid var(--color-neutral-200);
  border-radius: var(--radio-md);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: var(--sombra-sutil);
  transition: transform var(--transicion-rapida), box-shadow var(--transicion-rapida);
}

.tarjeta-joya:hover {
  transform: translateY(-2px);
  box-shadow: var(--sombra-tarjeta);
}

.envoltura-imagen {
  position: relative;
  width: 100%;
  aspect-ratio: 1 / 1;
  background-color: var(--color-neutral-50);
  overflow: hidden;
  cursor: pointer;
}

.imagen-joya {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 300ms ease;
}

.envoltura-imagen:hover .imagen-joya {
  transform: scale(1.04);
}

.badge-material {
  position: absolute;
  top: 8px;
  left: 8px;
  background-color: rgba(255, 255, 255, 0.92);
  backdrop-filter: blur(4px);
  color: var(--color-neutral-900);
  font-size: 11px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: var(--radio-sm);
  border: 1px solid rgba(229, 231, 235, 0.8);
  line-height: 1.2;
}

.badge-alerta {
  position: absolute;
  bottom: 8px;
  right: 8px;
  font-size: 11px;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: var(--radio-sm);
  line-height: 1.2;
}

.badge-alerta.agotado {
  background-color: var(--color-peligro-fondo);
  color: var(--color-peligro);
  border: 1px solid rgba(220, 38, 38, 0.2);
}

.badge-alerta.ultima {
  background-color: var(--color-alerta-fondo);
  color: var(--color-alerta);
  border: 1px solid rgba(217, 119, 6, 0.2);
}

.cuerpo-tarjeta {
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
}

.nombre-joya {
  font-size: var(--tamano-cuerpo);
  font-weight: 600;
  color: var(--color-neutral-900);
  line-height: 1.3;
  cursor: pointer;
}

.nombre-joya:hover {
  text-decoration: underline;
}

.fila-precio {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
}

.precio-destacado {
  font-size: 16px;
  font-weight: 700;
  color: var(--color-neutral-900);
}

.categoria-subtexto {
  font-size: 11px;
  color: var(--color-neutral-600);
}

.boton-accion-joya {
  width: 100%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 8px 12px;
  border-radius: var(--radio-sm);
  background-color: var(--color-neutral-900);
  color: var(--color-blanco);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transicion-rapida);
  margin-top: auto;
}

.boton-accion-joya:hover:not(:disabled) {
  background-color: #1f2937;
}

.boton-accion-joya:active:not(:disabled) {
  transform: scale(0.98);
}

.boton-accion-joya:disabled {
  background-color: var(--color-neutral-200);
  color: var(--color-neutral-600);
  cursor: not-allowed;
}
</style>
