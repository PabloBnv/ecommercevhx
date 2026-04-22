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
import { heroSlides, promoBanners } from './data/mockData';

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

// Protected routes for different roles
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();
  const { theme } = useTheme();
  
  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="animate-spin rounded-full h-10 w-10 border-4" style={{ borderColor: theme?.colors?.accent || '#6366f1', borderTopColor: 'transparent' }}></div>
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/auth" />;
  }
  
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="text-center p-8 rounded-2xl" style={{ backgroundColor: theme?.colors?.card, border: `1px solid ${theme?.colors?.border}` }}>
          <h1 className="text-2xl font-bold mb-4" style={{ color: theme?.colors?.text }}>Acceso Denegado</h1>
          <p style={{ color: theme?.colors?.textSecondary }}>No tienes permisos para acceder a esta sección.</p>
          <p className="mt-2 text-sm" style={{ color: theme?.colors?.textSecondary }}>Tu rol: {user.role}</p>
          <Navigate to="/" />
        </div>
      </div>
    );
  }
  
  return children;
};

const AdminOnlyRoute = ({ children }) => (
  <ProtectedRoute allowedRoles={['ADMIN']}>{children}</ProtectedRoute>
);

const StaffRoute = ({ children }) => (
  <ProtectedRoute allowedRoles={['ADMIN', 'MODERATOR', 'INVENTORY']}>{children}</ProtectedRoute>
);

const AnnouncementBar = () => {
  const { theme } = useTheme();
  const [currentIdx, setCurrentIdx] = useState(0);
  
  return (
    <div 
      className="py-3 text-center text-sm font-semibold transition-all"
      style={{ 
        backgroundColor: theme?.colors?.accent || '#6366f1', 
        color: theme?.colors?.buttonText || '#fff' 
      }}
    >
      <span className="animate-pulse">{promoBanners[currentIdx]?.text || '¡Nueva colección!'}</span>
    </div>
  );
};

