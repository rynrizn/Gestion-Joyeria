# Moonstone — Gestor de Inventario para Joyería

Sistema integral de gestión de inventario y punto de venta diseñado para **Moonstone Joyería**, optimizado para el control de existencias multisede, registro de ventas físicas en mostrador y exhibición de catálogo digital para clientas.

El proyecto está diseñado bajo una **arquitectura en capas**, separando la presentación visual, la lógica de negocio reactiva y la persistencia de datos relacional para garantizar consistencia transaccional, modularidad y escalabilidad.

---

## Resumen del Sistema

- **Control de Inventario Multisede:** Administración detallada de existencias desglosadas entre almacén Central (dueña) y tienda física (Mercadito Creativo), con alertas automáticas de stock bajo y traslados seguros entre sedes.
- **Punto de Venta (POS):** Registro de ventas en mostrador con selección inteligente del origen de stock (Central, Tienda o Ambos), soporte para pagos en efectivo, QR o híbridos (combinados), y cálculo automático de descuentos.
- **Catálogo Digital Público:** Vitrina virtual moderna para clientas con filtros por categorías, buscador en tiempo real, fichas técnicas y enlace directo a WhatsApp e Instagram oficial.
- **Gestión de Clientas y Fidelidad:** Registro de clientas, historial acumulado de compras y clasificación automática de fidelidad (Nueva o Habitual).
- **Tablero de Pedidos y Reservas:** Seguimiento de piezas reservadas con contador de vencimiento horario y verificación de disponibilidad física por sede.
- **Reportes Analíticos:** Resumen de balance de ingresos, desglose por métodos de pago y métricas de desempeño por vendedora y turno.

---

## Arquitectura

El sistema implementa una **Arquitectura en Capas**:
1. **Capa de Presentación:** Componentes desacoplados en Vue 3 organizados por módulos funcionales (`admin`, `catalogo`, `common`) y vistas completas.
2. **Capa de Negocio y Estado:** Stores modulares con Pinia que centralizan reglas de negocio, validaciones y reactividad global.
3. **Capa de Persistencia y Datos:** Base de datos relacional PostgreSQL con vistas optimizadas, procedimientos almacenados (RPC) para transacciones atómicas y políticas RLS (Row Level Security).

---

## Stack Tecnológico

| Tecnología | Justificación de Elección |
| :--- | :--- |
| **[Vue 3](https://vuejs.org/)** | Reactividad nativa de alto rendimiento, modularidad y legibilidad con Composition API (`<script setup>`). |
| **[Vite](https://vitejs.dev/)** | Entorno de desarrollo ultra-rápido, arranque inmediato y compilación optimizada para producción. |
| **[Pinia](https://pinia.vuejs.org/)** | Gestión de estado predecible, tipada y modular sin la complejidad innecesaria de librerías tradicionales. |
| **[Vue Router](https://router.vuejs.org/)** | Enrutamiento SPA fluido con guards de navegación para proteger las áreas administrativas. |
| **[Supabase (PostgreSQL)](https://supabase.com/)** | Persistencia relacional robusta con cumplimiento ACID, transacciones atómicas mediante RPC y seguridad RLS. |
| **[Chart.js](https://www.chartjs.org/)** | Renderizado ligero y dinámico de métricas para reportes y balances sin penalizar la velocidad de carga. |
| **[Lucide Icons](https://lucide.dev/)** | Iconografía SVG consistente, accesible y de bajo impacto visual en la aplicación. |

---

## Contribución

Si deseas colaborar en el desarrollo de la aplicación, consulta las directrices de código, estructura de carpetas y flujo de trabajo en [CONTRIBUTING.md](./CONTRIBUTING.md).

---

## Licencia

Distribuido bajo la Licencia MIT. Consulta [LICENSE](./LICENSE) para más información.
