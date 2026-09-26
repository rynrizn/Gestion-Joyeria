<script setup>
import IconoLucide from '../common/IconoLucide.vue'

defineProps({
  clientes: {
    type: Array,
    required: true,
  },
})

defineEmits(['crear-reserva', 'contactar', 'ver-historial'])
</script>

<template>
  <div class="envoltura-tabla-clientes">
    <div class="contenedor-tabla-scroll">
      <table class="tabla-clientes">
        <thead>
          <tr>
            <th>Nombre de la Clienta</th>
            <th>WhatsApp / Teléfono</th>
            <th>Nivel de Confianza</th>
            <th>Compras Realizadas</th>
            <th>Última Visita</th>
            <th class="col-acciones">Acción</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="c in clientes" :key="c.id">
            <!-- Nombre y notas -->
            <td>
              <div class="celda-nombre">
                <span class="nombre-principal">{{ c.nombre }}</span>
                <span v-if="c.notas" class="notas-cliente">{{ c.notas }}</span>
              </div>
            </td>

            <!-- Teléfono WhatsApp -->
            <td>
              <button
                v-if="c.telefono"
                type="button"
                class="boton-whatsapp-enlace"
                title="Escribir por WhatsApp"
                @click="$emit('contactar', c)"
              >
                <IconoLucide nombre="MessageCircle" :tamano="14" />
                <span>{{ c.telefono }}</span>
              </button>
              <span v-else class="sin-dato">-</span>
            </td>

            <!-- Nivel de Confianza -->
            <td>
              <span
                class="badge-confianza"
                :class="c.tipo === 'HABITUAL' ? 'habitual' : 'nueva'"
              >
                <IconoLucide
                  :nombre="c.tipo === 'HABITUAL' ? 'ShieldCheck' : 'UserPlus'"
                  :tamano="13"
                />
                <span>
                  {{
                    c.tipo === 'HABITUAL'
                      ? 'Habitual (Permite reserva sin seña)'
                      : 'Nueva (Requiere pago total)'
                  }}
                </span>
              </span>
            </td>

            <!-- Cantidad de Compras -->
            <td>
              <span class="cifra-compras">
                <strong>{{ c.cantidadCompras }}</strong> compras
              </span>
            </td>

            <!-- Última Visita -->
            <td class="fecha-visita">{{ c.ultimaVisita }}</td>

            <!-- Acciones: Historial y Crear Reserva Temporal -->
            <td class="col-acciones">
              <div class="grupo-acciones-cliente">
                <button
                  type="button"
                  class="boton-historial-cliente"
                  title="Consultar historial de compras previas"
                  @click="$emit('ver-historial', c)"
                >
                  <IconoLucide nombre="History" :tamano="14" />
                  <span>Historial</span>
                </button>
                <button
                  type="button"
                  class="boton-crear-reserva"
                  title="Crear apartado temporal"
                  @click="$emit('crear-reserva', c)"
                >
                  <IconoLucide nombre="CalendarPlus" :tamano="14" />
                  <span>Apartar</span>
                </button>
              </div>
            </td>
          </tr>

          <tr v-if="clientes.length === 0">
            <td colspan="6" class="fila-vacia">
              No se encontraron clientas con ese término de búsqueda.
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
.envoltura-tabla-clientes {
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

.tabla-clientes {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
  font-size: var(--tamano-cuerpo);
}

.tabla-clientes th {
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

.tabla-clientes td {
  padding: 14px 16px;
  border-bottom: 1px solid var(--color-neutral-200);
  vertical-align: middle;
}

.tabla-clientes tr:last-child td {
  border-bottom: none;
}

.celda-nombre {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 160px;
}

.nombre-principal {
  font-weight: 600;
  color: var(--color-neutral-900);
}

.notas-cliente {
  font-size: 11px;
  color: var(--color-neutral-600);
}

.boton-whatsapp-enlace {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: var(--color-whatsapp);
  font-size: 13px;
  font-weight: 500;
  width: fit-content;
}

.boton-whatsapp-enlace:hover {
  text-decoration: underline;
}

.sin-dato {
  color: var(--color-neutral-600);
}

/* Badge de Confianza */
.badge-confianza {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border-radius: var(--radio-completo);
  font-size: 11px;
  font-weight: 600;
  white-space: nowrap;
}

.badge-confianza.habitual {
  background-color: var(--color-exito-fondo);
  color: var(--color-exito);
  border: 1px solid rgba(22, 163, 74, 0.2);
}

.badge-confianza.nueva {
  background-color: var(--color-alerta-fondo);
  color: var(--color-alerta);
  border: 1px solid rgba(217, 119, 6, 0.2);
}

.cifra-compras {
  font-size: 13px;
  color: var(--color-neutral-900);
  white-space: nowrap;
}

.fecha-visita {
  font-size: 12px;
  color: var(--color-neutral-600);
  white-space: nowrap;
}

.col-acciones {
  text-align: right;
  white-space: nowrap;
}

.grupo-acciones-cliente {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.boton-historial-cliente {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 6px 10px;
  border-radius: var(--radio-sm);
  background-color: var(--color-neutral-50);
  border: 1px solid var(--color-neutral-200);
  color: var(--color-neutral-800);
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transicion-rapida);
}

.boton-historial-cliente:hover {
  background-color: var(--color-primario-fondo);
  color: var(--color-primario);
  border-color: rgba(62, 18, 24, 0.2);
}

.boton-crear-reserva {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: var(--radio-sm);
  background-color: var(--color-primario);
  color: var(--color-blanco);
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transicion-rapida);
}

.boton-crear-reserva:hover {
  background-color: var(--color-primario-hover);
}

.fila-vacia {
  text-align: center;
  color: var(--color-neutral-600);
  padding: 32px;
}
</style>
