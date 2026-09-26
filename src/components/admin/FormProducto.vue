<script setup>
import { ref } from 'vue'
import InputTexto from '../common/InputTexto.vue'
import BotonPrincipal from '../common/BotonPrincipal.vue'
import IconoLucide from '../common/IconoLucide.vue'

const emit = defineEmits(['guardar', 'cancelar'])

const nombre = ref('')
const categoria = ref('Anillos')
const material = ref('Acero 316L')
const precio = ref('')
const stockInicial = ref(5)

// Manejo de 2 fotos (Principal y Detalle)
const foto1Preview = ref('')
const foto2Preview = ref('')

const categoriasDisponibles = [
  'Anillos',
  'Cadenas/Collares',
  'Aritos',
  'Piercings',
  'Brazaletes',
  'Chokers',
  'Cinturones',
  'Gafas',
]

const materialesDisponibles = [
  'Acero 316L',
  'Artesanal',
  'Oro Laminado',
  'Plata 925',
  'Titanio Grado Implante',
]

const manejarSubidaFoto = (evento, numeroFoto) => {
  const archivo = evento.target.files[0]
  if (archivo) {
    const url = URL.createObjectURL(archivo)
    if (numeroFoto === 1) foto1Preview.value = url
    if (numeroFoto === 2) foto2Preview.value = url
  }
}

const enviarFormulario = () => {
  if (!nombre.value.trim() || !precio.value) {
    alert('Por favor, completa al menos el nombre y el precio de la joya.')
    return
  }

  emit('guardar', {
    nombre: nombre.value,
    categoria: categoria.value,
    material: material.value,
    precio: Number(precio.value),
    stockInicial: Number(stockInicial.value),
    imagen: foto1Preview.value || 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=500&auto=format&fit=crop&q=80',
    imagen_detalle: foto2Preview.value || '',
  })
}
</script>

<template>
  <form class="formulario-producto" @submit.prevent="enviarFormulario">
    <!-- Nombre -->
    <InputTexto
      v-model="nombre"
      etiqueta="Nombre de la pieza"
      placeholder="Ej. Anillo Serpiente Regulable"
      requerido
    />

    <!-- Categoría y Material en 2 Columnas -->
    <div class="fila-dos-columnas">
      <div class="grupo-select">
        <label class="etiqueta-select">Categoría *</label>
        <select v-model="categoria" class="control-select">
          <option v-for="cat in categoriasDisponibles" :key="cat" :value="cat">
            {{ cat }}
          </option>
        </select>
      </div>

      <div class="grupo-select">
        <label class="etiqueta-select">Material *</label>
        <select v-model="material" class="control-select">
          <option v-for="mat in materialesDisponibles" :key="mat" :value="mat">
            {{ mat }}
          </option>
        </select>
      </div>
    </div>

    <!-- Precio y Stock Inicial en 2 Columnas -->
    <div class="fila-dos-columnas">
      <InputTexto
        v-model="precio"
        tipo="number"
        etiqueta="Precio de venta (Bs.)"
        placeholder="Ej. 45"
        requerido
      />

      <InputTexto
        v-model="stockInicial"
        tipo="number"
        etiqueta="Stock inicial (Central)"
        placeholder="Ej. 10"
        requerido
      />
    </div>

    <!-- Carga de 2 Fotos WebP (Foto 1 y Foto 2) -->
    <div class="seccion-carga-fotos">
      <label class="etiqueta-select">Fotografías del producto (2 fotos en .webp)</label>
      <div class="cuadricula-cajas-foto">
        <!-- Foto 1 (Principal) -->
        <label class="caja-subida" :class="{ 'con-foto': foto1Preview }">
          <img v-if="foto1Preview" :src="foto1Preview" alt="Foto 1" class="preview-img" />
          <template v-else>
            <IconoLucide nombre="Camera" :tamano="24" />
            <span class="texto-caja-subida">Foto 1 (Principal)</span>
            <span class="subtexto-caja-subida">Portada del catálogo</span>
          </template>
          <input
            type="file"
            accept="image/*"
            class="sr-only"
            @change="manejarSubidaFoto($event, 1)"
          />
        </label>

        <!-- Foto 2 (Detalle / Puesta) -->
        <label class="caja-subida" :class="{ 'con-foto': foto2Preview }">
          <img v-if="foto2Preview" :src="foto2Preview" alt="Foto 2" class="preview-img" />
          <template v-else>
            <IconoLucide nombre="Camera" :tamano="24" />
            <span class="texto-caja-subida">Foto 2 (Detalle)</span>
            <span class="subtexto-caja-subida">Puesta o de cerca</span>
          </template>
          <input
            type="file"
            accept="image/*"
            class="sr-only"
            @change="manejarSubidaFoto($event, 2)"
          />
        </label>
      </div>
    </div>

    <!-- Botones de Acción -->
    <div class="acciones-formulario">
      <button
        type="button"
        class="boton-cancelar"
        @click="$emit('cancelar')"
      >
        Cancelar
      </button>

      <BotonPrincipal tipo="submit">
        Guardar Joya en Inventario
      </BotonPrincipal>
    </div>
  </form>
</template>

<style scoped>
.formulario-producto {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.fila-dos-columnas {
  display: grid;
  grid-template-columns: 1fr;
  gap: 14px;
}

@media (min-width: 640px) {
  .fila-dos-columnas {
    grid-template-columns: 1fr 1fr;
  }
}

.grupo-select {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.etiqueta-select {
  font-size: var(--tamano-cuerpo);
  font-weight: 600;
  color: var(--color-neutral-900);
}

.control-select {
  width: 100%;
  padding: 10px 14px;
  background-color: var(--color-blanco);
  border: 1px solid var(--color-neutral-200);
  border-radius: var(--radio-md);
  color: var(--color-neutral-900);
  font-size: var(--tamano-cuerpo);
  outline: none;
  cursor: pointer;
  transition: border-color var(--transicion-rapida);
}

.control-select:focus {
  border-color: var(--color-neutral-900);
}

.seccion-carga-fotos {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.cuadricula-cajas-foto {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.caja-subida {
  position: relative;
  aspect-ratio: 1 / 1;
  border: 2px dashed var(--color-neutral-200);
  border-radius: var(--radio-md);
  background-color: var(--color-neutral-50);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  cursor: pointer;
  overflow: hidden;
  transition: all var(--transicion-rapida);
  text-align: center;
  padding: 8px;
  color: var(--color-neutral-600);
}

.caja-subida:hover {
  border-color: var(--color-neutral-900);
  background-color: #F3F4F6;
  color: var(--color-neutral-900);
}

.preview-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.texto-caja-subida {
  font-size: 12px;
  font-weight: 600;
}

.subtexto-caja-subida {
  font-size: 10px;
  color: var(--color-neutral-600);
}

.acciones-formulario {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 12px;
  padding-top: 12px;
  border-top: 1px solid var(--color-neutral-200);
}

.boton-cancelar {
  padding: 10px 16px;
  border-radius: var(--radio-md);
  color: var(--color-neutral-600);
  font-weight: 600;
  transition: background-color var(--transicion-rapida);
}

.boton-cancelar:hover {
  background-color: var(--color-neutral-200);
  color: var(--color-neutral-900);
}
</style>
