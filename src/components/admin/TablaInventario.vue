<script setup>
import IconoLucide from '../common/IconoLucide.vue'

defineProps({
  items: {
    type: Array,
    required: true,
  },
  esAdmin: {
    type: Boolean,
    default: false,
  },
})

defineEmits(['mover-stock', 'editar'])
</script>

<template>
  <div class="envoltura-tabla-inventario">
    <div class="contenedor-tabla-scroll">
      <table class="tabla-inventario">
        <thead>
          <tr>
            <th>Joya</th>
            <th>Categoría / Material</th>
            <th>Stock Central (Dueña)</th>
            <th>Stock Tienda (Físico)</th>
            <th>Total Stock</th>
            <th>Precio Venta</th>
            <th class="col-acciones">Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="joya in items" :key="joya.id">
            <!-- Joya con Miniatura -->
            <td>
              <div class="celda-joya">
                <img
                  :src="joya.imagen"
                  :alt="joya.nombre"
                  class="miniatura-inventario"
                />
                <span class="nombre-joya-inventario">{{ joya.nombre }}</span>
              </div>
            </td>

            <!-- Categoría y Material -->
            <td>
              <div class="celda-metadatos">
                <span class="texto-categoria">{{ joya.categoria }}</span>
                <span class="badge-material-mini">{{ joya.material }}</span>
              </div>
            </td>

            <!-- Stock Central -->
            <td>
              <span class="cifra-stock central">{{ joya.stockCentral }} u.</span>
            </td>

            <!-- Stock Tienda -->
            <td>
              <span
                class="cifra-stock tienda"
                :class="{
                  'stock-critico': joya.stockTienda <= 1 && joya.stockTienda > 0,
                  'stock-agotado': joya.stockTienda === 0,
                }"
              >
                {{ joya.stockTienda }} u.
              </span>
            </td>

            <!-- Total Stock -->
            <td>
              <span class="stock-total-negrita">
                {{ joya.stockCentral + joya.stockTienda }} u.
              </span>
            </td>

            <!-- Precio -->
            <td class="precio-col">Bs. {{ joya.precio }}</td>

            <!-- Acciones: Mover Stock y Editar (Solo Administradora) -->
            <td class="col-acciones">
              <div v-if="esAdmin" class="grupo-acciones">
                <button
                  type="button"
                  class="boton-traslado"
                  title="Mover unidades entre sedes"
                  @click="$emit('mover-stock', joya)"
                >
                  <IconoLucide nombre="ArrowRightLeft" :tamano="14" />
                  <span>Trasladar</span>
                </button>
                <button
                  type="button"
                  class="boton-editar"
                  title="Editar pieza"
                  @click="$emit('editar', joya)"
                >
                  <IconoLucide nombre="Edit" :tamano="14" />
                </button>
              </div>
              <span v-else class="badge-solo-lectura" title="Solo la Administradora puede alterar el inventario">
                <IconoLucide nombre="Eye" :tamano="13" />
                <span>Solo Consulta</span>
              </span>
            </td>
          </tr>

          <tr v-if="items.length === 0">
            <td colspan="7" class="fila-vacia">
              No se encontraron joyas en el inventario.
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
.envoltura-tabla-inventario {
  background-color: var(--color-blanco);
  border: 1px solid var(--color-neutral-200);
  border-radius: var(--radio-lg);
  box-shadow: var(--sombra-sutil);
  overflow: hidden;
}

.contenedor-tabla-scroll {
  width: 100%;
  overflow-x: auto;
}

.tabla-inventario {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
  font-size: var(--tamano-cuerpo);
}

.tabla-inventario th {
  background-color: var(--color-neutral-50);
  padding: 12px 16px;
  font-size: 12px;
  font-weight: 600;
  color: var(--color-neutral-600);
  text-transform: uppercase;
  letter-spacing: 0.04em;
  border-bottom: 1px solid var(--color-neutral-200);
  white-space: nowrap;
}

.tabla-inventario td {
  padding: 14px 16px;
  border-bottom: 1px solid var(--color-neutral-200);
  vertical-align: middle;
}

.tabla-inventario tr:last-child td {
  border-bottom: none;
}

.celda-joya {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 200px;
}

.miniatura-inventario {
  width: 40px;
  height: 40px;
  border-radius: var(--radio-sm);
  object-fit: cover;
  flex-shrink: 0;
  background-color: var(--color-neutral-50);
  border: 1px solid var(--color-neutral-200);
}

.nombre-joya-inventario {
  font-weight: 600;
  color: var(--color-neutral-900);
}

.celda-metadatos {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.texto-categoria {
  font-size: 13px;
  color: var(--color-neutral-900);
}

.badge-material-mini {
  font-size: 11px;
  color: var(--color-neutral-600);
  background-color: var(--color-neutral-50);
  padding: 1px 6px;
  border-radius: var(--radio-sm);
  width: fit-content;
  border: 1px solid var(--color-neutral-200);
}

.cifra-stock {
  font-weight: 600;
  font-size: 13px;
}

.cifra-stock.central {
  color: var(--color-neutral-900);
}

.cifra-stock.tienda {
  color: var(--color-exito);
}

.cifra-stock.stock-critico {
  color: var(--color-alerta);
  font-weight: 700;
}

.cifra-stock.stock-agotado {
  color: var(--color-peligro);
  font-weight: 700;
}

.stock-total-negrita {
  font-weight: 700;
  color: var(--color-neutral-900);
}

.precio-col {
  font-weight: 700;
  color: var(--color-neutral-900);
  white-space: nowrap;
}

.col-acciones {
  text-align: right;
  white-space: nowrap;
}

.grupo-acciones {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.boton-traslado {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  border-radius: var(--radio-sm);
  background-color: var(--color-neutral-50);
  border: 1px solid var(--color-neutral-200);
  color: var(--color-neutral-900);
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transicion-rapida);
}

.boton-traslado:hover {
  background-color: var(--color-neutral-200);
}

.boton-editar {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border-radius: var(--radio-sm);
  border: 1px solid var(--color-neutral-200);
  color: var(--color-neutral-600);
  transition: all var(--transicion-rapida);
}

.boton-editar:hover {
  background-color: var(--color-neutral-200);
  color: var(--color-neutral-900);
}

.badge-solo-lectura {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 11px;
  font-weight: 600;
  color: var(--color-neutral-600);
  background-color: var(--color-neutral-100);
  border: 1px solid var(--color-neutral-200);
  padding: 4px 8px;
  border-radius: var(--radio-sm);
}

.fila-vacia {
  text-align: center;
  color: var(--color-neutral-600);
  padding: 32px;
}
</style>
