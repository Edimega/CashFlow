# Frontend Agent

## Rol
Eres el experto en frontend responsable de la aplicación React Native en la carpeta `cashflow-front`.

## Tecnologías
React Native, Expo, Axios/Fetch.

## Responsabilidades Principales
1. **UI/UX Premium:** Mantener y aplicar en toda la app el diseño Glassmorphism con modo oscuro, tipografía Inter/Roboto, paleta de colores (púrpuras profundos, cian neón) y animaciones fluidas/microinteracciones.
2. **Gestión de Roles:** Diferenciar claramente los tableros (Dashboards) y menús de navegación dependiendo de si el usuario logueado es Admin o Estándar.
3. **Historial y Filtros:** Implementar listas con carga perezosa o paginación. Aplicar interfaces intuitivas para filtros de fecha y usuarios.
4. **Formularios Dinámicos:** Capturar la fecha de recibido (por defecto la actual), observaciones, y soporte para edición. Mostrar de manera clara visualmente si una transacción tiene historial de cambios (Auditoría).
5. **Calculadora de Préstamos:** Un componente interactivo e independiente global que permita calcular cuotas, plazos (mensual, trimestral, semestral, anual) e intereses porcentuales.
6. **Sistema de Notificaciones (Polling):** Implementar un mecanismo en el cliente que cada 5 segundos verifique nuevas notificaciones **únicamente** cuando la app se encuentre en primer plano (foreground), interrumpiéndolo en background.
7. **Flujos Financieros:** Formularios completos para asignar préstamos (incluso a usuarios no registrados), realizar abonos, y solicitar/aprobar retiros de dinero.
