import React, { useState, Suspense, lazy, useMemo } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { WishlistProvider } from './context/WishlistContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProductGrid from './components/ProductGrid';
import FeaturedProducts from './components/FeaturedProducts';

// Lazy load pages for code splitting (not always-visible components)
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

// Loading fallback component - optimized
const PageFallback = () => (
  <div className="flex items-center justify-center py-32" role="status" aria-label="Cargando">
    <div className="inline-block animate-spin rounded-full h-10 w-10 border-3 border-slate-600 border-t-transparent"></div>
  </div>
);

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div>Cargando...</div>;
  if (!user) return <Navigate to="/auth" />;
  return children;
};

const AppContent = () => {
  const [isCartOpen, setIsCartOpen] = useState(false);

  return (
    <>
      <div className="bg-slate-700 text-white text-center py-2 font-bold text-sm">
        🚚 Envío gratis en pedidos mayores a $50 | ¡Nuevos productos cada semana!
      </div>
      <Navbar onCartClick={() => setIsCartOpen(true)} />
      <main className="flex-grow">
        <Suspense fallback={<PageFallback />}>
          <Routes>
            <Route path="/" element={
              <>
                <div className="bg-gradient-to-r from-slate-700 to-slate-600 text-white py-12 px-4">
                  <div className="max-w-7xl mx-auto text-center">
                    <h1 className="text-3xl md:text-4xl font-bold mb-3">
                      Descubre Tu Estilo
                    </h1>
                    <p className="text-slate-200 text-lg max-w-2xl mx-auto">
                      Las últimas tendencias en moda a precios accesibles. Envío gratis en pedidos mayores a $50.
                    </p>
                  </div>
                </div>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">Productos Destacados</h2>
                      <p className="text-gray-600">Los favoritos de nuestros clientes</p>
                    </div>
                  </div>
                  <FeaturedProducts />
                  <div className="mt-12 text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Todos los Productos</h2>
                  </div>
                </div>
                <ProductGrid />
              </>
            } />
            <Route path="/contacto" element={<ContactPage />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/favoritos" element={<WishlistPage />} />
            <Route path="/product/:id" element={<ProductDetailPage />} />
            <Route path="/profile" element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            } />
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <CustomerDashboard />
              </ProtectedRoute>
            } />
            <Route path="/order/:id" element={<OrderTrackingPage />} />
            <Route path="/checkout" element={
              <ProtectedRoute>
                <CheckoutPage />
              </ProtectedRoute>
            } />
            <Route path="/admin" element={
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
            } />
            <Route path="/seller" element={
              <ProtectedRoute>
                <InventoryDashboard />
              </ProtectedRoute>
            } />
            <Route path="/moderator" element={
              <ProtectedRoute>
                <ModeratorDashboard />
              </ProtectedRoute>
            } />
            <Route path="/support" element={
              <ProtectedRoute>
                <SupportChat />
              </ProtectedRoute>
            } />
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
      <AuthProvider>
        <CartProvider>
          <WishlistProvider>
            <div className="min-h-screen flex flex-col bg-gray-50">
              <AppContent />
            </div>
          </WishlistProvider>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
