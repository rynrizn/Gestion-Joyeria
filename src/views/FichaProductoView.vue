<script setup>
import { ref, computed } from 'vue'
import { useRoute, useRouter, RouterLink } from 'vue-router'
import { useProductosStore } from '../stores/productos'
import { useCarritoStore } from '../stores/carrito'
import NavbarPublico from '../components/common/NavbarPublico.vue'
import CarritoDrawer from '../components/catalogo/CarritoDrawer.vue'
import IconoLucide from '../components/common/IconoLucide.vue'

const route = useRoute()
const router = useRouter()
const productosStore = useProductosStore()
const carritoStore = useCarritoStore()

// Obtenemos la joya a partir del parámetro de ruta /producto/:id
const joya = computed(() => {
  return productosStore.obtenerPorId(route.params.id)
})

// Control de foto activa (Foto 1 Principal vs Foto 2 Detalle)
const fotoSeleccionada = ref(0)

const fotos = computed(() => {
  if (!joya.value) return []
  const lista = []
  if (joya.value.imagen) lista.push(joya.value.imagen)
  if (joya.value.imagen_detalle) lista.push(joya.value.imagen_detalle)
  return lista
})

const estaDisponible = computed(() => {
  return Number(joya.value?.stock || 0) > 0
})

const agregarAlCarrito = () => {
  if (joya.value && estaDisponible.value) {
    carritoStore.agregarProducto(joya.value)
  }
}
</script>

<template>
  <div class="vista-ficha">
    <!-- Navbar con contador -->
    <NavbarPublico
      :cantidad-carrito="carritoStore.totalItems"
      @abrir-carrito="carritoStore.abrirCarrito()"
    />

    <main class="contenedor cuerpo-ficha">
      <!-- Botón de Retorno -->
      <nav class="navegacion-retorno">
        <RouterLink to="/" class="boton-volver">
          <IconoLucide nombre="ArrowLeft" :tamano="18" />
          <span>Volver al catálogo</span>
        </RouterLink>
      </nav>

      <!-- Ficha de la Joya si existe -->
      <div v-if="joya" class="cuadricula-detalle">
        <!-- Galería de 2 Fotos (Principal y Detalle) -->
        <section class="seccion-galeria">
          <!-- Visor Principal Cuadrado 1:1 -->
          <div class="visor-principal">
            <img
              :src="fotos[fotoSeleccionada] || joya.imagen"
              :alt="joya.nombre"
              class="foto-grande"
            />
            <span class="badge-superpuesto">{{ joya.material }}</span>
          </div>

          <!-- Miniaturas selectoras de foto 1 y foto 2 -->
          <div v-if="fotos.length > 1" class="tira-miniaturas">
            <button
              v-for="(foto, index) in fotos"
              :key="index"
              type="button"
              class="boton-miniatura"
              :class="{ 'miniatura-activa': fotoSeleccionada === index }"
              :title="`Ver imagen ${index + 1}`"
              @click="fotoSeleccionada = index"
            >
              <img :src="foto" :alt="`Foto ${index + 1}`" class="miniatura-img" />
            </button>
          </div>
        </section>

        <!-- Información y Compra -->
        <section class="seccion-info">
          <span class="categoria-etiqueta">{{ joya.categoria }}</span>
          <h1 class="titulo-joya">{{ joya.nombre }}</h1>

          <!-- Precio Destacado -->
          <div class="bloque-precio">
            <span class="precio-texto">Bs. {{ joya.precio_venta }}</span>
            <span class="iva-incluido">Precio</span>
          </div>

          <!-- Indicador de Disponibilidad de Stock Físico -->
          <div class="indicador-disponibilidad" :class="estaDisponible ? 'disponible' : 'agotado'">
            <span class="punto-estado"></span>
            <span class="texto-estado">
              {{ estaDisponible ? 'En stock físico disponible' : 'Actualmente agotado' }}
            </span>
            <span v-if="estaDisponible && joya.stock <= 2" class="alerta-pocas">
              (Quedan {{ joya.stock }} piezas)
            </span>
          </div>

          <!-- Especificaciones Oficiales (Columnas de la base de datos) -->
          <div class="tabla-especificaciones">
            <div class="fila-especificacion">
              <span class="clave-spec">Categoría:</span>
              <span class="valor-spec">{{ joya.categoria }}</span>
            </div>
            <div class="fila-especificacion">
              <span class="clave-spec">Material:</span>
              <span class="valor-spec">{{ joya.material }}</span>
            </div>
            <div v-if="joya.color" class="fila-especificacion">
              <span class="clave-spec">Color:</span>
              <span class="valor-spec">{{ joya.color }}</span>
            </div>
            <div v-if="joya.talla" class="fila-especificacion">
              <span class="clave-spec">Medida / Talla:</span>
              <span class="valor-spec">{{ joya.talla }}</span>
            </div>
          </div>

          <!-- Botón de Añadir al Carrito -->
          <div class="bloque-acciones">
            <button
              type="button"
              class="boton-anadir-carrito"
              :disabled="!estaDisponible"
              @click="agregarAlCarrito"
            >
              <IconoLucide nombre="ShoppingBag" :tamano="20" />
              <span>{{ estaDisponible ? 'Añadir al Carrito' : 'Pieza no disponible' }}</span>
            </button>

            <p class="nota-coordinacion-chat">
              Al añadir podrás pedir directamente por WhatsApp con la dueña.
            </p>
          </div>
        </section>
      </div>

      <!-- Estado si no existe el ID del producto -->
      <div v-else class="producto-no-encontrado">
        <h2>Producto no encontrado</h2>
        <p>El enlace que recibiste ya no está disponible o la joya fue retirada.</p>
        <RouterLink to="/" class="boton-ir-catalogo">Ir al Catálogo Principal</RouterLink>
      </div>
    </main>

    <!-- Carrito Drawer -->
    <CarritoDrawer />
  </div>
