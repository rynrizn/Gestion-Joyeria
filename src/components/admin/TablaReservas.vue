<script setup>
import BadgeEstado from '../common/BadgeEstado.vue'
import IconoLucide from '../common/IconoLucide.vue'

defineProps({
  reservas: {
    type: Array,
    required: true,
  },
})

defineEmits(['entregar', 'liberar', 'contactar'])
</script>

<template>
  <div class="envoltura-tabla-reservas">
    <div class="contenedor-tabla-scroll">
      <table class="tabla-reservas">
        <thead>
          <tr>
            <th>Cliente</th>
            <th>Joya Apartada</th>
            <th>Total (Bs.)</th>
            <th>Vencimiento</th>
            <th>Estado</th>
            <th class="col-acciones">Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="reserva in reservas"
            :key="reserva.id"
            :class="{ 'fila-urgente': reserva.esUrgente }"
          >
            <!-- Cliente y Teléfono -->
            <td>
              <div class="celda-cliente">
                <span class="nombre-cliente">{{ reserva.cliente }}</span>
                <button
                  v-if="reserva.telefono"
                  type="button"
                  class="boton-whatsapp-tabla"
                  title="Contactar por WhatsApp"
                  @click="$emit('contactar', reserva)"
                >
                  <IconoLucide nombre="MessageCircle" :tamano="14" />
                  <span>{{ reserva.telefono }}</span>
                </button>
              </div>
            </td>

            <!-- Producto -->
            <td>
              <span class="producto-nombre">{{ reserva.producto }}</span>
              <span class="cantidad-badge">x{{ reserva.cantidad }}</span>
            </td>

            <!-- Importe -->
            <td class="monto-negrita">Bs. {{ reserva.montoTotal }}</td>

            <!-- Vencimiento -->
            <td>
              <span
                class="etiqueta-vencimiento"
                :class="{ urgente: reserva.esUrgente }"
              >
                <IconoLucide nombre="Clock" :tamano="14" />
                {{ reserva.vencimiento }}
              </span>
            </td>

            <!-- Badge de Estado -->
            <td>
              <BadgeEstado :estado="reserva.estado" />
            </td>

            <!-- Botones de Acción -->
            <td class="col-acciones">
              <div v-if="reserva.estado === 'PENDIENTE'" class="grupo-acciones">
                <button
                  type="button"
                  class="boton-accion cobrar"
                  title="Cobrar y entregar pieza"
                  @click="$emit('entregar', reserva.id)"
                >
                  <IconoLucide nombre="Check" :tamano="14" />
                  <span>Cobrar</span>
                </button>
                <button
                  type="button"
                  class="boton-accion liberar"
                  title="Liberar a stock físico"
                  @click="$emit('liberar', reserva.id)"
                >
                  <IconoLucide nombre="X" :tamano="14" />
                  <span>Liberar</span>
                </button>
              </div>
              <span v-else class="texto-finalizado">Completada</span>
            </td>
          </tr>

          <tr v-if="reservas.length === 0">
            <td colspan="6" class="fila-vacia">
              No se encontraron registros de reservas.
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
.envoltura-tabla-reservas {
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

.tabla-reservas {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
  font-size: var(--tamano-cuerpo);
}

.tabla-reservas th {
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

.tabla-reservas td {
  padding: 14px 16px;
  border-bottom: 1px solid var(--color-neutral-200);
  vertical-align: middle;
}

.tabla-reservas tr:last-child td {
  border-bottom: none;
}

.fila-urgente {
  background-color: #FFFBEB;
}

.celda-cliente {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 140px;
}

.nombre-cliente {
  font-weight: 600;
  color: var(--color-neutral-900);
}

.boton-whatsapp-tabla {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  color: var(--color-whatsapp);
  font-size: 12px;
  font-weight: 500;
  width: fit-content;
}

.boton-whatsapp-tabla:hover {
  text-decoration: underline;
}

.producto-nombre {
  font-weight: 500;
  color: var(--color-neutral-900);
}

.cantidad-badge {
  font-size: 12px;
  color: var(--color-neutral-600);
  margin-left: 6px;
}

.monto-negrita {
  font-weight: 700;
  color: var(--color-neutral-900);
  white-space: nowrap;
}

.etiqueta-vencimiento {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: var(--color-neutral-600);
  font-weight: 500;
  white-space: nowrap;
}

.etiqueta-vencimiento.urgente {
  color: var(--color-alerta);
  font-weight: 700;
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

.boton-accion {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 6px 10px;
  border-radius: var(--radio-sm);
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transicion-rapida);
}

.boton-accion.cobrar {
  background-color: var(--color-exito-fondo);
  color: var(--color-exito);
  border: 1px solid rgba(22, 163, 74, 0.2);
}

.boton-accion.cobrar:hover {
  background-color: var(--color-exito);
  color: var(--color-blanco);
}

.boton-accion.liberar {
  background-color: var(--color-neutral-50);
  color: var(--color-neutral-600);
  border: 1px solid var(--color-neutral-200);
}

.boton-accion.liberar:hover {
  background-color: var(--color-peligro-fondo);
  color: var(--color-peligro);
  border-color: rgba(220, 38, 38, 0.2);
}

.texto-finalizado {
  font-size: 12px;
  color: var(--color-neutral-600);
  font-weight: 500;
}

.fila-vacia {
  text-align: center;
  color: var(--color-neutral-600);
  padding: 32px;
}
</style>
