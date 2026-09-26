import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

const CLAVE_CLIENTES = 'moonstone_clientes'

const CLIENTES_INICIALES = [
  {
    id: 1,
    nombre: 'María López Vaca',
    telefono: '71234567',
    ci: '8392102 SC',
    tipo: 'HABITUAL',
    cantidadCompras: 8,
    ultimaVisita: '2026-09-20',
    notas: 'Clienta de confianza, suele retirar los fines de semana.',
  },
  {
    id: 2,
    nombre: 'Ana García Saucedo',
    telefono: '72345678',
    ci: '9120381 SC',
    tipo: 'NUEVA',
    cantidadCompras: 1,
    ultimaVisita: '2026-09-25',
    notas: 'Primera compra realizada por WhatsApp.',
  },
  {
    id: 3,
    nombre: 'Laura Ríos Morales',
    telefono: '73456789',
    ci: '6482910 SC',
    tipo: 'HABITUAL',
    cantidadCompras: 5,
    ultimaVisita: '2026-09-22',
    notas: 'Prefiere joyas en acero 316L plateado.',
  },
  {
    id: 4,
    nombre: 'Valeria Castro Pinto',
    telefono: '74567890',
    ci: '7291024 SC',
    tipo: 'NUEVA',
    cantidadCompras: 0,
    ultimaVisita: '2026-09-26',
    notas: 'Consultó por aros y piercings en tienda física.',
  },
  {
    id: 5,
    nombre: 'Camila Suárez Justiniano',
    telefono: '75678901',
    ci: '5819203 SC',
    tipo: 'HABITUAL',
    cantidadCompras: 12,
    ultimaVisita: '2026-09-18',
    notas: 'Clienta VIP, retira pedidos directo de Central.',
  },
]

export const useClientesStore = defineStore('clientes', () => {
  const cargarInicial = () => {
    try {
      const guardado = localStorage.getItem(CLAVE_CLIENTES)
      return guardado ? JSON.parse(guardado) : CLIENTES_INICIALES
    } catch {
      return CLIENTES_INICIALES
    }
  }

  const clientes = ref(cargarInicial())
  const busqueda = ref('')

  const guardarEnStorage = () => {
    try {
      localStorage.setItem(CLAVE_CLIENTES, JSON.stringify(clientes.value))
    } catch (e) {
      console.error('Error al guardar clientes:', e)
    }
  }

  // Clientes filtrados por nombre, teléfono o CI
  const clientesFiltrados = computed(() => {
    const q = busqueda.value.toLowerCase().trim()
    if (!q) return clientes.value
    return clientes.value.filter(
      (c) =>
        c.nombre.toLowerCase().includes(q) ||
        (c.telefono && c.telefono.includes(q)) ||
        (c.ci && c.ci.toLowerCase().includes(q))
    )
  })

  // Alta de nuevo cliente
  const registrarCliente = (nuevo) => {
    const id = clientes.value.length ? Math.max(...clientes.value.map((c) => c.id)) + 1 : 1
    const nuevoCliente = {
      id,
      nombre: nuevo.nombre.trim(),
      telefono: nuevo.telefono ? nuevo.telefono.trim() : '',
      ci: nuevo.ci ? nuevo.ci.trim() : '',
      tipo: nuevo.tipo || 'NUEVA',
      cantidadCompras: 0,
      ultimaVisita: new Date().toISOString().slice(0, 10),
      notas: nuevo.notas || '',
    }
    clientes.value.unshift(nuevoCliente)
    guardarEnStorage()
    return nuevoCliente
  }

  const obtenerPorId = (id) => {
    return clientes.value.find((c) => c.id === Number(id))
  }

  return {
    clientes,
    busqueda,
    clientesFiltrados,
    registrarCliente,
    obtenerPorId,
  }
})
