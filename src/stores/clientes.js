import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useClientesStore = defineStore('clientes', () => {
  // Lista de clientas alineada con la tabla 'cliente' de la BD PostgreSQL
  const clientes = ref([
    {
      id: 1,
      nombre: 'María López Vaca',
      telefono: '71234567',
      tipo: 'HABITUAL',
      cantidadCompras: 8,
      ultimaVisita: '2026-09-20',
      notas: 'Clienta de confianza, suele retirar los fines de semana.',
    },
    {
      id: 2,
      nombre: 'Ana García Saucedo',
      telefono: '72345678',
      tipo: 'NUEVA',
      cantidadCompras: 1,
      ultimaVisita: '2026-09-25',
      notas: 'Primera compra realizada por WhatsApp.',
    },
    {
      id: 3,
      nombre: 'Laura Ríos Morales',
      telefono: '73456789',
      tipo: 'HABITUAL',
      cantidadCompras: 5,
      ultimaVisita: '2026-09-22',
      notas: 'Prefiere joyas en acero 316L plateado.',
    },
    {
      id: 4,
      nombre: 'Valeria Castro Pinto',
      telefono: '74567890',
      tipo: 'NUEVA',
      cantidadCompras: 0,
      ultimaVisita: '2026-09-26',
      notas: 'Consultó por aros y piercings en tienda física.',
    },
    {
      id: 5,
      nombre: 'Camila Suárez Justiniano',
      telefono: '75678901',
      tipo: 'HABITUAL',
      cantidadCompras: 12,
      ultimaVisita: '2026-09-18',
      notas: 'Clienta VIP, retira pedidos directo de Central.',
    },
  ])

  const busqueda = ref('')

  // Clientes filtrados por nombre o teléfono
  const clientesFiltrados = computed(() => {
    const q = busqueda.value.toLowerCase().trim()
    if (!q) return clientes.value
    return clientes.value.filter(
      (c) =>
        c.nombre.toLowerCase().includes(q) ||
        c.telefono.includes(q)
    )
  })

  // Alta de nuevo cliente
  const registrarCliente = (nuevo) => {
    const nuevoCliente = {
      id: clientes.value.length + 1,
      nombre: nuevo.nombre,
      telefono: nuevo.telefono || '',
      tipo: nuevo.tipo || 'NUEVA',
      cantidadCompras: 0,
      ultimaVisita: new Date().toISOString().slice(0, 10),
      notas: nuevo.notas || '',
    }
    clientes.value.unshift(nuevoCliente)
    return nuevoCliente
  }

  return {
    clientes,
    busqueda,
    clientesFiltrados,
    registrarCliente,
  }
})
