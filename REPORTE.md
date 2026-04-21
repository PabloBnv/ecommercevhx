# Ecommercevhx - Ecommerce Genérico de Ropa y Zapatillas

Tienda online genérica con sistema de temas configurables y gestión de usuarios.

## Estructura

```
ecommercevhx/
├── src/
│   ├── components/        # Componentes React
│   ├── pages/           # Páginas (rutas)
│   ├── context/        # AuthContext, CartContext, ThemeContext
│   ├── services/      # API service con mocks
│   └── data/         # mockData.js (productos, usuarios)
├── dist/             # Build de producción
└── REPORTE.md
```

## Scripts

```bash
npm run dev         # Desarrollo (5173)
npm run build      # Production build
npm run preview   # Preview build
npm run test     # Tests unitarios
```

## Funcionalidades

### Sistema de Temas (5)
- **Minimal**: Blanco/negro, profesional
- **Urban Dark**: Negro/neón, moderno
- **Vintage**: Sepia/cream, nostálgico
- **Sport**: Verde/naranja, deportivo
- **Premium**: Negro/dorado, lujo

### Productos
- 12 productos con imágenes Unsplash
- Zapatillas, streetwear, deportivo, formal, accessories
- Badges: NEW, SALE, HOT, BEST SELLER

### Usuarios y Roles
| Email | Password | Rol |
|-------|----------|-----|
| admin@test.com | admin123 | ADMIN |
| customer@test.com | customer123 | CUSTOMER |
| moderator@test.com | moderator123 | MODERATOR |
| inventory@test.com | inventory123 | INVENTORY |

### Dashboards
- **Admin**: Gestión usuarios, productos, pedidos
- **Customer**: Perfil, pedidos, wishlist, direcciones
- **Moderator**: Moderación contenido
- **Inventory**: Gestión inventario

## Deployment Netlify

1. Build: `npm run build`
2. Publish: `dist/`
3. Redirect: `/* /index.html 200`

## Tecnologías

- React 19 + Vite 8
- Tailwind CSS 4
- React Router DOM 7
- Lucide React Icons