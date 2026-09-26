<script setup>
import { computed, h } from 'vue'
import * as iconosLucide from 'lucide'

const props = defineProps({
  nombre: {
    type: String,
    required: true,
  },
  tamano: {
    type: [Number, String],
    default: 20,
  },
  trazo: {
    type: [Number, String],
    default: 2,
  },
})

// Obtenemos la definición del icono desde el paquete oficial de Lucide
const definicionIcono = computed(() => {
  return iconosLucide[props.nombre] || null
})

// Componente dinámico que renderiza los elementos SVG nativos
const RenderIcono = () => {
  if (!definicionIcono.value) {
    return null
  }

  const hijosSvg = definicionIcono.value.map(([tag, attrs]) => h(tag, attrs))

  return h(
    'svg',
    {
      xmlns: 'http://www.w3.org/2000/svg',
      width: props.tamano,
      height: props.tamano,
      viewBox: '0 0 24 24',
      fill: 'none',
      stroke: 'currentColor',
      'stroke-width': props.trazo,
      'stroke-linecap': 'round',
      'stroke-linejoin': 'round',
      class: 'icono-lucide',
    },
    hijosSvg
  )
}
</script>

<template>
  <span class="contenedor-icono" :style="{ width: `${tamano}px`, height: `${tamano}px` }">
    <RenderIcono />
  </span>
</template>

<style scoped>
.contenedor-icono {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  line-height: 0;
  vertical-align: middle;
  flex-shrink: 0;
}

:deep(.icono-lucide) {
  display: block;
}
</style>
