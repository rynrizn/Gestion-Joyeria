<script setup>
import { computed } from 'vue'

const props = defineProps({
  estado: {
    type: String,
    required: true,
    validator: (valor) => {
      const estadosValidos = [
        'disponible',
        'reservado',
        'agotado',
        'cancelado',
        'entregada',
        'entregado',
        'pendiente',
        'habitual',
        'nueva',
      ]
      return estadosValidos.includes(valor.toLowerCase())
    },
  },
  texto: {
    type: String,
    default: '',
  },
})

// Mapeo amigable de textos en español si no se proporciona prop.texto
const etiqueta = computed(() => {
  if (props.texto) return props.texto

  switch (props.estado.toLowerCase()) {
    case 'disponible':
      return 'Disponible'
    case 'reservado':
      return 'Reservado'
    case 'agotado':
      return 'Agotado'
    case 'pendiente':
      return 'Pendiente'
    case 'entregada':
    case 'entregado':
      return 'Entregado'
    case 'cancelado':
      return 'Cancelado'
    case 'habitual':
      return 'Cliente Habitual'
    case 'nueva':
      return 'Cliente Nueva'
    default:
      return props.estado
  }
})

// Determinación de la variante visual
const claseVariante = computed(() => {
  const est = props.estado.toLowerCase()
  if (est === 'disponible' || est === 'entregado' || est === 'entregada' || est === 'habitual') {
    return 'badge-exito'
  }
  if (est === 'reservado' || est === 'pendiente') {
    return 'badge-alerta'
  }
  if (est === 'agotado' || est === 'cancelado') {
    return 'badge-peligro'
  }
  return 'badge-neutro'
})
</script>

<template>
  <span class="badge" :class="claseVariante">
    <span class="punto-indicador"></span>
    <span class="texto-badge">{{ etiqueta }}</span>
  </span>
</template>

<style scoped>
.badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 3px 10px;
  border-radius: var(--radio-completo);
  font-size: var(--tamano-caption);
  font-weight: 500;
  line-height: 1;
  white-space: nowrap;
  user-select: none;
}

.punto-indicador {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  flex-shrink: 0;
}

/* Variante Éxito (Verde) */
.badge-exito {
  background-color: var(--color-exito-fondo);
  color: var(--color-exito);
}
.badge-exito .punto-indicador {
  background-color: var(--color-exito);
}

/* Variante Alerta (Ámbar / Naranja) */
.badge-alerta {
  background-color: var(--color-alerta-fondo);
  color: var(--color-alerta);
}
.badge-alerta .punto-indicador {
  background-color: var(--color-alerta);
}

/* Variante Peligro (Rojo) */
.badge-peligro {
  background-color: var(--color-peligro-fondo);
  color: var(--color-peligro);
}
.badge-peligro .punto-indicador {
  background-color: var(--color-peligro);
}

/* Variante Neutro (Gris) */
.badge-neutro {
  background-color: var(--color-neutral-200);
  color: var(--color-neutral-600);
}
.badge-neutro .punto-indicador {
  background-color: var(--color-neutral-600);
}
</style>
