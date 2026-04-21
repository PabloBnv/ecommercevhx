import React, { useState, Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { WishlistProvider } from './context/WishlistContext';
import { ThemeProvider } from './context/ThemeContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProductGrid from './components/ProductGrid';
import FeaturedProducts from './components/FeaturedProducts';

const CartModal = lazy(() => import('./components/CartModal'));
const AuthPage = lazy(() => import('./pages/AuthPage'));
const CheckoutPage = lazy(() => import('./pages/CheckoutPage'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const InventoryDashboard = lazy(() => import('./pages/InventoryDashboard'));
const ModeratorDashboard = lazy(() => import('./pages/ModeratorDashboard'));
const CustomerDashboard = lazy(() => import('./pages/CustomerDashboard'));
const WishlistPage = lazy(() => import('./pages/WishlistPage'));
const ProductDetailPage = lazy(() => import('./pages/ProductDetailPage'));
const OrderTrackingPage = lazy(() => import('./pages/OrderTrackingPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const SupportChat = lazy(() => import('./components/SupportChat'));
const ContactPage = lazy(() => import('./pages/ContactPage'));

const PageFallback = () => (
  <div className="flex items-center justify-center py-32">
    <div className="animate-spin rounded-full h-10 w-10 border-4" style={{ borderColor: 'var(--theme-accent)', borderTopColor: 'transparent' }}></div>
  </div>
);

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div>Cargando...</div>;
  if (!user) return <Navigate to="/auth" />;
  return children;
};

const AnnouncementBar = () => (
  <div 
    className="py-2 text-center text-sm font-medium"
    style={{ 
      backgroundColor: 'var(--theme-accent)', 
      color: 'var(--theme-button-text)' 
    }}
  >
    🚚 Envío gratis en pedidos + $50 | 🎉 Nueva colección 2026 disponible
  </div>
);

const HeroSection = () => (
  <div 
    className="relative py-16 md:py-24 px-4"
    style={{ 
      backgroundColor: 'var(--theme-bg-secondary)',
      backgroundImage: 'linear-gradient(135deg, var(--theme-accent) 0%, transparent 100%)',
      backgroundSize: '200% 200%',
      animation: 'shimmer 8s ease infinite'
    }}
  >
    <div className="max-w-7xl mx-auto text-center">
      <span 
        className="inline-block px-4 py-1 rounded-full text-xs font-semibold uppercase tracking-wider mb-4"
        style={{ 
          backgroundColor: 'var(--theme-accent)', 
          color: 'var(--theme-button-text)' 
        }}
      >
        Nueva Temporada
      </span>
      <h1 
        className="text-4xl md:text-6xl font-bold mb-4 tracking-tight"
        style={{ 
          color: 'var(--theme-text)', 
          fontFamily: 'var(--theme-font-display)' 
        }}
      >
        Descubre Tu Estilo
      </h1>
      <p 
        className="text-lg md:text-xl max-w-2xl mx-auto mb-8"
        style={{ color: 'var(--theme-text-secondary)' }}
      >
        Las últimas tendencias en moda urbana y zapatillas. 
        Calidad premium, precios accesibles.
      </p>
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <a 
          href="#productos"
          className="btn-primary text-lg px-8 py-4"
        >
          Ver Colección
        </a>
        <a 
          href="#categorias"
          className="btn-secondary text-lg px-8 py-4"
        >
          Explorar Categorías
        </a>
      </div>
    </div>
  </div>
);

const CategoriesSection = () => (
  <div id="categorias" className="max-w-7xl mx-auto px-4 py-16">
    <h2 className="text-2xl md:text-3xl font-bold text-center mb-10" style={{ color: 'var(--theme-text)' }}>
      Categorías
    </h2>
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
      {[
        { name: 'Zapatillas', icon: '👟', emoji: '👟' },
        { name: 'Streetwear', icon: '👕', emoji: '👕' },
        { name: 'Deportivo', icon: '⚽', emoji: '⚽' },
        { name: 'Formal', icon: '👔', emoji: '👔' },
        { name: 'Accesorios', icon: '🧢', emoji: '🧢' },
      ].map((cat) => (
        <a
          key={cat.name}
          href={`/?category=${cat.name.toLowerCase()}`}
          className="card-hover p-6 text-center rounded-xl"
          style={{ 
            backgroundColor: 'var(--theme-card)',
            border: '1px solid var(--theme-border)'
          }}
        >
          <div className="text-4xl mb-2">{cat.emoji}</div>
          <div className="font-medium" style={{ color: 'var(--theme-text)' }}>{cat.name}</div>
        </a>
      ))}
    </div>
  </div>
);

const FeaturesSection = () => (
  <div className="py-12" style={{ backgroundColor: 'var(--theme-bg-secondary)' }}>
    <div className="max-w-7xl mx-auto px-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
        {[
          { icon: '📦', title: 'Envío Gratis', desc: 'En pedidos + $50' },
          { icon: '🔄', title: 'Devolución', desc: '30 días' },
          { icon: '💬', title: 'Soporte', desc: '24/7 chat' },
          { icon: '✨', title: 'Calidad Premium', desc: 'Productos seleccionados' },
        ].map((feature, idx) => (
          <div key={idx} className="text-center">
            <div className="text-3xl mb-2">{feature.icon}</div>
            <div className="font-semibold" style={{ color: 'var(--theme-text)' }}>{feature.title}</div>
            <div className="text-sm" style={{ color: 'var(--theme-text-secondary)' }}>{feature.desc}</div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const AppContent = () => {
  const [isCartOpen, setIsCartOpen] = useState(false);

  return (
    <>
      <AnnouncementBar />
      <Navbar onCartClick={() => setIsCartOpen(true)} />
      <main className="flex-grow">
        <Suspense fallback={<PageFallback />}>
          <Routes>
            <Route path="/" element={
              <>
                <HeroSection />
                <CategoriesSection />
                <div id="productos" className="max-w-7xl mx-auto px-4 py-12">
                  <div className="mb-8">
                    <h2 className="text-2xl md:text-3xl font-bold" style={{ color: 'var(--theme-text)' }}>
                      Productos Destacados
                    </h2>
                    <p style={{ color: 'var(--theme-text-secondary)' }}>
                      Los favoritos de nossos clientes
                    </p>
                  </div>
                  <FeaturedProducts />
                </div>
                <div className="max-w-7xl mx-auto px-4 py-12">
                  <h2 className="text-2xl md:text-3xl font-bold mb-8" style={{ color: 'var(--theme-text)' }}>
                    Catálogo Completo
                  </h2>
                  <ProductGrid />
                </div>
                <FeaturesSection />
              </>
            } />
            <Route path="/contacto" element={<ContactPage />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/favoritos" element={<WishlistPage />} />
            <Route path="/product/:id" element={<ProductDetailPage />} />
            <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
            <Route path="/dashboard" element={<ProtectedRoute><CustomerDashboard /></ProtectedRoute>} />
            <Route path="/pedidos" element={<ProtectedRoute><CustomerDashboard /></ProtectedRoute>} />
            <Route path="/order/:id" element={<OrderTrackingPage />} />
            <Route path="/checkout" element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />
            <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
            <Route path="/seller" element={<ProtectedRoute><InventoryDashboard /></ProtectedRoute>} />
            <Route path="/moderator" element={<ProtectedRoute><ModeratorDashboard /></ProtectedRoute>} />
            <Route path="/support" element={<ProtectedRoute><SupportChat /></ProtectedRoute>} />
          </Routes>
        </Suspense>
      </main>
      <Footer />
      <CartModal isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  );
};

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <CartProvider>
            <WishlistProvider>
              <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--theme-bg)' }}>
                <AppContent />
              </div>
            </WishlistProvider>
          </CartProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;