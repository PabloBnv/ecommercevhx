import React, { useState, Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { WishlistProvider } from './context/WishlistContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProductGrid from './components/ProductGrid';
import FeaturedProducts from './components/FeaturedProducts';
import { heroVideo, promoBanners } from './data/mockData';

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

const AnnouncementBar = () => {
  const { theme } = useTheme();
  const [currentIdx, setCurrentIdx] = useState(0);
  
  return (
    <div 
      className="py-3 text-center text-sm font-semibold transition-all"
      style={{ 
        backgroundColor: theme.colors.accent, 
        color: theme.colors.buttonText 
      }}
    >
      <span className="animate-pulse">{promoBanners[currentIdx].text}</span>
    </div>
  );
};

const HeroSection = () => {
  const { theme } = useTheme();
  
  return (
    <div className="relative min-h-[70vh] flex items-center justify-center overflow-hidden">
      <video
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
        poster="https://picsum.photos/seed/fashion-hero/1920/1080"
      >
        <source src={heroVideo} type="video/mp4" />
      </video>
      
      <div 
        className="absolute inset-0"
        style={{
          background: `linear-gradient(180deg, ${theme.colors.bg}cc 0%, ${theme.colors.bg}80 50%, ${theme.colors.bg}ee 100%)`,
        }}
      />
      
      <div className="relative z-10 max-w-6xl mx-auto px-4 text-center">
        <div className="inline-block px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-4 animate-bounce" style={{ backgroundColor: theme.colors.accent, color: theme.colors.buttonText }}>
          Nueva Temporada
        </div>
        
        <h1 
          className="text-5xl md:text-7xl lg:text-8xl font-black mb-4 tracking-tighter"
          style={{ 
            color: theme.colors.text,
            fontFamily: theme.fonts.display,
            textShadow: `0 0 60px ${theme.colors.accent}40`,
          }}
        >
          STORE
        </h1>
        
        <p 
          className="text-xl md:text-2xl max-w-2xl mx-auto mb-8"
          style={{ color: theme.colors.textSecondary }}
        >
          Las mejores tendencias en moda urbana y zapatillas. 
          Calidad premium, precios accesibles.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a 
            href="#productos"
            className="px-10 py-4 rounded-2xl font-bold text-lg transition-all hover:scale-105 hover:shadow-2xl"
            style={{
              backgroundColor: theme.colors.accent,
              color: theme.colors.buttonText,
              boxShadow: `0 10px 30px ${theme.colors.accent}40`,
            }}
          >
            Ver Colección
          </a>
          <a 
            href="#categorias"
            className="px-10 py-4 rounded-2xl font-bold text-lg transition-all hover:scale-105"
            style={{
              backgroundColor: 'transparent',
              color: theme.colors.text,
              border: `2px solid ${theme.colors.border}`,
            }}
          >
            Explorar
          </a>
        </div>
      </div>
      
      <div className="absolute bottom-0 left-0 right-0 h-24" style={{
        background: `linear-gradient(transparent, var(--theme-bg))`,
      }} />
    </div>
  );
};

const CategoriesSection = () => {
  const { theme } = useTheme();
  
  const categories = [
    { name: 'Zapatillas', emoji: '👟', bg: 'from-red-500 to-orange-500' },
    { name: 'Streetwear', emoji: '👕', bg: 'from-blue-500 to-cyan-500' },
    { name: 'Deportivo', emoji: '⚽', bg: 'from-green-500 to-emerald-500' },
    { name: 'Formal', emoji: '👔', bg: 'from-purple-500 to-pink-500' },
    { name: 'Accesorios', emoji: '🧢', bg: 'from-yellow-500 to-amber-500' },
  ];
  
  return (
    <div id="categorias" className="max-w-7xl mx-auto px-4 py-16">
      <h2 className="text-3xl md:text-4xl font-bold text-center mb-10" style={{ color: theme.colors.text }}>
        Categorías
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {categories.map((cat, idx) => (
          <a
            key={cat.name}
            href={`/?category=${cat.name.toLowerCase()}`}
            className="group relative overflow-hidden rounded-2xl aspect-square transition-all hover:scale-105 hover:shadow-2xl"
            style={{ backgroundColor: theme.colors.card }}
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${cat.bg} opacity-20 group-hover:opacity-30 transition-opacity`} />
            <div className="relative flex flex-col items-center justify-center h-full p-4">
              <span className="text-5xl mb-3 transform group-hover:scale-125 transition-transform">{cat.emoji}</span>
              <span className="font-bold text-lg" style={{ color: theme.colors.text }}>{cat.name}</span>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
};

const FeaturesSection = () => {
  const { theme } = useTheme();
  
  const features = [
    { icon: '🚚', title: 'Envío Gratis', desc: 'En pedidos + $50' },
    { icon: '🔄', title: 'Devolución', desc: '30 días' },
    { icon: '💬', title: 'Soporte 24/7', desc: 'Chat online' },
    { icon: '✨', title: 'Calidad Premium', desc: 'Productos seleccionados' },
  ];
  
  return (
    <div className="py-16" style={{ backgroundColor: theme.colors.bgSecondary }}>
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {features.map((feature, idx) => (
            <div key={idx} className="text-center group">
              <div className="text-4xl mb-2 transform group-hover:scale-125 transition-transform">{feature.icon}</div>
              <div className="font-bold text-lg" style={{ color: theme.colors.text }}>{feature.title}</div>
              <div className="text-sm" style={{ color: theme.colors.textSecondary }}>{feature.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

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
                  <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: 'var(--theme-text)' }}>
                    ✨ Productos Destacados
                  </h2>
                  <p style={{ color: 'var(--theme-text-secondary)' }}>Los favoritos de nuestros clientes</p>
                  <FeaturedProducts />
                </div>
                <div className="max-w-7xl mx-auto px-4 py-12">
                  <h2 className="text-3xl md:text-4xl font-bold mb-8" style={{ color: 'var(--theme-text)' }}>
                    📦 Catálogo Completo
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