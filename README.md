# Moonstone — Sistema de Gestión y Catálogo para Joyería

Sistema integral y modular desarrollado con **Vue 3**, **Vite** y **Supabase**, diseñado para la administración de inventario, registro de reservas, ventas en mostrador y exhibición de catálogo digital de alta disponibilidad.

El diseño sigue una estética minimalista, profesional y enfocada en la usabilidad, priorizando el rendimiento, la escalabilidad y una experiencia de usuario fluida tanto en dispositivos móviles como en terminales de escritorio.

---

## Características Principales

### 1. Catálogo Público y Reservas
- **Exploración de Productos**: Visualización de piezas disponibles con fichas técnicas detalladas y estados de stock.
- **Buscador y Filtrado Dinámico**: Búsqueda en tiempo real por nombre, código y categorías.
- **Flujo de Reserva**: Interfaz para que clientes seleccionen piezas y soliciten reservas sin intermediarios manuales.

### 2. Panel Administrativo (Back-Office)
- **Gestión de Inventario**: Altas, bajas, modificaciones y control de existencias de piezas de joyería.
- **Integración Multimedia**: Carga y optimización de imágenes alojadas en Cloudinary.
- **Punto de Venta / Venta en Mostrador**: Registro ágil de ventas físicas directas y cierre de operaciones.
- **Tablero de Reservas**: Control de estado de reservas activas, pendientes, entregadas o canceladas.
- **Métricas y Reportes**: Visualización de balance de ventas y rotación de stock.

### 3. Arquitectura y Rendimiento
- **Gestión de Estado Centralizada**: Implementación con Pinia para sesiones, productos y reservas.
- **Backend as a Service (BaaS)**: Supabase provee autenticación segura, persistencia relacional en PostgreSQL y suscripciones en tiempo real.
- **Iconografía Liviana**: Integración nativa de SVG mediante Morphicons sin librerías dependientes en `node_modules`.
- **Despliegue Continuo**: Preparado para compilación estática y distribución global en Cloudflare Pages.

---

## Stack Tecnológico

| Capa | Tecnología | Propósito |
| :--- | :--- | :--- |
| **Framework UI** | [Vue 3](https://vuejs.org/) (Composition API, `<script setup>`) | Construcción reactiva de interfaces y componentes |
| **Bundler / Tooling** | [Vite](https://vitejs.dev/) | Entorno de compilación ultra-rápido y HMR |
| **Enrutamiento** | [Vue Router](https://router.vuejs.org/) | Gestión de rutas públicas y protegidas |
| **Gestión de Estado** | [Pinia](https://pinia.vuejs.org/) | Almacenamiento y reactividad global de datos |
| **Backend & Base de Datos** | [Supabase](https://supabase.com/) | Autenticación, base de datos PostgreSQL y políticas RLS |
| **Gestión Multimedia** | [Cloudinary](https://cloudinary.com/) | Optimización y entrega de imágenes en CDN |
| **Iconografía** | [Morphicons](https://www.morphicons.com/) | Iconos SVG nativos y animaciones livianas |
| **Despliegue** | [Cloudflare Pages](https://pages.cloudflare.com/) | CDN global y CI/CD automatizado |

---

## Estructura del Proyecto

```text
Gestion-Joyeria/
├── .env.example                         # Plantilla documentada de variables de entorno
├── .gitignore                           # Exclusiones de Git (seguridad y compilación)
├── CONTRIBUTING.md                      # Guía de estilo, ramas y flujo de contribución
├── README.md                            # Documentación general del proyecto
├── index.html                           # Punto de entrada HTML
├── package.json                         # Dependencias y scripts
├── pnpm-lock.yaml                       # Bloqueo de versiones reproducible
├── vite.config.js                       # Configuración de compilación Vite
└── src/
    ├── assets/
    │   ├── icons/                       # Archivos SVG nativos (Morphicons)
    │   └── styles/
    │       └── main.css                 # Estilos globales y variables de diseño
    ├── components/
    │   ├── admin/                       # Componentes del módulo de administración
    │   │   ├── FormProducto.vue
    │   │   ├── ModalCerrarVenta.vue
    │   │   ├── ModalVentaMostrador.vue
    │   │   ├── SelectorCloudinary.vue
    │   │   └── TablaReservas.vue
    │   ├── catalogo/                    # Componentes del módulo de catálogo público
    │   │   ├── Buscador.vue
    │   │   ├── FiltrosCategoria.vue
    │   │   ├── JoyaCard.vue
    │   │   └── ModalReserva.vue
    │   └── common/                      # Componentes transversales reutilizables
    │       ├── BadgeEstado.vue
    │       ├── FooterApp.vue
    │       └── NavbarApp.vue
    ├── router/
    │   └── index.js                     # Configuración de rutas y guards de navegación
    ├── stores/
    │   ├── auth.js                      # Store de autenticación y sesión
    │   └── productos.js                 # Store de productos y catálogo
    ├── supabase/
    │   └── client.js                    # Inicialización del cliente Supabase
    ├── views/                           # Vistas completas de la aplicación
    │   ├── CatalogoPublico.vue
    │   ├── InventarioView.vue
    │   ├── LoginView.vue
    │   ├── ReportesView.vue
    │   └── ReservasDashboard.vue
    ├── App.vue                          # Componente raíz
    └── main.js                          # Bootstrap de la aplicación Vue
```

---

## Inicio Rápido

### Requisitos Previos

- **Node.js** v18.0 o superior
- **pnpm** v8.0 o superior (`npm install -g pnpm`)

### Instalación y Ejecución

1. **Clonar el repositorio e ingresar al directorio:**
   ```bash
   git clone <URL_DEL_REPOSITORIO>
   cd Gestion-Joyeria
   ```

2. **Instalar dependencias con pnpm:**
   ```bash
   pnpm install
   ```

3. **Configurar variables de entorno:**
   Copia la plantilla `.env.example` y renómbrala a `.env`:
   ```bash
   cp .env.example .env
   ```
   Define los valores correspondientes a tu proyecto de Supabase y Cloudinary:
   ```env
   VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
   VITE_SUPABASE_ANON_KEY=tu-anon-key-publica
   VITE_CLOUDINARY_CLOUD_NAME=tu_cloud_name
   VITE_CLOUDINARY_UPLOAD_PRESET=tu_upload_preset
   ```

4. **Iniciar el servidor de desarrollo:**
   ```bash
   pnpm dev
   ```

5. **Construir para producción:**
   ```bash
   pnpm build
   ```

6. **Previsualizar la compilación de producción:**
   ```bash
   pnpm preview
   ```

---

## Despliegue en Cloudflare Pages

1. Vincula el repositorio de Git en el panel de **Cloudflare Pages**.
2. Parámetros de compilación:
   - **Framework preset**: `Vite`
   - **Build command**: `pnpm build`
   - **Build output directory**: `dist`
3. En **Settings** ➔ **Environment variables**, agrega `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, y demás credenciales públicas requeridas por la aplicación en tiempo de ejecución.

---

## Contribución

Consulta la guía detallada en [CONTRIBUTING.md](./CONTRIBUTING.md) para conocer las directrices de código, convención de ramas (`feat/`, `fix/`, `chore/`) y el formato de mensajes de confirmación (Conventional Commits).

---

## Licencia

Distribuido bajo la Licencia MIT. Consulta el archivo [LICENSE](./LICENSE) para más información.
