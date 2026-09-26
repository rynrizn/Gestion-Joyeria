<script setup>
import { RouterLink } from 'vue-router'
import IconoLucide from './IconoLucide.vue'

defineProps({
  cantidadCarrito: {
    type: Number,
    default: 0,
  },
})

defineEmits(['abrir-carrito'])
</script>

<template>
  <header class="barra-publica">
    <div class="contenedor contenido-barra">
      <!-- Marca / Nombre con estética Figma Moonstone -->
      <RouterLink to="/" class="enlace-marca">
        <h2 class="nombre-marca">MOONSTONE</h2>
      </RouterLink>

      <!-- Acciones a la derecha: Solo Carrito de Compras -->
      <div class="acciones-derecha">
        <!-- Botón de Carrito con Contador Numérico Flotante -->
        <button
          type="button"
          class="boton-bolsa-carrito"
          aria-label="Ver carrito de compras"
          @click="$emit('abrir-carrito')"
        >
          <IconoLucide nombre="ShoppingBag" :tamano="22" />
          <span v-if="cantidadCarrito > 0" class="contador-flotante">
            {{ cantidadCarrito > 99 ? '99+' : cantidadCarrito }}
          </span>
        </button>
      </div>
    </div>
  </header>
</template>

<style scoped>
.barra-publica {
  position: sticky;
  top: 0;
  z-index: 100;
  background-color: var(--color-blanco);
  border-bottom: 1px solid var(--color-neutral-200);
  box-shadow: var(--sombra-sutil);
  height: 64px;
  display: flex;
  align-items: center;
}

.contenido-barra {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.enlace-marca {
  display: inline-flex;
  align-items: center;
  text-decoration: none;
}

.nombre-marca {
  font-size: 19px;
  font-weight: 800;
  color: var(--color-primario);
  letter-spacing: 0.12em;
}

.acciones-derecha {
  display: flex;
  align-items: center;
  gap: 16px;
}

.boton-bolsa-carrito {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 42px;
  height: 42px;
  border-radius: var(--radio-md);
  color: var(--color-neutral-900);
  transition: all var(--transicion-rapida);
}

.boton-bolsa-carrito:hover {
  background-color: var(--color-primario-fondo);
  color: var(--color-primario);
}

.contador-flotante {
  position: absolute;
  top: 4px;
  right: 4px;
  min-width: 18px;
  height: 18px;
  padding: 0 4px;
  border-radius: var(--radio-completo);
  background-color: var(--color-primario);
  color: var(--color-blanco);
  font-size: 10px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
  border: 2px solid var(--color-blanco);
}
</style>
