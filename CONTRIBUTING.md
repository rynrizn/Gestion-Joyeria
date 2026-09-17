# Guía de Contribución - Moonstone (Gestión Joyería)

¡Gracias por contribuir al proyecto **Moonstone / Gestión Joyería**! Para asegurar una colaboración fluida, organizada y alineada con la arquitectura establecida, por favor lee las siguientes pautas antes de comenzar a trabajar en el repositorio.

---

## 1. Requisitos Previos y Entorno

- **Node.js**: Versión LTS recomendada (>= 18.x o 20.x).
- **Gestor de Paquetes**: Se utiliza **`pnpm`** de forma exclusiva. Por favor, no uses `npm` ni `yarn` para evitar inconsistencias en el archivo `pnpm-lock.yaml`.
  ```bash
  # Instalar dependencias
  pnpm install

  # Iniciar servidor de desarrollo local
  pnpm dev

  # Construir para producción
  pnpm build

  # Previsualizar compilación local
  pnpm preview
  ```

---

## 2. Variables de Entorno y Seguridad

- **Desarrollo Local**:
  - Copia `.env.example` a `.env`:
    ```bash
    cp .env.example .env
    ```
  - En Vite, todas las variables que deban exponerse en el cliente deben tener el prefijo **`VITE_`** (por ejemplo, `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`).
  - **NUNCA** subas el archivo `.env` ni expongas claves secretas (Service Role Keys) al repositorio. El archivo `.env` está expresamente excluido en `.gitignore`.

- **Despliegue y Producción (Cloudflare Pages)**:
  - En Cloudflare Pages no existe un archivo físico `.env`.
  - Las variables se configuran en el panel de Cloudflare Pages (**Settings** ➔ **Environment variables**).
  - Durante la ejecución de `pnpm build`, Vite toma esas variables del entorno y las inyecta en el cliente compilado.

---

## 3. Normas de Arquitectura y Estilo

### 3.1. Gestión de Iconos con Morphicons
- **Sin dependencias pesadas**: No instales librerías masivas de iconos vía `pnpm` (evita FontAwesome, Heroicons como dependencia npm, etc.).
- **SVGs nativos**: Los iconos animados o estáticos deben descargarse desde [Morphicons](https://www.morphicons.com/) en formato SVG limpio.
- **Ubicación**: Ubica todos los archivos SVG dentro de `src/assets/icons/` y consúmelos directamente como componentes o mediante etiquetas `<img>`.

### 3.2. Estructura de Componentes y Vistas
Respeta la separación de responsabilidades en el directorio `src/`:
- `src/components/admin/`: Componentes exclusivos del panel de administración (formularios de productos, modales de venta, selectores de Cloudinary, tablas de reservas).
- `src/components/catalogo/`: Componentes para la vitrina pública (buscador, filtros de categoría, tarjetas de joyas, modal de reserva).
- `src/components/common/`: Componentes transversales reutilizables (Navbar, Footer, Badges).
- `src/views/`: Vistas completas asociadas a rutas (`CatalogoPublico.vue`, `InventarioView.vue`, etc.).
- `src/stores/`: Estado global con **Pinia** (`auth.js`, `productos.js`).
- `src/supabase/`: Configuración y cliente de Supabase (`client.js`).

### 3.3. Estilo de Código Vue
- Utiliza la sintaxis moderna **Vue 3 SFC con `<script setup>`**.
- Nombres de componentes en **PascalCase** (ej. `JoyaCard.vue`, `ModalReserva.vue`).
- Mantén el código modular, legible y evita lógica acoplada innecesaria.

---

## 4. Flujo de Trabajo con Git

### 4.1. Ramas de Trabajo
Trabaja siempre sobre ramas temáticas basadas en la rama principal (`main` o `develop` según corresponda):
- `feat/<nombre-de-la-funcionalidad>`: Para nuevas características (ej. `feat/catalogo-filtros`).
- `fix/<descripcion-del-arreglo>`: Para resolución de bugs (ej. `fix/reserva-modal-fechas`).
- `docs/<tema>`: Para modificaciones o creación de documentación.
- `refactor/<modulo>`: Para mejoras de código sin cambios de funcionalidad.
- `chore/<tarea>`: Para configuración de herramientas, dependencias o mantenimiento.

### 4.2. Convención de Commits (Conventional Commits)
Redacta mensajes de commit descriptivos y claros siguiendo el estándar:
- `feat: agregar selector de imágenes con Cloudinary`
- `fix: corregir validación de stock al registrar venta mostrador`
- `docs: actualizar instrucciones de despliegue en README`
- `style: mejorar espaciados y tipografía en NavbarApp`
- `refactor: optimizar consulta de productos en store`

---

## 5. Proceso de Pull Requests (PR)

1. Asegúrate de que el proyecto compila localmente sin errores:
   ```bash
   pnpm build
   ```
2. Realiza push a tu rama remota:
   ```bash
   git push origin feat/<nombre-rama>
   ```
3. Abre un **Pull Request** hacia la rama base designada.
4. En la descripción del PR, incluye:
   - Resumen de los cambios implementados.
   - Issue o tarea que resuelve (ej. `Closes #12`).
   - Capturas de pantalla o GIFs si involucra cambios de interfaz gráfica (UI).
5. Espera la revisión y aprobación de al menos un revisor del equipo antes de integrar los cambios.
