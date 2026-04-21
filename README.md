# Style Store - Ecommerce Template

A modern, full-featured e-commerce platform for fashion and clothing. Built with React and Spring Boot. This is a generic template that can be customized for any online clothing store.

## Features

- **Product Catalog** - Browse, search, and filter clothing products
- **Shopping Cart** - Persistent cart with quantity management
- **User Authentication** - Register, login, JWT-based auth
- **Checkout** - Complete purchase flow
- **Role-Based Access** - Customer, Inventory, Moderator, Admin dashboards
- **Support System** - Chatbot with ticket escalation
- **Performance Optimized** - Lighthouse score 80%+

## Stack

### Frontend
- **React 19** + Vite
- **Tailwind CSS 4**
- **React Router**
- **Lucide React**

### Backend
- **Spring Boot 3.3** (Java 17)
- **Spring Security** + JWT
- **Spring Data JPA** + Hibernate
- **PostgreSQL** (or H2 for development)

## Quick Start

### Prerequisites
- Node.js 20+
- Java 17+
- Maven 3.9+
- PostgreSQL 15+ (optional - H2 used for development)

### Backend

```bash
cd backend
mvn spring-boot:run -Dspring-boot.run.profiles=dev
```

Backend will be available at: `http://localhost:8080`

**Default admin user:**
- Email: `admin@template.com`
- Password: `admin123`

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend will be available at: `http://localhost:5173`

## Customization

To use this template for your own fashion store:

1. **Branding**: Replace logo in `frontend/public/logo.png` and `frontend/public/favicon.svg`
2. **Products**: Update product images in `frontend/public/images/products/` and update DataInitializer.java
3. **Colors**: Modify `tailwind.config.js` with your brand colors
4. **Content**: Update text in components (Navbar, Footer, Landing, etc.)
5. **API URL**: Change `API_URL` in `frontend/src/services/api.js`

## Deployment

### Railway

1. Create projects for frontend and backend
2. Connect to GitHub repository
3. Add PostgreSQL plugin to backend
4. Configure environment variables
5. Deploy

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Current user

### Products (public)
- `GET /api/products` - List all
- `GET /api/products/{id}` - By ID
- `GET /api/products/category/{name}` - By category

### Orders (requires auth)
- `POST /api/orders` - Create order
- `GET /api/orders` - My orders
- `GET /api/orders/all` - All (admin)

### Admin (requires ADMIN role)
- `GET /api/admin/products` - List products
- `POST /api/admin/products` - Create product
- `PUT /api/admin/products/{id}` - Update
- `DELETE /api/admin/products/{id}` - Delete

## Security

- Passwords encrypted with BCrypt
- JWT tokens with 24h expiration
- Roles: CUSTOMER, INVENTORY, MODERATOR, ADMIN
- CORS configured for specific origins

## License

© 2024 Style Store Template. All rights reserved.