</template>

<style scoped>
.vista-ficha {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.cuerpo-ficha {
  padding-top: 20px;
  padding-bottom: 60px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.navegacion-retorno {
  display: flex;
  align-items: center;
}

.boton-volver {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: var(--tamano-cuerpo);
  font-weight: 500;
  color: var(--color-neutral-600);
  transition: color var(--transicion-rapida);
}

.boton-volver:hover {
  color: var(--color-neutral-900);
}

/* Cuadrícula de Detalle: 1 col móvil, 2 col escritorio */
.cuadricula-detalle {
  display: grid;
  grid-template-columns: 1fr;
  gap: 28px;
}

@media (min-width: 768px) {
  .cuadricula-detalle {
    grid-template-columns: 1fr 1fr;
    gap: 40px;
    align-items: start;
  }
}

/* Galería de Fotos */
.seccion-galeria {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.visor-principal {
  position: relative;
  width: 100%;
  aspect-ratio: 1 / 1;
  border-radius: var(--radio-lg);
  overflow: hidden;
  background-color: var(--color-neutral-50);
  border: 1px solid var(--color-neutral-200);
}

.foto-grande {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.badge-superpuesto {
  position: absolute;
  top: 14px;
  left: 14px;
  background-color: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(4px);
  color: var(--color-neutral-900);
  font-size: 12px;
  font-weight: 600;
  padding: 4px 10px;
  border-radius: var(--radio-sm);
  border: 1px solid var(--color-neutral-200);
}

.tira-miniaturas {
  display: flex;
  gap: 12px;
}

.boton-miniatura {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 4px;
  border-radius: var(--radio-md);
  border: 2px solid var(--color-neutral-200);
  background-color: var(--color-blanco);
  cursor: pointer;
  transition: all var(--transicion-rapida);
}

.boton-miniatura.miniatura-activa {
  border-color: var(--color-neutral-900);
}

.miniatura-img {
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: var(--radio-sm);
}

.etiqueta-foto {
  font-size: 10px;
  color: var(--color-neutral-600);
  font-weight: 500;
}

/* Sección de Información */
.seccion-info {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.categoria-etiqueta {
  font-size: 12px;
  font-weight: 600;
  color: var(--color-neutral-600);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.titulo-joya {
  font-size: 22px;
  font-weight: 700;
  color: var(--color-neutral-900);
  line-height: 1.25;
}

@media (min-width: 768px) {
  .titulo-joya {
    font-size: 28px;
  }
}

.bloque-precio {
  display: flex;
  align-items: baseline;
  gap: 8px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--color-neutral-200);
}

.precio-texto {
  font-size: 28px;
  font-weight: 800;
  color: var(--color-neutral-900);
}

.iva-incluido {
  font-size: 13px;
  color: var(--color-neutral-600);
}

.indicador-disponibilidad {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  font-weight: 500;
  padding: 8px 12px;
  border-radius: var(--radio-md);
}

.indicador-disponibilidad.disponible {
  background-color: var(--color-exito-fondo);
  color: var(--color-exito);
}
.indicador-disponibilidad.disponible .punto-estado {
  background-color: var(--color-exito);
}

.indicador-disponibilidad.agotado {
  background-color: var(--color-peligro-fondo);
  color: var(--color-peligro);
}
.indicador-disponibilidad.agotado .punto-estado {
  background-color: var(--color-peligro);
}

.punto-estado {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.alerta-pocas {
  font-weight: 700;
  color: var(--color-alerta);
}

.tabla-especificaciones {
  display: flex;
  flex-direction: column;
  gap: 8px;
  background-color: var(--color-neutral-50);
  padding: 14px 16px;
  border-radius: var(--radio-md);
  border: 1px solid var(--color-neutral-200);
}

.fila-especificacion {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
}

.clave-spec {
  color: var(--color-neutral-600);
}

.valor-spec {
  font-weight: 600;
  color: var(--color-neutral-900);
}

.bloque-descripcion {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.subtitulo-seccion {
  font-size: 15px;
  font-weight: 600;
  color: var(--color-neutral-900);
}

.texto-descripcion {
  font-size: 14px;
  color: var(--color-neutral-600);
  line-height: 1.6;
}

.bloque-acciones {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 10px;
}

.boton-anadir-carrito {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 14px 20px;
  border-radius: var(--radio-md);
  background-color: var(--color-neutral-900);
  color: var(--color-blanco);
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  transition: all var(--transicion-rapida);
}

.boton-anadir-carrito:hover:not(:disabled) {
  background-color: #1f2937;
  transform: translateY(-1px);
}

.boton-anadir-carrito:disabled {
  background-color: var(--color-neutral-200);
  color: var(--color-neutral-600);
  cursor: not-allowed;
}

.nota-coordinacion-chat {
  font-size: 12px;
  color: var(--color-neutral-600);
  text-align: center;
}

.producto-no-encontrado {
  text-align: center;
  padding: 60px 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
}

.boton-ir-catalogo {
  padding: 10px 18px;
  border-radius: var(--radio-md);
  background-color: var(--color-neutral-900);
  color: var(--color-blanco);
  font-weight: 600;
}
</style>
