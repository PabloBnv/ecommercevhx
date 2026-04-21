import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { User, MapPin, LogOut, Phone, Mail, Lock, Edit2, Save, X, CreditCard, Shield, Settings, Heart, ShoppingCart, Package, TrendingUp, Star, Truck, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import DashboardChat from '../components/DashboardChat';
import { API_URL } from '../services/api';

const CustomerDashboard = () => {
  const { user, logout, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [orders, setOrders] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalSpent: 0,
    wishlistCount: 0,
    pendingOrders: 0,
    completedOrders: 0
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      
      // Load orders
      const ordersRes = await fetch(`${API_URL}/api/orders`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (ordersRes.ok) {
        const ordersData = await ordersRes.json();
        setOrders(ordersData);
        
        // Calculate stats
        const totalSpent = ordersData.reduce((sum, order) => sum + (order.total || 0), 0);
        const pendingOrders = ordersData.filter(o => o.status === 'PENDING' || o.status === 'CONFIRMED').length;
        const completedOrders = ordersData.filter(o => o.status === 'DELIVERED').length;
        
        setStats(prev => ({
          ...prev,
          totalOrders: ordersData.length,
          totalSpent,
          pendingOrders,
          completedOrders
        }));
      }

      // Load wishlist
      const wishlistRes = await fetch(`${API_URL}/api/wishlist`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (wishlistRes.ok) {
        const wishlistData = await wishlistRes.json();
        setWishlist(wishlistData);
        setStats(prev => ({ ...prev, wishlistCount: wishlistData.length }));
      }
    } catch (err) {
      console.error('Error loading dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-700';
      case 'CONFIRMED': return 'bg-blue-100 text-blue-700';
      case 'SHIPPED': return 'bg-purple-100 text-purple-700';
      case 'DELIVERED': return 'bg-slate-100 text-slate-700';
      case 'CANCELLED': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'PENDING': return 'Pendiente';
      case 'CONFIRMED': return 'Confirmado';
      case 'SHIPPED': return 'Enviado';
      case 'DELIVERED': return 'Entregado';
      case 'CANCELLED': return 'Cancelado';
      default: return status;
    }
  };

  const getLoyaltyLevel = () => {
    if (stats.totalSpent >= 50000) return { level: 'Oro', color: 'text-yellow-600', bg: 'bg-yellow-100', icon: '👑' };
    if (stats.totalSpent >= 20000) return { level: 'Plata', color: 'text-gray-600', bg: 'bg-gray-100', icon: '🥈' };
    if (stats.totalSpent >= 5000) return { level: 'Bronce', color: 'text-orange-600', bg: 'bg-orange-100', icon: '🥉' };
    return { level: 'Básico', color: 'text-slate-600', bg: 'bg-slate-100', icon: '🌱' };
  };

  const loyalty = getLoyaltyLevel();

  if (!user) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-600 to-slate-700 rounded-2xl p-6 mb-8 text-white">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center">
              <span className="text-3xl font-bold">{user.firstName?.charAt(0)}{user.lastName?.charAt(0)}</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold">¡Hola, {user.firstName}!</h1>
              <p className="text-slate-100">{user.email}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className={`px-3 py-1 rounded-full text-sm ${loyalty.bg} ${loyalty.color}`}>
                  {loyalty.icon} Nivel {loyalty.level}
                </span>
              </div>
            </div>
          </div>
          <Link 
            to="/profile" 
            className="flex items-center gap-2 px-4 py-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
          >
            <User className="w-4 h-4" />
            Mi Perfil
          </Link>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Link to="/favoritos" className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-lg transition-shadow flex flex-col items-center gap-2">
          <div className="p-3 bg-red-100 rounded-lg">
            <Heart className="w-6 h-6 text-red-600" />
          </div>
          <span className="text-sm font-medium text-gray-700">Favoritos</span>
          <span className="text-xs text-gray-500">{stats.wishlistCount} items</span>
        </Link>
        
        <Link to="/order/tracking" className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-lg transition-shadow flex flex-col items-center gap-2">
          <div className="p-3 bg-purple-100 rounded-lg">
            <Package className="w-6 h-6 text-purple-600" />
          </div>
          <span className="text-sm font-medium text-gray-700">Mis Pedidos</span>
          <span className="text-xs text-gray-500">{stats.totalOrders} pedidos</span>
        </Link>
        
        <Link to="/" className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-lg transition-shadow flex flex-col items-center gap-2">
          <div className="p-3 bg-slate-100 rounded-lg">
            <ShoppingCart className="w-6 h-6 text-slate-600" />
          </div>
          <span className="text-sm font-medium text-gray-700">Ir a Comprar</span>
          <span className="text-xs text-gray-500">Explorar productos</span>
        </Link>
        
        <Link to="/profile" className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-lg transition-shadow flex flex-col items-center gap-2">
          <div className="p-3 bg-blue-100 rounded-lg">
            <Settings className="w-6 h-6 text-blue-600" />
          </div>
          <span className="text-sm font-medium text-gray-700">Configuración</span>
          <span className="text-xs text-gray-500">Ajustes de cuenta</span>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Pedidos Totales</p>
              <p className="text-3xl font-bold">{stats.totalOrders}</p>
            </div>
            <Package className="w-10 h-10 text-blue-200" />
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-slate-500 to-slate-600 text-white rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-100 text-sm">Total Gastado</p>
              <p className="text-3xl font-bold">${stats.totalSpent.toLocaleString('es-AR')}</p>
            </div>
            <TrendingUp className="w-10 h-10 text-slate-200" />
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-red-500 to-red-600 text-white rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-100 text-sm">Favoritos</p>
              <p className="text-3xl font-bold">{stats.wishlistCount}</p>
            </div>
            <Heart className="w-10 h-10 text-red-200" />
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm">Pendientes</p>
              <p className="text-3xl font-bold">{stats.pendingOrders}</p>
            </div>
            <Truck className="w-10 h-10 text-purple-200" />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap ${
            activeTab === 'overview' ? 'bg-slate-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Resumen
        </button>
        <button
          onClick={() => setActiveTab('orders')}
          className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap ${
            activeTab === 'orders' ? 'bg-slate-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Pedidos
        </button>
        <button
          onClick={() => setActiveTab('wishlist')}
          className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap ${
            activeTab === 'wishlist' ? 'bg-slate-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Lista de Deseos
        </button>
      </div>

      {/* Tab Content */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Cargando datos...</p>
          </div>
        ) : (
          <>
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-gray-800">Resumen de tu Cuenta</h2>
                
                {/* Recent Orders */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Pedidos Recientes</h3>
                  {orders.length === 0 ? (
                    <div className="text-center py-8 bg-gray-50 rounded-lg">
                      <Package className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-600">No tienes pedidos aún</p>
                      <Link to="/" className="text-slate-600 hover:underline mt-2 inline-block">
                        ¡Empieza a comprar!
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {orders.slice(0, 3).map(order => (
                        <div key={order.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center">
                              <Package className="w-6 h-6 text-slate-600" />
                            </div>
                            <div>
                              <p className="font-medium">Pedido #{order.id}</p>
                              <p className="text-sm text-gray-500">{order.createdAt}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold">${order.total?.toLocaleString('es-AR')}</p>
                            <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(order.status)}`}>
                              {getStatusText(order.status)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Loyalty Progress */}
                <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-gray-800">Nivel de Fidelidad</h3>
                      <p className="text-sm text-gray-600">Sigue comprando para desbloquear beneficios</p>
                    </div>
                    <span className="text-3xl">{loyalty.icon}</span>
                  </div>
                  <div className="mb-2">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium">{loyalty.level}</span>
                      <span className="text-gray-600">${stats.totalSpent.toLocaleString('es-AR')}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div 
                        className="bg-gradient-to-r from-yellow-400 to-orange-500 h-3 rounded-full transition-all"
                        style={{ width: `${Math.min((stats.totalSpent / 50000) * 100, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500">
                    {stats.totalSpent >= 50000 ? '¡Felicidades! Alcanzaste el nivel máximo' : `Faltan $${(50000 - stats.totalSpent).toLocaleString('es-AR')} para el siguiente nivel`}
                  </p>
                </div>
              </div>
            )}

            {/* Orders Tab */}
            {activeTab === 'orders' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-bold text-gray-800">Mis Pedidos</h2>
                  <Link to="/order/tracking" className="text-slate-600 hover:underline text-sm">
                    Ver todos →
                  </Link>
                </div>
                
                {orders.length === 0 ? (
                  <div className="text-center py-12 bg-gray-50 rounded-lg">
                    <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-600 mb-2">No tienes pedidos</h3>
                    <p className="text-gray-500 mb-4">¡Explora nuestra tienda y haz tu primer pedido!</p>
                    <Link 
                      to="/" 
                      className="inline-flex items-center gap-2 px-6 py-3 bg-slate-600 text-white rounded-lg hover:bg-slate-700"
                    >
                      <ShoppingCart className="w-5 h-5" />
                      Ir a Comprar
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.map(order => (
                      <div key={order.id} className="border border-gray-200 rounded-xl p-6">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                          <div>
                            <div className="flex items-center gap-3">
                              <h3 className="font-bold text-lg">Pedido #{order.id}</h3>
                              <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor(order.status)}`}>
                                {getStatusText(order.status)}
                              </span>
                            </div>
                            <p className="text-sm text-gray-500 mt-1">
                              {order.createdAt} • {order.items?.length || 0} productos
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold text-slate-600">${order.total?.toLocaleString('es-AR')}</p>
                            <p className="text-sm text-gray-500">Total</p>
                          </div>
                        </div>
                        
                        {/* Order Progress */}
                        <div className="mb-4">
                          <div className="flex items-center justify-between mb-2">
                            <div className={`flex items-center gap-2 ${order.status !== 'CANCELLED' ? 'text-slate-600' : 'text-gray-400'}`}>
                              <CheckCircle className="w-4 h-4" />
                              <span className="text-xs">Pedido realizado</span>
                            </div>
                            <div className={`flex items-center gap-2 ${['CONFIRMED', 'SHIPPED', 'DELIVERED'].includes(order.status) ? 'text-slate-600' : 'text-gray-400'}`}>
                              <CheckCircle className="w-4 h-4" />
                              <span className="text-xs">Confirmado</span>
                            </div>
                            <div className={`flex items-center gap-2 ${['SHIPPED', 'DELIVERED'].includes(order.status) ? 'text-slate-600' : 'text-gray-400'}`}>
                              <Truck className="w-4 h-4" />
                              <span className="text-xs">Enviado</span>
                            </div>
                            <div className={`flex items-center gap-2 ${order.status === 'DELIVERED' ? 'text-slate-600' : 'text-gray-400'}`}>
                              <CheckCircle className="w-4 h-4" />
                              <span className="text-xs">Entregado</span>
                            </div>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-slate-500 h-2 rounded-full transition-all"
                              style={{ 
                                width: order.status === 'PENDING' ? '25%' : 
                                       order.status === 'CONFIRMED' ? '50%' : 
                                       order.status === 'SHIPPED' ? '75%' : 
                                       order.status === 'DELIVERED' ? '100%' : '0%'
                              }}
                            ></div>
                          </div>
                        </div>

                        {/* Shipping Info */}
                        {order.shippingAddress && (
                          <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                            <MapPin className="w-4 h-4" />
                            <span>{order.shippingAddress}, {order.shippingCity}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Wishlist Tab */}
            {activeTab === 'wishlist' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-bold text-gray-800">Mi Lista de Deseos</h2>
                  <Link to="/favoritos" className="text-slate-600 hover:underline text-sm">
                    Ver todos →
                  </Link>
                </div>
                
                {wishlist.length === 0 ? (
                  <div className="text-center py-12 bg-gray-50 rounded-lg">
                    <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-600 mb-2">Tu lista está vacía</h3>
                    <p className="text-gray-500 mb-4">Guarda productos que te gusten para comprarlos después</p>
                    <Link 
                      to="/" 
                      className="inline-flex items-center gap-2 px-6 py-3 bg-slate-600 text-white rounded-lg hover:bg-slate-700"
                    >
                      <Heart className="w-5 h-5" />
                      Explorar Productos
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {wishlist.map(product => (
                      <div key={product.id} className="border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-shadow">
                        <div className="aspect-square bg-gray-100">
                          <img 
                            src={product.imageUrl || '/placeholder.jpg'} 
                            alt={product.name}
                            className="w-full h-full object-cover"
                            loading="lazy"
                            decoding="async"
                            width="300"
                            height="300"
                          />
                        </div>
                        <div className="p-4">
                          <h3 className="font-medium text-gray-800 truncate">{product.name}</h3>
                          <p className="text-slate-600 font-bold mt-1">${product.price?.toLocaleString('es-AR')}</p>
                          <button className="w-full mt-3 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 text-sm">
                            Agregar al Carrito
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* Customer Chatbot */}
      <DashboardChat role="CUSTOMER" />
    </div>
  );
};

export default CustomerDashboard;
