<script setup>
import { CONFIG_NEGOCIO } from '../../config/negocio'
import IconoLucide from './IconoLucide.vue'
</script>

<template>
  <footer class="footer-catalogo">
    <div class="contenedor contenido-footer">
      <!-- Columna 1: Marca y Propuesta -->
      <div class="bloque-marca">
        <h3 class="nombre-marca">MOONSTONE</h3>
        <p class="tagline-marca">Joyería fina en Acero 316L, piercings y accesorios en tendencia.</p>
        <div class="badge-autor">
          <IconoLucide nombre="Sparkles" :tamano="14" />
          <span>Diseño Exclusivo</span>
        </div>
      </div>

      <!-- Columna 2: Ubicación física y Google Maps -->
      <div class="bloque-ubicacion">
        <h4 class="titulo-seccion-footer">
          <IconoLucide nombre="MapPin" :tamano="16" />
          <span>Punto de Venta Físico</span>
        </h4>
        <p class="texto-direccion">{{ CONFIG_NEGOCIO.ubicacionTexto }}</p>
        
        <!-- Enlace a Google Maps (Configurable en src/config/negocio.js) -->
        <a
          :href="CONFIG_NEGOCIO.googleMapsUrl"
          target="_blank"
          rel="noopener noreferrer"
          class="enlace-mapa"
          title="Ver ubicación en Google Maps"
        >
          <IconoLucide nombre="ExternalLink" :tamano="14" />
          <span>Abrir en Google Maps</span>
        </a>
      </div>

      <!-- Columna 3: Atención y Redes Sociales -->
      <div class="bloque-contacto">
        <h4 class="titulo-seccion-footer">
          <IconoLucide nombre="MessageCircle" :tamano="16" />
          <span>Contacto & Pedidos</span>
        </h4>
        <p class="texto-atencion">Coordina apartados o síguenos en redes oficiales:</p>
        
        <div class="botones-contacto-footer">
          <a
            :href="`https://wa.me/${CONFIG_NEGOCIO.whatsappNumero}`"
            target="_blank"
            rel="noopener noreferrer"
            class="boton-whatsapp-footer"
            title="Escribir al WhatsApp oficial"
          >
            <IconoLucide nombre="MessageCircle" :tamano="16" />
            <span>WhatsApp: {{ CONFIG_NEGOCIO.whatsappDisplay }}</span>
          </a>

          <a
            :href="CONFIG_NEGOCIO.instagramUrl"
            target="_blank"
            rel="noopener noreferrer"
            class="boton-instagram-footer"
            title="Visitar Instagram oficial de Moonstone"
          >
            <IconoLucide nombre="Instagram" :tamano="16" />
            <span>Instagram: {{ CONFIG_NEGOCIO.instagramDisplay }}</span>
          </a>
        </div>
      </div>
    </div>

    <div class="barra-derechos">
      <div class="contenedor fila-derechos">
        <span>&copy; {{ new Date().getFullYear() }} Moonstone Joyería &bull; Todos los derechos reservados.</span>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.footer-catalogo {
  background-color: var(--color-blanco);
  border-top: 1px solid var(--color-neutral-200);
  margin-top: auto;
  color: var(--color-neutral-900);
  font-size: var(--tamano-cuerpo);
}

.contenido-footer {
  display: grid;
  grid-template-columns: 1fr;
  gap: 28px;
  padding-top: 40px;
  padding-bottom: 32px;
}

@media (min-width: 640px) {
  .contenido-footer {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1024px) {
  .contenido-footer {
    grid-template-columns: 1.3fr 1.1fr 1.1fr;
    gap: 40px;
  }
}

.bloque-marca {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.nombre-marca {
  font-size: 20px;
  font-weight: 800;
  letter-spacing: 0.12em;
  color: var(--color-primario);
}

.tagline-marca {
  font-size: 13px;
  color: var(--color-neutral-600);
  line-height: 1.5;
  max-width: 320px;
}

.badge-autor {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  width: fit-content;
  margin-top: 4px;
  padding: 4px 10px;
  border-radius: var(--radio-completo);
  background-color: var(--color-primario-fondo);
  color: var(--color-primario);
  font-size: 11px;
  font-weight: 700;
  border: 1px solid rgba(62, 18, 24, 0.15);
}

.titulo-seccion-footer {
  font-size: 14px;
  font-weight: 700;
  color: var(--color-primario);
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.texto-direccion {
  font-size: 13px;
  color: var(--color-neutral-900);
  font-weight: 600;
  line-height: 1.4;
  margin-bottom: 10px;
}

.enlace-mapa {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 600;
  color: var(--color-primario);
  text-decoration: underline;
  text-underline-offset: 3px;
  transition: opacity var(--transicion-rapida);
}

.enlace-mapa:hover {
  opacity: 0.8;
}

.bloque-contacto {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.texto-atencion {
  font-size: 13px;
  color: var(--color-neutral-600);
  margin-bottom: 4px;
}

.botones-contacto-footer {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 4px;
}

.boton-whatsapp-footer {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 14px;
  background-color: var(--color-whatsapp, #25D366);
  color: #ffffff;
  border-radius: var(--radio-md);
  font-size: 13px;
  font-weight: 700;
  width: fit-content;
  box-shadow: var(--sombra-sutil);
  transition: transform var(--transicion-rapida), opacity var(--transicion-rapida);
}

.boton-whatsapp-footer:hover {
  opacity: 0.95;
  transform: translateY(-1px);
}

.boton-instagram-footer {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 14px;
  background: linear-gradient(135deg, #833ab4, #fd1d1d, #fcb045);
  color: #ffffff;
  border-radius: var(--radio-md);
  font-size: 13px;
  font-weight: 700;
  width: fit-content;
  box-shadow: var(--sombra-sutil);
  transition: transform var(--transicion-rapida), opacity var(--transicion-rapida);
}

.boton-instagram-footer:hover {
  opacity: 0.95;
  transform: translateY(-1px);
}

.barra-derechos {
  border-top: 1px solid var(--color-neutral-200);
  background-color: var(--color-neutral-50);
  padding: 14px 0;
  font-size: 12px;
  color: var(--color-neutral-600);
}

.fila-derechos {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 8px;
}

.ubicacion-mini {
  font-weight: 500;
}
</style>
