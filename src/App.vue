<script setup>
import { onMounted } from 'vue'
import { RouterView } from 'vue-router'
import { isSupabaseConfigured } from './supabase/client'
import { useProductosStore } from './stores/productos'
import { useInventarioStore } from './stores/inventario'
import { useClientesStore } from './stores/clientes'
import { useVentasStore } from './stores/ventas'
import { useReservasStore } from './stores/reservas'

const productosStore = useProductosStore()
const inventarioStore = useInventarioStore()
const clientesStore = useClientesStore()
const ventasStore = useVentasStore()
const reservasStore = useReservasStore()

onMounted(async () => {
  if (isSupabaseConfigured) {
    try {
      await Promise.allSettled([
        productosStore.cargarProductosSupabase(),
        inventarioStore.cargarInventarioSupabase(),
        clientesStore.cargarClientesSupabase(),
        ventasStore.cargarVentasSupabase(),
        reservasStore.cargarReservasSupabase(),
      ])
    } catch (e) {
      console.warn('ℹ️ [Supabase Sync onMounted]:', e)
    }
  }
})
</script>

<template>
  <RouterView />
</template>
