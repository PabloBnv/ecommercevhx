# Ecommerce Genérico

Tienda online genérica para productos andinos/peruanos.

## Estructura del Proyecto

```
ecommerce-generico/
├── frontend/              # Aplicación React + Vite + Tailwind
│   ├── src/
│   │   ├── components/   # Componentes reutilizables
│   │   ├── pages/        # Páginas de la aplicación
│   │   ├── context/     # Contextos React (Auth, Cart, Wishlist)
│   │   ├── services/    # API Service con mocks
│   │   └── data/        # Datos mock locales
│   ├── public/          # Archivos estáticos
│   └── dist/            # Build de producción
```

## Scripts Disponibles

```bash
cd frontend

# Development
npm run dev          # Servidor de desarrollo (puerto 5173)

# Build
npm run build         # Build de producción
npm run preview       # Preview del build

# Testing
npm run test          # Tests unitarios (Vitest)
npm run test:run     # Tests sin watch

# E2E (opcional)
npm run cypress:open # Abrir Cypress
```

## Funcionalidades

- Catálogo de productos con categorías
- Carrito de compras
- Wishlist/Listas de deseos
- Checkout simulado
- Sistema de-auth con roles (Admin, Moderator, Customer)
- Dashboards para Admin, Moderator y Cliente
- Página de contacto
- Chat de soporte (mock)
- Búsqueda de productos
- Reseñas y ratings

## Usuarios de Prueba

| Email | Contraseña | Rol |
|-------|-----------|-----|
| admin@test.com | admin123 | ADMIN |
| moderator@test.com | moderator123 | MODERATOR |
| customer@test.com | customer123 | CUSTOMER |

## Deployment en Netlify

1. Conectar repositorio a Netlify
2. Build command: `cd frontend && npm run build`
3. Publish directory: `frontend/dist`
4. Redirecciones: `/* /index.html 200`

## Tecnologías

- React 19
- Vite 8
- Tailwind CSS 4
- React Router DOM 7
- Lucide React (iconos)
- Vitest (tests unitarios)
- Cypress (tests E2E)