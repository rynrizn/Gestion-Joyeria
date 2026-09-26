<script setup>
import IconoLucide from '../common/IconoLucide.vue'

defineProps({
  titulo: {
    type: String,
    required: true,
  },
  valor: {
    type: [String, Number],
    required: true,
  },
  subtexto: {
    type: String,
    default: '',
  },
  icono: {
    type: String,
    default: 'Activity',
  },
  variante: {
    type: String,
    default: 'normal',
    validator: (v) => ['normal', 'alerta', 'peligro', 'exito'].includes(v),
  },
})
</script>

<template>
  <div class="tarjeta-metrica" :class="`metrica-${variante}`">
    <!-- Icono Temático -->
    <div class="icono-contenedor">
      <IconoLucide :nombre="icono" :tamano="22" />
    </div>

    <!-- Información del KPI -->
    <div class="datos-metrica">
      <span class="titulo-metrica">{{ titulo }}</span>
      <div class="valor-metrica">{{ valor }}</div>
      <span v-if="subtexto" class="subtexto-metrica">{{ subtexto }}</span>
    </div>
  </div>
</template>

<style scoped>
.tarjeta-metrica {
  background-color: var(--color-blanco);
  border: 1px solid var(--color-neutral-200);
  border-radius: var(--radio-lg);
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: var(--sombra-sutil);
  transition: transform var(--transicion-rapida), box-shadow var(--transicion-rapida);
}

.tarjeta-metrica:hover {
  transform: translateY(-1px);
  box-shadow: var(--sombra-tarjeta);
}

.icono-contenedor {
  width: 48px;
  height: 48px;
  border-radius: var(--radio-md);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.datos-metrica {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.titulo-metrica {
  font-size: 13px;
  font-weight: 500;
  color: var(--color-neutral-600);
}

.valor-metrica {
  font-size: 26px;
  font-weight: 800;
  color: var(--color-neutral-900);
  line-height: 1.15;
}

.subtexto-metrica {
  font-size: 11px;
  color: var(--color-neutral-600);
  margin-top: 2px;
}

/* Variantes visuales */
.metrica-normal .icono-contenedor {
  background-color: var(--color-neutral-50);
  color: var(--color-neutral-900);
  border: 1px solid var(--color-neutral-200);
}

.metrica-alerta .icono-contenedor {
  background-color: var(--color-alerta-fondo);
  color: var(--color-alerta);
}
.metrica-alerta .valor-metrica {
  color: var(--color-alerta);
}

.metrica-peligro .icono-contenedor {
  background-color: var(--color-peligro-fondo);
  color: var(--color-peligro);
}
.metrica-peligro .valor-metrica {
  color: var(--color-peligro);
}

.metrica-exito .icono-contenedor {
  background-color: var(--color-exito-fondo);
  color: var(--color-exito);
}
</style>
