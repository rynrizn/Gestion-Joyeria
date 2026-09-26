<script setup>
defineProps({
  etiqueta: {
    type: String,
    default: '',
  },
  tipo: {
    type: String,
    default: 'text',
  },
  placeholder: {
    type: String,
    default: '',
  },
  modelValue: {
    type: [String, Number],
    default: '',
  },
  error: {
    type: String,
    default: '',
  },
  deshabilitado: {
    type: Boolean,
    default: false,
  },
  requerido: {
    type: Boolean,
    default: false,
  },
})

defineEmits(['update:modelValue', 'enter'])
</script>

<template>
  <div class="campo-contenedor">
    <!-- Etiqueta superior opcional -->
    <label v-if="etiqueta" class="etiqueta-campo">
      {{ etiqueta }}
      <span v-if="requerido" class="asterisco-requerido">*</span>
    </label>

    <!-- Contenedor del input con posibles slots de iconos -->
    <div
      class="input-envoltura"
      :class="{
        'con-error': !!error,
        'esta-deshabilitado': deshabilitado,
      }"
    >
      <span v-if="$slots.iconoIzquierda" class="icono-posicion izquierda">
        <slot name="iconoIzquierda" />
      </span>

      <input
        :type="tipo"
        :value="modelValue"
        :placeholder="placeholder"
        :disabled="deshabilitado"
        :required="requerido"
        class="input-control"
        :class="{
          'tiene-icono-izq': !!$slots.iconoIzquierda,
          'tiene-icono-der': !!$slots.iconoDerecha,
        }"
        @input="$emit('update:modelValue', $event.target.value)"
        @keyup.enter="$emit('enter')"
      />

      <span v-if="$slots.iconoDerecha" class="icono-posicion derecha">
        <slot name="iconoDerecha" />
      </span>
    </div>

    <!-- Mensaje de error inferior -->
    <span v-if="error" class="mensaje-error">
      {{ error }}
    </span>
  </div>
</template>

<style scoped>
.campo-contenedor {
  display: flex;
  flex-direction: column;
  gap: 6px;
  width: 100%;
  text-align: left;
}

.etiqueta-campo {
  font-size: var(--tamano-cuerpo);
  font-weight: 600;
  color: var(--color-neutral-900);
  line-height: 1.25;
}

.asterisco-requerido {
  color: var(--color-peligro);
  margin-left: 2px;
}

.input-envoltura {
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
  background-color: var(--color-blanco);
  border: 1px solid var(--color-neutral-200);
  border-radius: var(--radio-md);
  transition: border-color var(--transicion-rapida), box-shadow var(--transicion-rapida);
}

.input-envoltura:focus-within {
  border-color: var(--color-neutral-900);
  box-shadow: 0 0 0 1px var(--color-neutral-900);
}

.input-envoltura.con-error {
  border-color: var(--color-peligro);
}

.input-envoltura.con-error:focus-within {
  box-shadow: 0 0 0 1px var(--color-peligro);
}

.input-envoltura.esta-deshabilitado {
  background-color: var(--color-neutral-50);
  opacity: 0.7;
  cursor: not-allowed;
}

.input-control {
  width: 100%;
  padding: 10px 14px;
  border: none;
  background: transparent;
  color: var(--color-neutral-900);
  font-size: var(--tamano-cuerpo);
  line-height: 1.5;
  outline: none;
}

.input-control::placeholder {
  color: #9CA3AF;
}

.input-control:disabled {
  cursor: not-allowed;
}

.input-control.tiene-icono-izq {
  padding-left: 40px;
}

.input-control.tiene-icono-der {
  padding-right: 40px;
}

.icono-posicion {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-neutral-600);
}

.icono-posicion.izquierda {
  left: 12px;
}

.icono-posicion.derecha {
  right: 12px;
}

.mensaje-error {
  font-size: var(--tamano-caption);
  color: var(--color-peligro);
  line-height: 1.2;
}
</style>
