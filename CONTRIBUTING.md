# Guía de Contribución al Código

¡Gracias por colaborar en el desarrollo de **Moonstone**! Esta guía contiene exclusivamente las indicaciones técnicas necesarias para preparar tu entorno local, trabajar en el código y enviar cambios siguiendo los estándares de arquitectura y calidad del proyecto.

---

## 1. Requisitos Previos

- **Node.js**: Versión LTS (>= 18.x o 20.x).
- **Gestor de Paquetes**: **`pnpm`** (versión >= 8.x). Se utiliza exclusivamente `pnpm` para evitar inconsistencias en el archivo `pnpm-lock.yaml`.

---

## 2. Configuración del Entorno Local

1. **Instalar dependencias del proyecto:**
   ```bash
   pnpm install
   ```

2. **Configurar variables locales:**
   Copia el archivo de plantilla `.env.example` y renómbralo a `.env`:
   ```bash
   cp .env.example .env
   ```
   Define los valores de conexión a tu base de datos de desarrollo:
   ```env
   VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
   VITE_SUPABASE_PUBLISHABLE_KEY=tu-clave-publica
   ```

3. **Iniciar el servidor de desarrollo:**
   ```bash
   pnpm dev
   ```

4. **Verificar compilación local:**
   ```bash
   pnpm build
   ```

---

## 3. Estructura de Capas y Código

El proyecto sigue una arquitectura en capas reflejada en la distribución del directorio `src/`:

```text
src/
├── assets/                  # Estilos globales (global.css) y recursos
├── components/              # Capa de presentación (componentes reutilizables)
│   ├── admin/               # Módulos del panel (inventario, POS, reportes, clientes)
│   ├── catalogo/            # Módulos de la vitrina pública (tarjetas, buscador, filtros)
│   └── common/              # Componentes base (botones, modales, badges, inputs)
├── router/                  # Definición de rutas y navegación
├── stores/                  # Capa de negocio y estado global (Pinia)
│   ├── auth.js              # Sesión y roles de usuarias
│   ├── clientes.js          # Gestión y fidelización de clientas
│   ├── inventario.js        # Existencias por sede y traslados
│   ├── productos.js         # Catálogo público y piezas
│   ├── reservas.js          # Control de pedidos y reservas
│   └── ventas.js            # Registro de ventas en mostrador
├── supabase/                # Cliente y conectores de Supabase
└── views/                   # Vistas principales de la aplicación
```

---

## 4. Estándares y Convenciones de Código

- **Vue 3 SFC:** Todo componente debe utilizar la sintaxis `<script setup>` y Composition API.
- **Nomenclatura:**
  - Componentes en **PascalCase** (ej. `TarjetaJoya.vue`, `TablaInventario.vue`).
  - Stores en **camelCase** dentro de `src/stores/`.
- **Separación de Responsabilidades:**
  - La lógica de negocio, cálculos de stock y mutaciones de datos deben residir en los **stores de Pinia**.
  - Los componentes de la interfaz de usuario deben limitarse a presentar datos y emitir eventos.
- **Estilos:** Emplea CSS scoped en cada componente y reutiliza las variables CSS de diseño definidas en `src/assets/styles/global.css`.

---

## 5. Flujo de Trabajo con Git

### 5.1. Ramas de Trabajo
Trabaja siempre sobre ramas temáticas creadas a partir de la rama principal `main`:
- `feat/<nombre>`: Para nuevas funcionalidades (ej. `feat/filtro-material`).
- `fix/<nombre>`: Para corrección de errores (ej. `fix/calculo-vuelto-pos`).
- `refactor/<nombre>`: Para optimizaciones sin cambio funcional.
- `chore/<nombre>`: Para mantenimiento o actualización de dependencias.

### 5.2. Convención de Mensajes de Commit
Aplica el estándar de **Conventional Commits**:
- `feat: agregar buscador por código en inventario`
- `fix: corregir validación de existencias al vender desde tienda`
- `refactor: modularizar funciones del store de ventas`
- `style: ajustar espaciados en la tabla de reportes`

---

## 6. Proceso de Envío (Pull Request)

1. **Compilación obligatoria sin errores:**
   Antes de hacer commit o abrir un PR, confirma que el proyecto compile limpiamente:
   ```bash
   pnpm build
   ```
2. **Subir tu rama al repositorio remoto:**
   ```bash
   git push origin feat/<nombre-rama>
   ```
3. **Crear el Pull Request:**
   - Describe con claridad el propósito del cambio y los archivos modificados.
   - Adjunta capturas o demostración visual si modificaste la interfaz gráfica.
   - Espera la revisión y aprobación antes de fusionar los cambios.
