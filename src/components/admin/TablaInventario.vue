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

defineEmits(['mover-stock', 'editar', 'eliminar'])
</script>

<template>
  <div class="envoltura-tabla-inventario">
    <div class="contenedor-tabla-scroll">
      <table class="tabla-inventario">
        <thead>
          <tr>
            <th>Producto</th>
            <th>Stock Central</th>
            <th>Stock Tienda</th>
            <th>Total Stock</th>
            <th>Prioridad</th>
            <th>Precio</th>
            <th class="col-acciones">Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="producto in items" :key="producto.id">
            <!-- 1. Producto con Miniatura, Nombre y Estado Activo/Inactivo -->
            <td>
              <div class="celda-producto">
                <img
                  :src="producto.imagen"
                  :alt="producto.nombre"
                  class="miniatura-inventario"
                />
                <div class="info-nombre-estado">
                  <span class="nombre-producto-inventario">{{ producto.nombre }}</span>
                  <div class="fila-badges-producto">
                    <!-- Indicador de Estado Activo / Inactivo -->
                    <span
                      class="badge-estado-activo"
                      :class="producto.activo !== false ? 'estado-activo' : 'estado-inactivo'"
                      :title="producto.activo !== false ? 'Visible en el catálogo público' : 'Oculto para clientes en la web'"
                    >
                      <span class="punto-estado"></span>
                      <span>{{ producto.activo !== false ? 'Activo' : 'Inactivo' }}</span>
                    </span>

                    <span v-if="producto.material" class="badge-material-mini">
                      {{ producto.material }}
                    </span>
                  </div>
                </div>
              </div>
            </td>

            <!-- 2. Stock Central (Dueña) -->
            <td>
              <span class="cifra-stock central">{{ producto.stockCentral }} u.</span>
            </td>

            <!-- 3. Stock Tienda (Físico) -->
            <td>
              <span
                class="cifra-stock tienda"
                :class="{
                  'stock-critico': producto.stockTienda <= (producto.stock_minimo || 1) && producto.stockTienda > 0,
                  'stock-agotado': producto.stockTienda === 0,
                }"
              >
                {{ producto.stockTienda }} u.
              </span>
            </td>

            <!-- 4. Total Stock -->
            <td>
              <span class="stock-total-negrita">
                {{ (producto.stockCentral || 0) + (producto.stockTienda || 0) }} u.
              </span>
            </td>

            <!-- 5. Prioridad (Azul si es activa, Gris si es inactiva) -->
            <td>
              <span
                class="badge-prioridad"
                :class="producto.es_prioritario ? 'prioridad-activa' : 'prioridad-inactiva'"
              >
                <IconoLucide
                  :nombre="producto.es_prioritario ? 'Star' : 'Minus'"
                  :tamano="12"
                />
                <span>{{ producto.es_prioritario ? 'Activa' : 'Inactiva' }}</span>
              </span>
            </td>

            <!-- 6. Precio -->
            <td class="precio-col">Bs. {{ producto.precio }}</td>

            <!-- 7. Acciones (Mover Stock y Editar) -->
            <td class="col-acciones">
              <div v-if="esAdmin" class="grupo-acciones">
                <button
                  type="button"
                  class="boton-traslado"
                  title="Mover unidades entre sedes"
                  @click="$emit('mover-stock', producto)"
                >
                  <IconoLucide nombre="ArrowRightLeft" :tamano="14" />
                  <span>Trasladar</span>
                </button>
                <button
                  type="button"
                  class="boton-editar"
                  title="Editar producto"
                  @click="$emit('editar', producto)"
                >
                  <IconoLucide nombre="Edit" :tamano="14" />
                </button>
                <button
                  type="button"
                  class="boton-eliminar"
                  title="Eliminar producto"
                  @click="$emit('eliminar', producto)"
                >
                  <IconoLucide nombre="Trash2" :tamano="14" />
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
              No se encontraron productos en el inventario con los filtros aplicados.
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

.celda-producto {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 220px;
}

.miniatura-inventario {
  width: 44px;
  height: 44px;
  border-radius: var(--radio-sm);
  object-fit: cover;
  flex-shrink: 0;
  background-color: var(--color-neutral-50);
  border: 1px solid var(--color-neutral-200);
}

.info-nombre-estado {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.nombre-producto-inventario {
  font-weight: 600;
  color: var(--color-neutral-900);
  line-height: 1.3;
}

.fila-badges-producto {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

/* Indicador Activo / Inactivo */
.badge-estado-activo {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 10px;
  font-weight: 700;
  padding: 2px 7px;
  border-radius: var(--radio-completo);
  line-height: 1;
}

.badge-estado-activo.estado-activo {
  background-color: #dcfce7;
  color: #15803d;
  border: 1px solid rgba(22, 163, 74, 0.25);
}

.badge-estado-activo.estado-activo .punto-estado {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background-color: #16a34a;
}

.badge-estado-activo.estado-inactivo {
  background-color: #f3f4f6;
  color: #4b5563;
  border: 1px solid rgba(107, 114, 128, 0.25);
}

.badge-estado-activo.estado-inactivo .punto-estado {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background-color: #6b7280;
}

.badge-material-mini {
  font-size: 10px;
  color: var(--color-neutral-600);
  background-color: var(--color-neutral-100);
  padding: 2px 6px;
  border-radius: var(--radio-sm);
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

/* Badge de Prioridad: Azul para Activa, Gris para Inactiva */
.badge-prioridad {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 11px;
  font-weight: 700;
  padding: 3px 9px;
  border-radius: var(--radio-completo);
  white-space: nowrap;
}

.badge-prioridad.prioridad-activa {
  background-color: #dbeafe; /* Fondo azul */
  color: #1d4ed8;            /* Texto azul fuerte */
  border: 1px solid rgba(29, 78, 216, 0.3);
}

.badge-prioridad.prioridad-inactiva {
  background-color: #f3f4f6; /* Fondo gris */
  color: #6b7280;            /* Texto gris */
  border: 1px solid rgba(107, 114, 128, 0.2);
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

.boton-eliminar {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border-radius: var(--radio-sm);
  border: 1px solid var(--color-neutral-200);
  color: var(--color-neutral-500);
  cursor: pointer;
  background-color: transparent;
  transition: all var(--transicion-rapida);
}

.boton-eliminar:hover {
  background-color: #fef2f2;
  border-color: #fca5a5;
  color: #dc2626;
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
