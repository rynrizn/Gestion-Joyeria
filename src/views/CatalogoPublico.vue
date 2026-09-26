<script setup>
import { useRouter } from 'vue-router'
import { useProductosStore } from '../stores/productos'
import { useCarritoStore } from '../stores/carrito'
import NavbarPublico from '../components/common/NavbarPublico.vue'
import Buscador from '../components/catalogo/Buscador.vue'
import FiltrosCategoria from '../components/catalogo/FiltrosCategoria.vue'
import TarjetaJoya from '../components/catalogo/TarjetaJoya.vue'
import CarritoDrawer from '../components/catalogo/CarritoDrawer.vue'
import IconoLucide from '../components/common/IconoLucide.vue'

const productosStore = useProductosStore()
const carritoStore = useCarritoStore()
const router = useRouter()

const verDetalleJoya = (joya) => {
  router.push(`/producto/${joya.id}`)
}

const agregarAlCarrito = (joya) => {
  carritoStore.agregarProducto(joya)
}
</script>

<template>
  <div class="vista-catalogo">
    <!-- Barra Superior de Navegación -->
    <NavbarPublico
      :cantidad-carrito="carritoStore.totalItems"
      @abrir-carrito="carritoStore.abrirCarrito()"
    />

    <!-- Contenido Principal del Catálogo -->
    <div class="contenedor cuerpo-catalogo">
      <!-- Sección de Búsqueda y Filtros Rápidos -->
      <section class="seccion-filtros">
        <Buscador v-model="productosStore.busqueda" />

        <FiltrosCategoria
          :categorias="productosStore.categorias"
          :categoria-activa="productosStore.categoriaActiva"
          @seleccionar="(cat) => (productosStore.categoriaActiva = cat)"
        />
      </section>

      <!-- Contador de Resultados -->
      <div class="barra-info-resultados">
        <span class="conteo-piezas">
          {{ productosStore.productosFiltrados.length }}
          {{ productosStore.productosFiltrados.length === 1 ? 'joya disponible' : 'joyas disponibles' }}
        </span>

        <span v-if="productosStore.categoriaActiva !== 'Todos'" class="filtro-activo-badge">
          Categoría: {{ productosStore.categoriaActiva }}
        </span>
      </div>

      <!-- Grid de Productos (2 col móvil, 4 col escritorio) -->
      <section v-if="productosStore.productosFiltrados.length > 0" class="grid-productos">
        <TarjetaJoya
          v-for="joya in productosStore.productosFiltrados"
          :key="joya.id"
          :producto="joya"
          @ver-detalle="verDetalleJoya"
          @agregar="agregarAlCarrito"
        />
      </section>

      <!-- Estado cuando no hay resultados de búsqueda -->
      <div v-else class="sin-resultados">
        <div class="circulo-icono-alerta">
          <IconoLucide nombre="Search" :tamano="32" />
        </div>
        <h3 class="titulo-sin-resultados">No encontramos piezas con ese criterio</h3>
        <p class="desc-sin-resultados">
          Prueba con otra palabra clave o selecciona otra categoría.
        </p>
        <button
          type="button"
          class="boton-restablecer"
          @click="
            productosStore.busqueda = '';
            productosStore.categoriaActiva = 'Todos';
          "
        >
          Ver todo el catálogo
        </button>
      </div>
    </div>

    <!-- Drawer Lateral del Carrito -->
    <CarritoDrawer />
  </div>
</template>

<style scoped>
.vista-catalogo {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.cuerpo-catalogo {
  padding-top: 16px;
  padding-bottom: 48px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.seccion-filtros {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.barra-info-resultados {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: var(--tamano-caption);
  color: var(--color-neutral-600);
  padding: 0 2px;
}

.conteo-piezas {
  font-weight: 500;
}

.filtro-activo-badge {
  background-color: var(--color-neutral-200);
  color: var(--color-neutral-900);
  padding: 2px 8px;
  border-radius: var(--radio-sm);
  font-weight: 600;
}

/* Grid de Productos Responsivo: 2 col en móvil, 4 col en escritorio */
.grid-productos {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

@media (min-width: 640px) {
  .grid-productos {
    gap: 16px;
  }
}

@media (min-width: 768px) {
  .grid-productos {
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 20px;
  }
}

@media (min-width: 1024px) {
  .grid-productos {
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 24px;
  }
}

/* Estado Sin Resultados */
.sin-resultados {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 60px 20px;
  background-color: var(--color-blanco);
  border-radius: var(--radio-lg);
  border: 1px dashed var(--color-neutral-200);
  margin-top: 20px;
}

.circulo-icono-alerta {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background-color: var(--color-neutral-50);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-neutral-600);
  margin-bottom: 16px;
}

.titulo-sin-resultados {
  font-size: 16px;
  font-weight: 600;
  color: var(--color-neutral-900);
  margin-bottom: 6px;
}

.desc-sin-resultados {
  font-size: var(--tamano-cuerpo);
  color: var(--color-neutral-600);
  max-width: 380px;
  margin-bottom: 20px;
}

.boton-restablecer {
  padding: 8px 16px;
  border-radius: var(--radio-md);
  background-color: var(--color-neutral-900);
  color: var(--color-blanco);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: opacity var(--transicion-rapida);
}

.boton-restablecer:hover {
  opacity: 0.9;
}
</style>
