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
      <!-- Marca / Nombre en texto plano neutro -->
      <RouterLink to="/" class="enlace-marca">
        <h2 class="nombre-marca">Moonstone Joyería</h2>
      </RouterLink>

      <!-- Acciones a la derecha -->
      <div class="acciones-derecha">
        <!-- Enlace discreto para acceso de vendedoras / dueña -->
        <RouterLink
          to="/login"
          class="boton-acceso-admin"
          title="Acceso al sistema de gestión"
        >
          <IconoLucide nombre="User" :tamano="18" />
          <span class="texto-acceso">Gestión</span>
        </RouterLink>

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
}

.nombre-marca {
  font-size: var(--tamano-h2);
  font-weight: 700;
  color: var(--color-neutral-900);
  letter-spacing: -0.02em;
}

.acciones-derecha {
  display: flex;
  align-items: center;
  gap: 16px;
}

.boton-acceso-admin {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: var(--radio-md);
  font-size: var(--tamano-caption);
  color: var(--color-neutral-600);
  font-weight: 500;
  transition: all var(--transicion-rapida);
}

.boton-acceso-admin:hover {
  background-color: var(--color-neutral-50);
  color: var(--color-neutral-900);
}

@media (max-width: 640px) {
  .texto-acceso {
    display: none;
  }
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
  transition: background-color var(--transicion-rapida);
}

.boton-bolsa-carrito:hover {
  background-color: var(--color-neutral-50);
}

.contador-flotante {
  position: absolute;
  top: 4px;
  right: 4px;
  min-width: 18px;
  height: 18px;
  padding: 0 4px;
  border-radius: var(--radio-completo);
  background-color: var(--color-neutral-900);
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
