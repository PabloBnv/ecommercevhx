import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Package, ShoppingCart, Users, Plus, Edit2, Trash2, Shield, UserCheck, UserX, BarChart3, DollarSign, TrendingUp, AlertTriangle, Star, FileText, Download, TrendingDown, PieChart, Activity } from 'lucide-react';
import DashboardChat from '../components/DashboardChat';

const AdminDashboard = () => {
  const { isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    sellers: 0,
    customers: 0,
    moderators: 0,
    totalProducts: 0,
    totalOrders: 0,
    pendingOrders: 0,
    totalRevenue: 0,
    productsWithStock: 0,
    productsOutOfStock: 0,
    avgOrderValue: 0
  });
  const [editingProduct, setEditingProduct] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (!loading && users.length === 0 && products.length === 0) {
      loadData();
    }
  }, [activeTab]);
  
  // Report Generator States
  const [reportData, setReportData] = useState({
    type: 'products_vs_orders',
    dateFrom: '',
    dateTo: '',
    data: []
  });
  const [generatingReport, setGeneratingReport] = useState(false);

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Load all data for dashboard metrics
      const [usersRes, productsRes, ordersRes] = await Promise.all([
        api.admin.getUsers().catch(e => { console.error('Error usuarios:', e); return []; }),
        api.products.getAll().catch(e => { console.error('Error productos:', e); return []; }),
        api.orders.getAll().catch(e => { console.error('Error pedidos:', e); return []; })
      ]);
      
      const allProds = Array.isArray(productsRes) ? productsRes : (productsRes.content || []);
      
      setUsers(usersRes || []);
      setProducts(allProds);
      setOrders(ordersRes || []);
      
      // Calculate comprehensive stats
      const totalUsers = (usersRes || []).length;
      const activeUsers = (usersRes || []).filter(u => u.enabled).length;
      const sellers = (usersRes || []).filter(u => u.role === 'INVENTORY').length;
      const customers = (usersRes || []).filter(u => u.role === 'CUSTOMER').length;
      const moderators = (usersRes || []).filter(u => u.role === 'MODERATOR').length;
      const totalProducts = allProds.length;
      const totalOrders = (ordersRes || []).length || 0;
      const pendingOrders = (ordersRes || []).filter(o => o.status === 'PENDING' || o.status === 'CONFIRMED').length || 0;
      const totalRevenue = (ordersRes || []).reduce((sum, o) => sum + (o.total || 0), 0);
      const productsWithStock = allProds.filter(p => p.stock != null && p.stock > 0).length;
      const productsOutOfStock = allProds.filter(p => p.stock === 0 || p.stock === null).length;
      
      setStats({
        totalUsers,
        activeUsers,
        sellers,
        customers,
        moderators,
        totalProducts,
        totalOrders,
        pendingOrders,
        totalRevenue,
        productsWithStock,
        productsOutOfStock,
        avgOrderValue: totalOrders > 0 ? totalRevenue / totalOrders : 0
      });
    } catch (err) {
      console.error('Error cargando datos:', err);
      setError('Error al cargar datos. Intenta recargar la página.');
    } finally {
      setLoading(false);
    }
  };

  const generateReport = async () => {
    setGeneratingReport(true);
    try {
      let reportRows = [];
      
      switch (reportData.type) {
        case 'products_vs_orders':
          // Products vs Orders Report
          reportRows = products.map(p => ({
            'Producto': p.name,
            'Precio': p.price,
            'Stock': p.stock ?? 'N/A',
            'Categoría': p.category?.name || 'Sin categoría',
            'Pedidos': 0, // Would need order items data
            'Ventas Totales': 0
          }));
          break;
          
        case 'stock_vs_sales':
          // Stock vs Sales Report
          reportRows = products.map(p => ({
            'Producto': p.name,
            'Stock Actual': p.stock ?? 'N/A',
            'Precio Unitario': p.price,
            'Valor Stock': (p.stock || 0) * p.price,
            'Estado': p.stock === 0 ? 'Sin Stock' : p.stock < 10 ? 'Stock Bajo' : 'OK'
          }));
          break;
          
        case 'users_vs_orders':
          // Users vs Orders Report
          const userOrdersMap = {};
          orders.forEach(o => {
            const key = o.userEmail || 'Anonymous';
            userOrdersMap[key] = (userOrdersMap[key] || 0) + 1;
          });
          reportRows = users.map(u => ({
            'Usuario': `${u.firstName} ${u.lastName}`,
            'Email': u.email,
            'Rol': u.role,
            'Pedidos': userOrdersMap[u.email] || 0,
            'Estado': u.enabled ? 'Activo' : 'Inactivo'
          }));
          break;
          
        case 'revenue_by_period':
          // Revenue by Period Report
          const ordersByDate = {};
          orders.forEach(o => {
            const date = o.createdAt?.split('T')[0] || 'Unknown';
            if (!ordersByDate[date]) {
              ordersByDate[date] = { count: 0, revenue: 0 };
            }
            ordersByDate[date].count++;
            ordersByDate[date].revenue += o.total || 0;
          });
          reportRows = Object.entries(ordersByDate).map(([date, data]) => ({
            'Fecha': date,
            'Cantidad Pedidos': data.count,
            'Ingresos': data.revenue,
            'Ticket Promedio': data.count > 0 ? data.revenue / data.count : 0
          }));
          break;
          
        case 'inventory_summary':
          // Inventory Summary Report
          reportRows = [
            {
              'Métrica': 'Total Productos',
              'Valor': stats.totalProducts
            },
            {
              'Métrica': 'Productos con Stock',
              'Valor': stats.productsWithStock
            },
            {
              'Métrica': 'Productos sin Stock',
              'Valor': stats.productsOutOfStock
            },
            {
              'Métrica': 'Total Usuarios',
              'Valor': stats.totalUsers
            },
            {
              'Métrica': 'Total Pedidos',
              'Valor': stats.totalOrders
            },
            {
              'Métrica': 'Pedidos Pendientes',
              'Valor': stats.pendingOrders
            },
            {
              'Métrica': 'Ingresos Totales',
              'Valor': stats.totalRevenue
            },
            {
              'Métrica': 'Ticket Promedio',
              'Valor': stats.avgOrderValue?.toFixed(2)
            }
          ];
          break;
          
        case 'users_by_role':
          // Users by Role Report
          const roleCounts = {
            'ADMIN': users.filter(u => u.role === 'ADMIN').length,
            'INVENTORY': users.filter(u => u.role === 'INVENTORY').length,
            'MODERATOR': users.filter(u => u.role === 'MODERATOR').length,
            'CUSTOMER': users.filter(u => u.role === 'CUSTOMER').length
          };
          reportRows = Object.entries(roleCounts).map(([role, count]) => ({
            'Rol': role,
            'Cantidad': count,
            'Porcentaje': ((count / users.length) * 100).toFixed(1) + '%'
          }));
          break;
          
        default:
          reportRows = [];
      }
      
      setReportData(prev => ({ ...prev, data: reportRows }));
    } catch (err) {
      console.error(err);
      alert('Error al generar reporte');
    } finally {
      setGeneratingReport(false);
    }
  };

  const exportReport = (format) => {
    const data = reportData.data;
    if (data.length === 0) {
      alert('Primero genera un reporte');
      return;
    }
    
    let content, filename, mimeType;
    
    if (format === 'csv') {
      const headers = Object.keys(data[0]);
      const rows = data.map(row => headers.map(h => row[h]).join(','));
      content = [headers.join(','), ...rows].join('\n');
      filename = `reporte_${reportData.type}_${Date.now()}.csv`;
      mimeType = 'text/csv';
    } else {
      content = JSON.stringify({
        reportType: reportData.type,
        generatedAt: new Date().toISOString(),
        data: data
      }, null, 2);
      filename = `reporte_${reportData.type}_${Date.now()}.json`;
      mimeType = 'application/json';
    }
    
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  const handleDelete = async (id) => {
    if (confirm('¿Eliminar este producto?')) {
      await api.admin.deleteProduct(id);
      loadData();
    }
  };

  const handleSaveProduct = async (product) => {
    try {
      if (product.id) {
        await api.admin.updateProduct(product.id, product);
      } else {
        await api.admin.createProduct(product);
      }
      setShowModal(false);
      setEditingProduct(null);
      loadData();
    } catch (err) {
      alert(err.message);
    }
  };

  const updateOrderStatus = async (id, status) => {
    await api.orders.updateStatus(id, status);
    loadData();
  };

  const updateUserRole = async (userId, newRole) => {
    try {
      await api.admin.updateUserRole(userId, newRole);
      setShowRoleModal(false);
      loadData();
    } catch (err) {
      alert(err.message);
    }
  };

  const updateUserStatus = async (userId, enabled) => {
    try {
      await api.admin.updateUserStatus(userId, enabled);
      loadData();
    } catch (err) {
      alert(err.message);
    }
  };

  if (!isAdmin) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-red-600">Acceso denegado</h1>
        <p className="text-gray-600 mt-2">No tienes permisos de administrador.</p>
      </div>
    );
  }

  // Calculate additional metrics
  const revenue = orders.reduce((sum, o) => sum + (o.total || 0), 0);
  const pendingOrdersCount = orders.filter(o => o.status === 'PENDING').length;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Panel de Administración</h1>
        <div className="text-sm text-gray-500">
          {new Date().toLocaleDateString('es-AR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      </div>

      {/* Revenue Stats Banner */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-gradient-to-br from-slate-500 to-slate-600 text-white rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-100 text-sm">Ingresos Totales</p>
              <p className="text-3xl font-bold">${stats.totalRevenue?.toLocaleString('es-AR') || 0}</p>
            </div>
            <DollarSign className="w-10 h-10 text-slate-200" />
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Pedidos Totales</p>
              <p className="text-3xl font-bold">{stats.totalOrders || 0}</p>
            </div>
            <ShoppingCart className="w-10 h-10 text-blue-200" />
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm">Ticket Promedio</p>
              <p className="text-3xl font-bold">${(stats.avgOrderValue || 0).toLocaleString('es-AR')}</p>
            </div>
            <TrendingUp className="w-10 h-10 text-purple-200" />
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm">Stock en Alerta</p>
              <p className="text-3xl font-bold">{stats.productsOutOfStock || 0}</p>
            </div>
            <AlertTriangle className="w-10 h-10 text-orange-200" />
          </div>
        </div>
      </div>

      <div className="flex gap-2 mb-8 flex-wrap">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium ${
            activeTab === 'dashboard' ? 'bg-slate-600 text-white' : 'bg-gray-200 text-gray-700'
          }`}
        >
          <BarChart3 className="w-5 h-5" />
          Dashboard
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium ${
            activeTab === 'users' ? 'bg-slate-600 text-white' : 'bg-gray-200 text-gray-700'
          }`}
        >
          <Users className="w-5 h-5" />
          Usuarios
        </button>
        <button
          onClick={() => setActiveTab('products')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium ${
            activeTab === 'products' ? 'bg-slate-600 text-white' : 'bg-gray-200 text-gray-700'
          }`}
        >
          <Package className="w-5 h-5" />
          Productos
        </button>
        <button
          onClick={() => setActiveTab('orders')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium ${
            activeTab === 'orders' ? 'bg-slate-600 text-white' : 'bg-gray-200 text-gray-700'
          }`}
        >
          <ShoppingCart className="w-5 h-5" />
          Pedidos
        </button>
        <button
          onClick={() => setActiveTab('reports')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium ${
            activeTab === 'reports' ? 'bg-slate-600 text-white' : 'bg-gray-200 text-gray-700'
          }`}
        >
          <FileText className="w-5 h-5" />
          Reportes
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-slate-500 border-t-transparent"></div>
          <p className="mt-4 text-gray-600">Cargando datos del dashboard...</p>
        </div>
      ) : error ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6">
          <p className="font-bold">Error</p>
          <p>{error}</p>
          <button onClick={loadData} className="mt-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
            Reintentar
          </button>
        </div>
      ) : (
        <>
          {activeTab === 'dashboard' && (
            <div>
              <h2 className="text-2xl font-bold mb-6">📊 Dashboard General</h2>
              
              {/* Quick Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-gradient-to-br from-cyan-500 to-cyan-600 text-white rounded-xl p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-cyan-100 text-sm">Total Usuarios</p>
                      <p className="text-3xl font-bold">{stats.totalUsers || 0}</p>
                    </div>
                    <Users className="w-10 h-10 text-cyan-200" />
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white rounded-xl p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-emerald-100 text-sm">Productos</p>
                      <p className="text-3xl font-bold">{stats.totalProducts || 0}</p>
                    </div>
                    <Package className="w-10 h-10 text-emerald-200" />
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-rose-500 to-rose-600 text-white rounded-xl p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-rose-100 text-sm">Pedidos</p>
                      <p className="text-3xl font-bold">{stats.totalOrders || 0}</p>
                    </div>
                    <ShoppingCart className="w-10 h-10 text-rose-200" />
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-amber-500 to-amber-600 text-white rounded-xl p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-amber-100 text-sm">Ingresos</p>
                      <p className="text-3xl font-bold">${(stats.totalRevenue || 0).toLocaleString('es-AR')}</p>
                    </div>
                    <DollarSign className="w-10 h-10 text-amber-200" />
                  </div>
                </div>
              </div>
              
              {/* Users by Role */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-white border border-gray-200 rounded-xl p-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <PieChart className="w-5 h-5 text-slate-600" />
                    Usuarios por Rol
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                      <span className="font-medium">👤 Clientes</span>
                      <span className="font-bold text-blue-600">{stats.customers || 0}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                      <span className="font-medium">📦 Inventario</span>
                      <span className="font-bold text-slate-600">{stats.sellers || 0}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                      <span className="font-medium">👮 Moderadores</span>
                      <span className="font-bold text-purple-600">{stats.moderators || 0}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                      <span className="font-medium">🔐 Administradores</span>
                      <span className="font-bold text-red-600">{users.filter(u => u.role === 'ADMIN').length}</span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white border border-gray-200 rounded-xl p-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Activity className="w-5 h-5 text-slate-600" />
                    Estado del Inventario
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                      <span className="font-medium">✅ Con Stock</span>
                      <span className="font-bold text-slate-600">{stats.productsWithStock || 0}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                      <span className="font-medium">⚠️ Stock Bajo</span>
                      <span className="font-bold text-orange-600">{products.filter(p => p.stock > 0 && p.stock < 10).length}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                      <span className="font-medium">🚫 Sin Stock</span>
                      <span className="font-bold text-red-600">{stats.productsOutOfStock || 0}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Recent Activity */}
              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-slate-600" />
                  Métricas de Rendimiento
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <p className="text-3xl font-bold text-slate-600">${(stats.avgOrderValue || 0).toFixed(0)}</p>
                    <p className="text-sm text-gray-600">Ticket Promedio</p>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <p className="text-3xl font-bold text-blue-600">{stats.pendingOrders || 0}</p>
                    <p className="text-sm text-gray-600">Pedidos Pendientes</p>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <p className="text-3xl font-bold text-purple-600">{(stats.activeUsers / stats.totalUsers * 100 || 0).toFixed(0)}%</p>
                    <p className="text-sm text-gray-600">Tasa Activos</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'reports' && (
            <div>
              <h2 className="text-2xl font-bold mb-6">📊 Generador de Reportes</h2>
              
              {/* Report Type Selector */}
              <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
                <h3 className="text-lg font-semibold mb-4">Seleccionar Tipo de Reporte</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <select
                    value={reportData.type}
                    onChange={(e) => setReportData(prev => ({ ...prev, type: e.target.value, data: [] }))}
                    className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500"
                  >
                    <option value="products_vs_orders">📦 Productos vs Pedidos</option>
                    <option value="stock_vs_sales">📊 Stock vs Ventas</option>
                    <option value="users_vs_orders">👥 Usuarios vs Pedidos</option>
                    <option value="revenue_by_period">💰 Ingresos por Período</option>
                    <option value="users_by_role">👤 Usuarios por Rol</option>
                    <option value="inventory_summary">📋 Resumen de Inventario</option>
                  </select>
                  <button
                    onClick={generateReport}
                    disabled={generatingReport}
                    className="px-6 py-3 bg-slate-600 text-white rounded-lg hover:bg-slate-700 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <FileText className="w-5 h-5" />
                    {generatingReport ? 'Generando...' : 'Generar Reporte'}
                  </button>
                </div>
              </div>
              
              {/* Report Results */}
              {reportData.data.length > 0 && (
                <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                    <h3 className="text-lg font-semibold">📋 Resultados del Reporte</h3>
                    <div className="flex gap-2">
                      <button
                        onClick={() => exportReport('csv')}
                        className="px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 flex items-center gap-2 text-sm"
                      >
                        <Download className="w-4 h-4" />
                        CSV
                      </button>
                      <button
                        onClick={() => exportReport('json')}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 text-sm"
                      >
                        <Download className="w-4 h-4" />
                        JSON
                      </button>
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          {Object.keys(reportData.data[0]).map((key, i) => (
                            <th key={i} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{key}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {reportData.data.map((row, i) => (
                          <tr key={i} className="hover:bg-gray-50">
                            {Object.values(row).map((val, j) => (
                              <td key={j} className="px-6 py-4 text-sm text-gray-900">{String(val)}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="px-6 py-3 bg-gray-50 text-sm text-gray-500">
                    Total: {reportData.data.length} registros
                  </div>
                </div>
              )}
              
              {reportData.data.length === 0 && !generatingReport && (
                <div className="bg-gray-100 border border-gray-300 rounded-xl p-12 text-center">
                  <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Selecciona un tipo de reporte y haz clic en "Generar Reporte"</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'users' && (
            <div>
              {/* Stats */}
              <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
                <div className="bg-white border border-gray-200 rounded-xl p-5">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-blue-100 rounded-lg">
                      <Users className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Total usuarios</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.totalUsers || 0}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white border border-gray-200 rounded-xl p-5">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-slate-100 rounded-lg">
                      <UserCheck className="w-6 h-6 text-slate-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Activos</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.activeUsers || 0}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-xl p-5">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-yellow-100 rounded-lg">
                      <Package className="w-6 h-6 text-yellow-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Productos</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.totalProducts || 0}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-xl p-5">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-purple-100 rounded-lg">
                      <Shield className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Clientes</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.customers || 0}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-xl p-5">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-orange-100 rounded-lg">
                      <Shield className="w-6 h-6 text-orange-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Inventario</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.sellers || 0}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Users Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {users.map(u => (
                  <div key={u.id} className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-lg transition-shadow">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold ${
                          u.role === 'ADMIN' ? 'bg-red-500' :
                          u.role === 'MODERATOR' ? 'bg-purple-500' :
                          u.role === 'INVENTORY' ? 'bg-blue-500' : 'bg-slate-500'
                        }`}>
                          {u.firstName?.charAt(0)}{u.lastName?.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{u.firstName} {u.lastName}</p>
                          <p className="text-sm text-gray-500">{u.email}</p>
                        </div>
                      </div>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        u.enabled ? 'bg-slate-100 text-slate-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {u.enabled ? 'Activo' : 'Suspendido'}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 mb-3">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          u.role === 'ADMIN' ? 'bg-red-100 text-red-700' :
                          u.role === 'MODERATOR' ? 'bg-purple-100 text-purple-700' :
                          u.role === 'INVENTORY' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
                        }`}>
                          {u.role === 'INVENTORY' ? 'Inventario' : u.role === 'CUSTOMER' ? 'Cliente' : u.role === 'MODERATOR' ? 'Moderador' : u.role === 'ADMIN' ? 'Admin' : u.role}
                        </span>
                    </div>

                    <div className="text-xs text-gray-500 mb-3">
                      <p>Registrado: {new Date(u.createdAt).toLocaleDateString('es-AR')}</p>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => { setSelectedUser(u); setShowRoleModal(true); }}
                        className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 text-sm"
                      >
                        <Edit2 className="w-4 h-4" />
                        Cambiar Rol
                      </button>
                      <button
                        onClick={() => updateUserStatus(u.id, !u.enabled)}
                        className={`flex items-center justify-center px-3 py-2 rounded-lg ${
                          u.enabled ? 'bg-red-100 text-red-700 hover:bg-red-200' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                        title={u.enabled ? 'Suspender' : 'Activar'}
                      >
                        {u.enabled ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'products' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800">Gestión de Productos</h2>
                <button
                  onClick={() => { setEditingProduct({}); setShowModal(true); }}
                  className="flex items-center gap-2 bg-slate-600 text-white px-4 py-2 rounded-lg hover:bg-slate-700"
                >
                  <Plus className="w-5 h-5" />
                  Nuevo Producto
                </button>
              </div>

              {/* Products Grid - Same style as InventoryDashboard */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {products.map(product => (
                  <div key={product.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="aspect-square bg-gray-100">
                      {product.imageUrl ? (
                        <img 
                          src={product.imageUrl} 
                          alt={product.name}
                          className="w-full h-full object-cover"
                          loading="lazy"
                          decoding="async"
                          width="300"
                          height="300"
                          onError={(e) => e.target.style.display = 'none'}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="w-12 h-12 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-800 truncate">{product.name}</h3>
                      <p className="text-sm text-gray-500 mb-2">{product.category?.name || 'Sin categoría'}</p>
                      <p className="text-lg font-bold text-slate-600 mb-3">${product.price?.toLocaleString('es-AR')}</p>
                      
                      <div className="flex gap-2">
                        <button
                          onClick={() => { setEditingProduct(product); setShowModal(true); }}
                          className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 text-sm"
                        >
                          <Edit2 className="w-4 h-4" />
                          Editar
                        </button>
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="flex items-center justify-center px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'orders' && (
            <div>
              <h2 className="text-xl font-bold text-gray-800 mb-4">Gestión de Pedidos</h2>
              <div className="space-y-4">
                {orders.map(order => (
                  <div key={order.id} className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <p className="font-bold">Pedido #{order.id}</p>
                        <p className="text-sm text-gray-500">
                          {order.user?.firstName} {order.user?.lastName} - {order.user?.email}
                        </p>
                        <p className="text-sm text-gray-500">{order.createdAt}</p>
                      </div>
                      <select
                        value={order.status}
                        onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                        className="px-3 py-1 border rounded-lg"
                      >
                        <option value="PENDING">Pendiente</option>
                        <option value="CONFIRMED">Confirmado</option>
                        <option value="SHIPPED">Enviado</option>
                        <option value="DELIVERED">Entregado</option>
                        <option value="CANCELLED">Cancelado</option>
                      </select>
                    </div>
                    <div className="text-sm text-gray-600">
                      <p>Dirección: {order.shippingAddress}, {order.shippingCity}</p>
                      <p>Total: ${order.total?.toLocaleString('es-AR')}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Role Modal */}
      {showRoleModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Cambiar rol de {selectedUser.firstName}</h3>
            <div className="space-y-2">
              {[
                { value: 'CUSTOMER', label: 'Cliente' },
                { value: 'INVENTORY', label: 'Inventario' },
                { value: 'MODERATOR', label: 'Moderador' },
                { value: 'ADMIN', label: 'Admin' }
              ].map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => updateUserRole(selectedUser.id, value)}
                  className={`w-full px-4 py-2 rounded-lg text-left ${
                    selectedUser.role === value
                      ? 'bg-slate-600 text-white'
                      : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowRoleModal(false)}
              className="mt-4 w-full px-4 py-2 bg-gray-200 rounded-lg"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Product Modal */}
      {showModal && (
        <ProductModal
          product={editingProduct}
          onClose={() => { setShowModal(false); setEditingProduct(null); }}
          onSave={handleSaveProduct}
        />
      )}

      {/* Admin Chatbot */}
      <DashboardChat role="ADMIN" />
    </div>
  );
};

const ProductModal = ({ product, onClose, onSave }) => {
  const [formData, setFormData] = useState(product || {});

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">
          {product?.id ? 'Editar Producto' : 'Nuevo Producto'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Nombre"
            value={formData.name || ''}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-4 py-2 border rounded-lg"
            required
          />
          <textarea
            placeholder="Descripción"
            value={formData.description || ''}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-4 py-2 border rounded-lg"
          />
          <div className="grid grid-cols-2 gap-4">
            <input
              type="number"
              placeholder="Precio"
              value={formData.price || ''}
              onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
              className="w-full px-4 py-2 border rounded-lg"
              required
            />
            <input
              type="text"
              placeholder="Unidad (ej: 500g)"
              value={formData.unit || ''}
              onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg"
            />
          </div>
          <input
            type="text"
            placeholder="URL de imagen"
            value={formData.imageUrl || ''}
            onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
            className="w-full px-4 py-2 border rounded-lg"
          />
          <div className="flex gap-4">
            <button type="submit" className="flex-1 bg-slate-600 text-white py-2 rounded-lg">
              Guardar
            </button>
            <button type="button" onClick={onClose} className="flex-1 bg-gray-200 py-2 rounded-lg">
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminDashboard;