import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Package, Heart, MapPin, CreditCard, LogOut, ShoppingCart, Clock, CheckCircle, Truck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useWishlist } from '../context/WishlistContext';
import { orders as mockOrders, users } from '../data/mockData';

const CustomerDashboard = () => {
  const { user, logout } = useAuth();
  const { theme } = useTheme();
  const { wishlist } = useWishlist();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileData, setProfileData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '',
  });

  const userOrders = mockOrders.filter(o => o.userId === user?.id || 2);
  const userWishlist = wishlist;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const tabs = [
    { id: 'overview', label: 'Resumen', icon: User },
    { id: 'orders', label: 'Mis Pedidos', icon: Package },
    { id: 'wishlist', label: 'Mi Wishlist', icon: Heart },
    { id: 'address', label: 'Direcciónes', icon: MapPin },
  ];

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center" style={{ color: theme.colors.text }}>
        <h1 className="text-2xl font-bold mb-4">Debes iniciar sesión</h1>
        <Link to="/auth" className="px-6 py-3 rounded-lg" style={{ backgroundColor: theme.colors.button, color: theme.colors.buttonText }}>
          Iniciar Sesión
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar */}
        <aside className="md:w-64 flex-shrink-0">
          <div className="rounded-2xl p-6" style={{ backgroundColor: theme.colors.card, border: '1px solid ' + theme.colors.border }}>
            <div className="text-center mb-6">
              <div className="w-20 h-20 rounded-full mx-auto mb-3 flex items-center justify-center text-3xl" style={{ backgroundColor: theme.colors.accent, color: theme.colors.buttonText }}>
                {user.firstName?.charAt(0) || 'U'}
              </div>
              <h2 className="font-bold" style={{ color: theme.colors.text }}>{user.firstName} {user.lastName}</h2>
              <p className="text-sm" style={{ color: theme.colors.textSecondary }}>{user.email}</p>
            </div>
            
            <nav className="space-y-2">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors"
                  style={{
                    backgroundColor: activeTab === tab.id ? theme.colors.accent : 'transparent',
                    color: activeTab === tab.id ? theme.colors.buttonText : theme.colors.text,
                  }}
                >
                  <tab.icon className="w-5 h-5" />
                  {tab.label}
                </button>
              ))}
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-red-500"
              >
                <LogOut className="w-5 h-5" />
                Cerrar Sesión
              </button>
            </nav>
          </div>
        </aside>

        {/* Content */}
        <main className="flex-1">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <h1 className="text-2xl font-bold" style={{ color: theme.colors.text }}>Bienvenido, {user.firstName}!</h1>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="rounded-xl p-4" style={{ backgroundColor: theme.colors.card, border: '1px solid ' + theme.colors.border }}>
                  <Package className="w-8 h-8 mb-2" style={{ color: theme.colors.accent }} />
                  <p className="text-2xl font-bold" style={{ color: theme.colors.text }}>{userOrders.length}</p>
                  <p className="text-sm" style={{ color: theme.colors.textSecondary }}>Pedidos</p>
                </div>
                <div className="rounded-xl p-4" style={{ backgroundColor: theme.colors.card, border: '1px solid ' + theme.colors.border }}>
                  <Clock className="w-8 h-8 mb-2" style={{ color: theme.colors.accent }} />
                  <p className="text-2xl font-bold" style={{ color: theme.colors.text }}>{userOrders.filter(o => o.status === 'PENDING').length}</p>
                  <p className="text-sm" style={{ color: theme.colors.textSecondary }}>Pendientes</p>
                </div>
                <div className="rounded-xl p-4" style={{ backgroundColor: theme.colors.card, border: '1px solid ' + theme.colors.border }}>
                  <CheckCircle className="w-8 h-8 mb-2" style={{ color: theme.colors.accent }} />
                  <p className="text-2xl font-bold" style={{ color: theme.colors.text }}>{userOrders.filter(o => o.status === 'DELIVERED').length}</p>
                  <p className="text-sm" style={{ color: theme.colors.textSecondary }}>Entregados</p>
                </div>
                <div className="rounded-xl p-4" style={{ backgroundColor: theme.colors.card, border: '1px solid ' + theme.colors.border }}>
                  <Heart className="w-8 h-8 mb-2" style={{ color: theme.colors.accent }} />
                  <p className="text-2xl font-bold" style={{ color: theme.colors.text }}>{userWishlist.length}</p>
                  <p className="text-sm" style={{ color: theme.colors.textSecondary }}>Favoritos</p>
                </div>
              </div>

              <div className="rounded-xl p-6" style={{ backgroundColor: theme.colors.card, border: '1px solid ' + theme.colors.border }}>
                <h2 className="font-bold mb-4" style={{ color: theme.colors.text }}>Últimos Pedidos</h2>
                {userOrders.slice(0, 3).map(order => (
                  <div key={order.id} className="flex items-center justify-between py-3 border-b" style={{ borderColor: theme.colors.border }}>
                    <div>
                      <p className="font-medium" style={{ color: theme.colors.text }}>{order.orderNumber}</p>
                      <p className="text-sm" style={{ color: theme.colors.textSecondary }}>{new Date(order.createdAt).toLocaleDateString('es-AR')}</p>
                    </div>
                    <span className="px-3 py-1 rounded-full text-xs font-medium" style={{
                      backgroundColor: order.status === 'DELIVERED' ? '#22c55e' + '20' : order.status === 'SHIPPED' ? '#3b82f6' + '20' : '#f59e0b' + '20',
                      color: order.status === 'DELIVERED' ? '#22c55e' : order.status === 'SHIPPED' ? '#3b82f6' : '#f59e0b',
                    }}>
                      {order.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'orders' && (
            <div className="rounded-xl p-6" style={{ backgroundColor: theme.colors.card, border: '1px solid ' + theme.colors.border }}>
              <h2 className="font-bold mb-4" style={{ color: theme.colors.text }}>Mis Pedidos</h2>
              {userOrders.length === 0 ? (
                <p style={{ color: theme.colors.textSecondary }}>No tienes pedidos aún.</p>
              ) : (
                <div className="space-y-4">
                  {userOrders.map(order => (
                    <div key={order.id} className="p-4 rounded-lg" style={{ backgroundColor: theme.colors.bgSecondary }}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium" style={{ color: theme.colors.text }}>{order.orderNumber}</span>
                        <span className="px-2 py-1 rounded text-xs font-medium" style={{ backgroundColor: theme.colors.accent, color: theme.colors.buttonText }}>
                          ${order.total?.toFixed(2)}
                        </span>
                      </div>
                      <p className="text-sm mb-2" style={{ color: theme.colors.textSecondary }}>
                        {new Date(order.createdAt).toLocaleDateString('es-AR')}
                      </p>
                      <div className="flex items-center gap-2">
                        <Truck className="w-4 h-4" style={{ color: theme.colors.accent }} />
                        <span className="text-sm" style={{ color: theme.colors.text }}>Estado: {order.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'wishlist' && (
            <div className="rounded-xl p-6" style={{ backgroundColor: theme.colors.card, border: '1px solid ' + theme.colors.border }}>
              <h2 className="font-bold mb-4" style={{ color: theme.colors.text }}>Mi Wishlist</h2>
              {userWishlist.length === 0 ? (
                <p style={{ color: theme.colors.textSecondary }}>Tu wishlist está vacía.</p>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {userWishlist.map(item => (
                    <div key={item.id} className="rounded-lg overflow-hidden" style={{ backgroundColor: theme.colors.bgSecondary }}>
                      <img src={item.image} alt={item.name} className="w-full h-32 object-cover" />
                      <div className="p-3">
                        <p className="font-medium text-sm" style={{ color: theme.colors.text }}>{item.name}</p>
                        <p className="font-bold" style={{ color: theme.colors.accent }}>${item.price?.toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'address' && (
            <div className="rounded-xl p-6" style={{ backgroundColor: theme.colors.card, border: '1px solid ' + theme.colors.border }}>
              <h2 className="font-bold mb-4" style={{ color: theme.colors.text }}>Mis Direcciónes</h2>
              <div className="p-4 rounded-lg" style={{ backgroundColor: theme.colors.bgSecondary }}>
                <p className="font-medium" style={{ color: theme.colors.text }}>{user?.firstName} {user?.lastName}</p>
                <p className="text-sm" style={{ color: theme.colors.textSecondary }}>Av. Libertador 1234</p>
                <p className="text-sm" style={{ color: theme.colors.textSecondary }}>Buenos Aires, Argentina</p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default CustomerDashboard;