const HeroSection = () => {
  const { theme } = useTheme();
  const [currentSlide, setCurrentSlide] = useState(0);
  
  const slide = heroSlides[currentSlide] || heroSlides[0];
  
  return (
    <div className="relative min-h-[50vh] flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0">
        <img
          src={slide?.image || 'https://picsum.photos/seed/fashion1/1920/1080'}
          alt={slide?.title || 'Fashion'}
          className="w-full h-full object-cover transition-opacity duration-1000"
        />
      </div>
      
      <div 
        className="absolute inset-0 transition-opacity duration-700"
        style={{
          background: `linear-gradient(180deg, ${theme?.colors?.bg}dd 0%, ${theme?.colors?.bg}99 40%, ${theme?.colors?.bg}dd 100%)`,
          opacity: 0.85,
        }}
      />
      
      <div className="relative z-10 max-w-6xl mx-auto px-4 text-center py-8">
        <div className="inline-block px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-4" style={{ backgroundColor: theme?.colors?.accent, color: theme?.colors?.buttonText }}>
          {slide?.subtitle || 'Nueva Temporada'}
        </div>
        
        <h1 
          className="text-4xl md:text-5xl lg:text-6xl font-bold mb-3 tracking-tight"
          style={{ 
            color: theme?.colors?.text,
            fontFamily: theme?.fonts?.display,
          }}
        >
          {slide?.title || 'STORE'}
        </h1>
        
        <p 
          className="text-base md:text-lg max-w-xl mx-auto mb-6"
          style={{ color: theme?.colors?.textSecondary }}
        >
          Las mejores tendencias en moda urbana y zapatillas.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <a 
            href="#productos"
            className="px-8 py-3 rounded-xl font-semibold text-base transition-all hover:scale-105"
            style={{
              backgroundColor: theme?.colors?.accent,
              color: theme?.colors?.buttonText,
            }}
          >
            Ver Colección
          </a>
          <a 
            href="#categorias"
            className="px-8 py-3 rounded-xl font-semibold text-base transition-all hover:scale-105"
            style={{
              backgroundColor: 'transparent',
              color: theme?.colors?.text,
              border: `2px solid ${theme?.colors?.border}`,
            }}
          >
            Explorar
          </a>
        </div>
      </div>
      
      <div className="absolute bottom-8 left-0 right-0 z-20 flex justify-center gap-2">
        {(heroSlides || []).map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentSlide(idx)}
            className="w-3 h-3 rounded-full transition-all"
            style={{
              backgroundColor: currentSlide === idx ? theme?.colors?.accent : theme?.colors?.bg + '80',
              border: `2px solid ${theme?.colors?.border}`,
            }}
          />
        ))}
      </div>
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
    <div id="categorias" className="max-w-7xl mx-auto px-4 py-12">
      <h2 className="text-3xl md:text-4xl font-bold text-center mb-8" style={{ color: theme?.colors?.text }}>
        Categorías
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {categories.map((cat) => (
          <a
            key={cat.name}
            href={`/?category=${cat.name.toLowerCase()}`}
            className="group relative overflow-hidden rounded-2xl aspect-square transition-all hover:scale-105 hover:shadow-xl"
            style={{ backgroundColor: theme?.colors?.card }}
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${cat.bg} opacity-20`} />
            <div className="relative flex flex-col items-center justify-center h-full p-4">
              <span className="text-4xl mb-2 transform group-hover:scale-125 transition-transform">{cat.emoji}</span>
              <span className="font-bold" style={{ color: theme?.colors?.text }}>{cat.name}</span>
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
    <div className="py-12" style={{ backgroundColor: theme?.colors?.bgSecondary }}>
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {features.map((feature, idx) => (
            <div key={idx} className="text-center">
              <div className="text-3xl mb-1">{feature.icon}</div>
              <div className="font-semibold" style={{ color: theme?.colors?.text }}>{feature.title}</div>
              <div className="text-sm" style={{ color: theme?.colors?.textSecondary }}>{feature.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const AppContent = () => {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { user, isAdmin, isInventory, isModerator } = useAuth();
  
  return (
    <>
      <AnnouncementBar />
      <Navbar />
      <main className="flex-grow">
        <Suspense fallback={<PageFallback />}>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={
              <>
                <HeroSection />
                <CategoriesSection />
                <div id="productos" className="max-w-7xl mx-auto px-4 py-8">
                  <h2 className="text-3xl font-bold mb-2" style={{ color: 'var(--theme-text)' }}>Productos Destacados</h2>
                  <p style={{ color: 'var(--theme-text-secondary)' }}>Los favoritos de nuestros clientes</p>
                  <FeaturedProducts />
                </div>
                <div className="max-w-7xl mx-auto px-4 py-8">
                  <h2 className="text-3xl font-bold mb-6" style={{ color: 'var(--theme-text)' }}>Catálogo Completo</h2>
                  <ProductGrid />
                </div>
                <FeaturesSection />
              </>
            } />
            <Route path="/contacto" element={<ContactPage />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/product/:id" element={<ProductDetailPage />} />
            <Route path="/favoritos" element={<WishlistPage />} />
            <Route path="/order/:id" element={<OrderTrackingPage />} />
            
            {/* Customer routes - any logged user */}
            <Route path="/perfil" element={
              <ProtectedRoute allowedRoles={['ADMIN', 'MODERATOR', 'INVENTORY', 'CUSTOMER']}>
                <ProfilePage />
              </ProtectedRoute>
            } />
            <Route path="/dashboard" element={
              <ProtectedRoute allowedRoles={['ADMIN', 'MODERATOR', 'INVENTORY', 'CUSTOMER']}>
                <CustomerDashboard />
              </ProtectedRoute>
            } />
            <Route path="/pedidos" element={
              <ProtectedRoute allowedRoles={['ADMIN', 'MODERATOR', 'INVENTORY', 'CUSTOMER']}>
                <CustomerDashboard />
              </ProtectedRoute>
            } />
            <Route path="/checkout" element={
              <ProtectedRoute allowedRoles={['ADMIN', 'MODERATOR', 'INVENTORY', 'CUSTOMER']}>
                <CheckoutPage />
              </ProtectedRoute>
            } />
            <Route path="/wishlist" element={
              <ProtectedRoute allowedRoles={['ADMIN', 'MODERATOR', 'INVENTORY', 'CUSTOMER']}>
                <WishlistPage />
              </ProtectedRoute>
            } />
            
            {/* Admin routes - only ADMIN */}
            <Route path="/admin" element={
              <AdminOnlyRoute>
                <AdminDashboard />
              </AdminOnlyRoute>
            } />
            
            {/* Inventory routes - INVENTORY and ADMIN */}
            <Route path="/seller" element={
              <StaffRoute>
                <InventoryDashboard />
              </StaffRoute>
            } />
            
            {/* Moderator routes - MODERATOR and ADMIN */}
            <Route path="/moderator" element={
              <StaffRoute>
                <ModeratorDashboard />
              </StaffRoute>
            } />
            
            {/* Support - all staff */}
            <Route path="/support" element={
              <StaffRoute>
                <SupportChat />
              </StaffRoute>
            } />
            
            {/* Default redirect */}
            <Route path="*" element={<Navigate to="/" />} />
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