# STORE - Ecommerce Genérico de Ropa y Zapatillas

Ecommerce moderno con selector de temas y sistema de usuarios.

## Características

### 🌈 5 Temas Visuales
- **Minimal**: Blanco/negro, profesional
- **Urban Dark**: Negro/neón, moderno
- **Vintage**: Sepia/cream, nostálgico
- **Sport**: Verde/naranja, deportivo
- **Premium**: Negro/dorado, lujo

### 🎬 Homepage Profesional
- Video de fondo (stock gratuito)
- Banner promocional animado
- Categorías visuales
- Productos destacados
- Features con iconos

### 🛒 Catálogo
- 12 productos con imágenes funcionales (pics.photos)
- Zapatillas, streetwear, deportivo, formal, accessories
- Badges: NEW, SALE, HOT, BEST SELLER

### 👤 Sistema de Usuarios
| Email | Password | Rol |
|-------|----------|-----|
| customer@test.com | customer123 | CUSTOMER |
| admin@test.com | admin123 | ADMIN |
| moderator@test.com | moderator123 | MODERATOR |
| inventory@test.com | inventory123 | INVENTORY |

## Tech Stack
- React 19 + Vite 8
- Tailwind CSS 4
- React Router DOM 7
- Lucide Icons
- pics.photos (imágenes)

## Deploy Netlify
```
Build: npm run build
Publish: dist/
Redirect: /* /index.html 200
```

## Demo
El sitio muestra credenciales de prueba directamente en la página de login.