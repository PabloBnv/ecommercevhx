import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { 
  Users, Package, UserCheck, UserX, Edit2, CheckCircle, XCircle, 
  Shield, AlertTriangle, Search, Filter, Eye, Ban, MessageSquare,
  Star, TrendingUp, Clock, UserPlus, FileText, ChevronDown, ChevronUp,
  Bell, Flag, ThumbsUp, ThumbsDown, Send, Ticket, AlertCircle, Check
} from 'lucide-react';
import DashboardChat from '../components/DashboardChat';

const ModeratorDashboard = () => {
  const { user, isModerator } = useAuth();
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [reports, setReports] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [ticketStats, setTicketStats] = useState({});
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('users');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [warningMessage, setWarningMessage] = useState('');
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [ticketResolution, setTicketResolution] = useState('');

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    setLoading(true);
    try {
      // Load tickets from API
      const ticketsRes = await api.support.getTickets().catch(() => ({ tickets: [] }));
      const ticketStatsRes = await api.support.getTicketStats().catch(() => ({}));

      // Load real users from API
      const usersRes = await api.moderator.getUsers().catch(() => []);

      // Load products for reports
      const productsRes = await api.products.getAll().catch(() => []);

      setTickets(ticketsRes.tickets || []);
      setTicketStats(ticketStatsRes);

      // Use real data
      const allUsers = usersRes || [];
      const allProducts = Array.isArray(productsRes) ? productsRes : (productsRes.content || []);

      // Mock reports and reviews (could be extended to real API)
      const mockReports = [
        { id: 1, type: 'USER', targetId: 4, reason: 'Spam en comentarios', status: 'PENDING', createdAt: '2024-03-20' },
        { id: 2, type: 'PRODUCT', targetId: 3, reason: 'Descripción engañosa', status: 'PENDING', createdAt: '2024-03-19' },
        { id: 3, type: 'REVIEW', targetId: 5, reason: 'Lenguaje inapropiado', status: 'RESOLVED', createdAt: '2024-03-18' },
      ];

      const mockReviews = [
        { id: 1, product: 'Quinoa Premium', user: 'Juan Pérez', rating: 5, comment: 'Excelente producto!', status: 'PENDING' },
        { id: 2, product: 'Aceite de Oliva', user: 'María González', rating: 1, comment: 'Malo', status: 'PENDING' },
        { id: 3, product: 'Quinoa Premium', user: 'Roberto Fernández', rating: 4, comment: 'Buen producto', status: 'APPROVED' },
      ];

      setUsers(allUsers);
      setProducts(allProducts.map(p => ({ ...p, reports: 0 })));
      setReports(mockReports);
      setReviews(mockReviews);
      setStats({
        totalUsers: allUsers.length,
        activeUsers: allUsers.filter(u => u.enabled).length,
        suspendedUsers: allUsers.filter(u => !u.enabled).length,
        totalProducts: allProducts.length,
        pendingReports: mockReports.filter(r => r.status === 'PENDING').length,
        pendingReviews: mockReviews.filter(r => r.status === 'PENDING').length,
        warningsIssued: 0,
        openTickets: ticketStatsRes.open || 0,
      });
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateTicketStatus = async (ticketId, newStatus) => {
    try {
      await api.support.updateTicket(ticketId, { 
        status: newStatus,
        resolution: ticketResolution 
      });
      setSelectedTicket(null);
      setTicketResolution('');
      loadDashboard();
      alert('Ticket actualizado correctamente');
    } catch (error) {
      console.error('Error updating ticket:', error);
      alert('Error al actualizar el ticket');
    }
  };

  const updateUserStatus = async (userId, enabled, reason = '') => {
    try {
      // API call would go here
      setUsers(users.map(u => u.id === userId ? { ...u, enabled } : u));
      setShowUserModal(false);
      alert(`Usuario ${enabled ? 'activado' : 'suspendido'} correctamente`);
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const warnUser = async (userId, message) => {
    try {
      const user = users.find(u => u.id === userId);
      setUsers(users.map(u => u.id === userId ? { ...u, warnings: u.warnings + 1 } : u));
      setShowWarningModal(false);
      setWarningMessage('');
      alert(`Advertencia enviada a ${user.firstName}. Total de advertencias: ${user.warnings + 1}`);
    } catch (error) {
      console.error('Error warning user:', error);
    }
  };

  const banUser = async (userId, reason) => {
    if (confirm('¿Estás seguro de suspender permanentemente este usuario?')) {
      await updateUserStatus(userId, false, reason);
    }
  };

  const resolveReport = async (reportId, action) => {
    try {
      setReports(reports.map(r => r.id === reportId ? { ...r, status: action === 'dismiss' ? 'DISMISSED' : 'RESOLVED' } : r));
      alert(`Reporte ${action === 'dismiss' ? 'descartado' : 'resuelto'}`);
    } catch (error) {
      console.error('Error resolving report:', error);
    }
  };

  const moderateReview = async (reviewId, approved) => {
    try {
      setReviews(reviews.map(r => r.id === reviewId ? { ...r, status: approved ? 'APPROVED' : 'REJECTED' } : r));
      alert(`Review ${approved ? 'aprobada' : 'rechazada'}`);
    } catch (error) {
      console.error('Error moderating review:', error);
    }
  };

  // Filter users
  const filteredUsers = users.filter(u => {
    const matchesSearch = `${u.firstName} ${u.lastName} ${u.email}`.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = filterRole === 'all' || u.role === filterRole;
    const matchesStatus = filterStatus === 'all' || (filterStatus === 'active' && u.enabled) || (filterStatus === 'inactive' && !u.enabled);
    return matchesSearch && matchesRole && matchesStatus;
  });

  if (!isModerator) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <Shield className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-red-600">Acceso denegado</h1>
        <p className="text-gray-600 mt-2">No tienes permisos de moderador.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-slate-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Panel de Moderación</h1>
          <p className="text-gray-600">Gestiona usuarios, productos y contenido</p>
        </div>
        <div className="text-sm text-gray-500">
          {new Date().toLocaleDateString('es-AR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Usuarios Activos</p>
              <p className="text-2xl font-bold">{stats.activeUsers}</p>
            </div>
            <UserCheck className="w-8 h-8 text-blue-200" />
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-red-500 to-red-600 text-white rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-100 text-sm">Suspendidos</p>
              <p className="text-2xl font-bold">{stats.suspendedUsers}</p>
            </div>
            <UserX className="w-8 h-8 text-red-200" />
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm">Reportes</p>
              <p className="text-2xl font-bold">{stats.pendingReports}</p>
            </div>
            <AlertTriangle className="w-8 h-8 text-orange-200" />
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm">Reviews Pendientes</p>
              <p className="text-2xl font-bold">{stats.pendingReviews}</p>
            </div>
            <Star className="w-8 h-8 text-purple-200" />
          </div>
        </div>
      </div>

      {/* Alerts Section */}
      {stats.pendingReports > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 mb-8">
          <div className="flex items-center gap-3">
            <Bell className="w-6 h-6 text-orange-600" />
            <div>
              <p className="font-semibold text-orange-800">Tienes {stats.pendingReports} reportes pendientes de revisión</p>
              <p className="text-sm text-orange-600">Revisa los reportes para mantener la calidad de la plataforma</p>
            </div>
            <button 
              onClick={() => setActiveTab('reports')}
              className="ml-auto px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
            >
              Ver Reportes
            </button>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {[
          { id: 'users', label: 'Usuarios', icon: Users, count: filteredUsers.length },
          { id: 'products', label: 'Productos', icon: Package, count: products.length },
          { id: 'reviews', label: 'Reviews', icon: Star, count: stats.pendingReviews },
          { id: 'reports', label: 'Reportes', icon: Flag, count: stats.pendingReports },
          { id: 'tickets', label: 'Tickets', icon: Ticket, count: stats.openTickets },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === tab.id ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
            {tab.count > 0 && (
              <span className={`px-2 py-0.5 text-xs rounded-full ${
                activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-gray-300 text-gray-600'
              }`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          {/* Search and Filters */}
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <div className="flex flex-wrap gap-4">
              <div className="flex-1 min-w-[200px]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Buscar por nombre o email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              >
                <option value="all">Todos los roles</option>
                <option value="CUSTOMER">Clientes</option>
                <option value="SELLER">Inventario</option>
                <option value="MODERATOR">Moderadores</option>
              </select>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              >
                <option value="all">Todos los estados</option>
                <option value="active">Activos</option>
                <option value="inactive">Suspendidos</option>
              </select>
            </div>
          </div>

          {/* Users Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredUsers.map(u => (
              <div key={u.id} className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${
                      u.role === 'ADMIN' ? 'bg-red-500' :
                      u.role === 'MODERATOR' ? 'bg-purple-500' :
                      u.role === 'INVENTORY' ? 'bg-blue-500' : 'bg-slate-500'
                    }`}>
                      {u.firstName.charAt(0)}{u.lastName.charAt(0)}
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
                    {u.role}
                  </span>
                  {u.warnings > 0 && (
                    <span className="px-2 py-1 text-xs rounded-full bg-orange-100 text-orange-700">
                      ⚠️ {u.warnings} advertencias
                    </span>
                  )}
                </div>

                <div className="text-xs text-gray-500 mb-3">
                  <p>Registrado: {new Date(u.createdAt).toLocaleDateString('es-AR')}</p>
                  <p>Pedidos: {u.ordersCount}</p>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => { setSelectedUser(u); setShowUserModal(true); }}
                    className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm"
                  >
                    <Eye className="w-4 h-4" />
                    Ver
                  </button>
                  
                  {u.role !== 'ADMIN' && (
                    <>
                      <button
                        onClick={() => { setSelectedUser(u); setShowWarningModal(true); }}
                        className="flex items-center justify-center px-3 py-2 bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200"
                        title="Advertir"
                      >
                        <AlertTriangle className="w-4 h-4" />
                      </button>
                      
                      <button
                        onClick={() => updateUserStatus(u.id, !u.enabled)}
                        className={`flex items-center justify-center px-3 py-2 rounded-lg ${
                          u.enabled 
                            ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                        title={u.enabled ? 'Suspender' : 'Activar'}
                      >
                        {u.enabled ? <Ban className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Products Tab */}
      {activeTab === 'products' && (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold">Productos</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Producto</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Inventario</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Categoría</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Precio</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {products.map(p => (
                  <tr key={p.id}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {p.imageUrl ? (
                          <img src={p.imageUrl} alt={p.name} className="w-10 h-10 rounded-lg object-cover" loading="lazy" decoding="async" width="40" height="40" />
                        ) : (
                          <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center">
                            <Package className="w-5 h-5 text-gray-400" />
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-gray-900">{p.name}</p>
                          {p.reports > 0 && (
                            <span className="text-xs text-red-600">{p.reports} reportes</span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{p.seller}</td>
                    <td className="px-6 py-4 text-gray-600">{p.category?.name || 'N/A'}</td>
                    <td className="px-6 py-4 font-medium">${p.price?.toLocaleString('es-AR')}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        p.enabled ? 'bg-slate-100 text-slate-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {p.enabled ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => updateProductStatus(p.id, !p.enabled)}
                        className={`p-2 rounded-lg ${
                          p.enabled ? 'text-red-600 hover:bg-red-50' : 'text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        {p.enabled ? <XCircle className="w-5 h-5" /> : <CheckCircle className="w-5 h-5" />}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Reviews Tab */}
      {activeTab === 'reviews' && (
        <div className="space-y-4">
          {reviews.filter(r => r.status === 'PENDING').map(review => (
            <div key={review.id} className="bg-white border border-gray-200 rounded-xl p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="font-semibold text-gray-900">{review.product}</p>
                  <p className="text-sm text-gray-500">Por {review.user}</p>
                </div>
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />
                  ))}
                </div>
              </div>
              <p className="text-gray-700 mb-4">{review.comment}</p>
              <div className="flex gap-2">
                <button
                  onClick={() => moderateReview(review.id, true)}
                  className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200"
                >
                  <ThumbsUp className="w-4 h-4" />
                  Aprobar
                </button>
                <button
                  onClick={() => moderateReview(review.id, false)}
                  className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200"
                >
                  <ThumbsDown className="w-4 h-4" />
                  Rechazar
                </button>
              </div>
            </div>
          ))}
          
          {reviews.filter(r => r.status === 'PENDING').length === 0 && (
            <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
              <CheckCircle className="w-12 h-12 text-slate-500 mx-auto mb-3" />
              <p className="text-gray-600">No hay reviews pendientes de moderación</p>
            </div>
          )}
        </div>
      )}

      {/* Reports Tab */}
      {activeTab === 'reports' && (
        <div className="space-y-4">
          {reports.filter(r => r.status === 'PENDING').map(report => (
            <div key={report.id} className="bg-white border border-orange-200 rounded-xl p-6 border-l-4 border-l-orange-500">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <Flag className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      report.type === 'USER' ? 'bg-blue-100 text-blue-700' :
                      report.type === 'PRODUCT' ? 'bg-slate-100 text-slate-700' :
                      'bg-purple-100 text-purple-700'
                    }`}>
                      {report.type}
                    </span>
                    <p className="text-sm text-gray-500 mt-1">Reportado: {new Date(report.createdAt).toLocaleDateString('es-AR')}</p>
                  </div>
                </div>
              </div>
              
              <div className="mb-4">
                <p className="text-sm text-gray-600 font-medium">Razón del reporte:</p>
                <p className="text-gray-800">{report.reason}</p>
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={() => resolveReport(report.id, 'resolve')}
                  className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200"
                >
                  <CheckCircle className="w-4 h-4" />
                  Tomar acción
                </button>
                <button
                  onClick={() => resolveReport(report.id, 'dismiss')}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                >
                  <XCircle className="w-4 h-4" />
                  Descartar
                </button>
              </div>
            </div>
          ))}
          
          {reports.filter(r => r.status === 'PENDING').length === 0 && (
            <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
              <CheckCircle className="w-12 h-12 text-slate-500 mx-auto mb-3" />
              <p className="text-gray-600">No hay reportes pendientes</p>
            </div>
          )}
        </div>
      )}

      {/* Tickets Tab */}
      {activeTab === 'tickets' && (
        <div className="space-y-6">
          {/* Ticket Stats */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="bg-white border border-gray-200 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Abiertos</p>
                  <p className="text-xl font-bold text-red-600">{ticketStats.open || 0}</p>
                </div>
              </div>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Clock className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">En Progreso</p>
                  <p className="text-xl font-bold text-blue-600">{ticketStats.inProgress || 0}</p>
                </div>
              </div>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <AlertTriangle className="w-5 h-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Pendiente</p>
                  <p className="text-xl font-bold text-yellow-600">{ticketStats.pending || 0}</p>
                </div>
              </div>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-slate-100 rounded-lg">
                  <Check className="w-5 h-5 text-slate-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Resueltos</p>
                  <p className="text-xl font-bold text-slate-600">{ticketStats.resolved || 0}</p>
                </div>
              </div>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gray-100 rounded-lg">
                  <Ticket className="w-5 h-5 text-gray-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total</p>
                  <p className="text-xl font-bold text-gray-600">{ticketStats.total || 0}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Tickets List */}
          <div className="space-y-4">
            {tickets.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
                <Ticket className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600">No hay tickets de soporte</p>
              </div>
            ) : (
              tickets.map(ticket => (
                <div key={ticket.id} className="bg-white border border-gray-200 rounded-xl p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${
                        ticket.status === 'OPEN' ? 'bg-red-100' :
                        ticket.status === 'IN_PROGRESS' ? 'bg-blue-100' :
                        ticket.status === 'RESOLVED' ? 'bg-slate-100' : 'bg-gray-100'
                      }`}>
                        <Ticket className={`w-5 h-5 ${
                          ticket.status === 'OPEN' ? 'text-red-600' :
                          ticket.status === 'IN_PROGRESS' ? 'text-blue-600' :
                          ticket.status === 'RESOLVED' ? 'text-slate-600' : 'text-gray-600'
                        }`} />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{ticket.ticketNumber}</p>
                        <p className="text-sm text-gray-500">{ticket.subject}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        ticket.status === 'OPEN' ? 'bg-red-100 text-red-700' :
                        ticket.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-700' :
                        ticket.status === 'PENDING_RESPONSE' ? 'bg-yellow-100 text-yellow-700' :
                        ticket.status === 'RESOLVED' ? 'bg-slate-100 text-slate-700' : 'bg-gray-100 text-gray-700'
                      }`}>
                        {ticket.status === 'OPEN' ? 'Abierto' :
                         ticket.status === 'IN_PROGRESS' ? 'En Progreso' :
                         ticket.status === 'PENDING_RESPONSE' ? 'Pendiente' :
                         ticket.status === 'RESOLVED' ? 'Resuelto' : 'Cerrado'}
                      </span>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        ticket.priority === 'URGENT' ? 'bg-red-100 text-red-700' :
                        ticket.priority === 'HIGH' ? 'bg-orange-100 text-orange-700' :
                        ticket.priority === 'MEDIUM' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-700'
                      }`}>
                        {ticket.priority === 'URGENT' ? 'Urgente' :
                         ticket.priority === 'HIGH' ? 'Alta' :
                         ticket.priority === 'MEDIUM' ? 'Media' : 'Baja'}
                      </span>
                    </div>
                  </div>
                  
                  <p className="text-gray-600 mb-4">{ticket.description}</p>
                  
                  <div className="flex justify-between items-center text-sm text-gray-500 mb-4">
                    <div>
                      <span>Usuario: {ticket.user?.firstName} {ticket.user?.lastName}</span>
                      <span className="mx-2">•</span>
                      <span>{ticket.user?.email}</span>
                    </div>
                    <span>{new Date(ticket.createdAt).toLocaleDateString('es-AR')}</span>
                  </div>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={() => { setSelectedTicket(ticket); setTicketResolution(''); }}
                      className="flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200"
                    >
                      <MessageSquare className="w-4 h-4" />
                      Gestionar
                    </button>
                    {ticket.status === 'OPEN' && (
                      <button
                        onClick={() => updateTicketStatus(ticket.id, 'IN_PROGRESS')}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200"
                      >
                        <Clock className="w-4 h-4" />
                        Tomar
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Ticket Management Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-xl font-semibold">Gestionar Ticket</h3>
                <p className="text-sm text-gray-500">{selectedTicket.ticketNumber}</p>
              </div>
              <button onClick={() => setSelectedTicket(null)} className="text-gray-400 hover:text-gray-600">
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <p className="text-sm text-gray-500">Asunto</p>
                <p className="font-semibold">{selectedTicket.subject}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Descripción</p>
                <p className="text-gray-700">{selectedTicket.description}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Usuario</p>
                  <p>{selectedTicket.user?.firstName} {selectedTicket.user?.lastName}</p>
                  <p className="text-sm text-gray-500">{selectedTicket.user?.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Estado Actual</p>
                  <p className="font-semibold">
                    {selectedTicket.status === 'OPEN' ? 'Abierto' :
                     selectedTicket.status === 'IN_PROGRESS' ? 'En Progreso' :
                     selectedTicket.status === 'PENDING_RESPONSE' ? 'Pendiente' :
                     selectedTicket.status === 'RESOLVED' ? 'Resuelto' : 'Cerrado'}
                  </p>
                </div>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Resolución / Comentario
              </label>
              <textarea
                value={ticketResolution}
                onChange={(e) => setTicketResolution(e.target.value)}
                placeholder="Describe cómo se resolvió el problema..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                rows={3}
              />
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => updateTicketStatus(selectedTicket.id, 'IN_PROGRESS')}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Clock className="w-4 h-4" />
                En Progreso
              </button>
              <button
                onClick={() => updateTicketStatus(selectedTicket.id, 'RESOLVED')}
                className="flex items-center gap-2 px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700"
              >
                <CheckCircle className="w-4 h-4" />
                Resolver
              </button>
              <button
                onClick={() => updateTicketStatus(selectedTicket.id, 'PENDING_RESPONSE')}
                className="flex items-center gap-2 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
              >
                <AlertTriangle className="w-4 h-4" />
                Pendiente
              </button>
              <button
                onClick={() => updateTicketStatus(selectedTicket.id, 'CLOSED')}
                className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                <XCircle className="w-4 h-4" />
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* User Detail Modal */}
      {showUserModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-6">
              <h3 className="text-xl font-semibold">Detalles del Usuario</h3>
              <button onClick={() => setShowUserModal(false)} className="text-gray-400 hover:text-gray-600">
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center text-white text-2xl font-bold ${
                  selectedUser.role === 'ADMIN' ? 'bg-red-500' :
                  selectedUser.role === 'MODERATOR' ? 'bg-purple-500' :
                  selectedUser.role === 'INVENTORY' ? 'bg-blue-500' : 'bg-slate-500'
                }`}>
                  {selectedUser.firstName.charAt(0)}{selectedUser.lastName.charAt(0)}
                </div>
                <div>
                  <p className="text-xl font-bold text-gray-900">{selectedUser.firstName} {selectedUser.lastName}</p>
                  <p className="text-gray-500">{selectedUser.email}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-sm text-gray-500">Rol</p>
                  <p className="font-semibold">{selectedUser.role}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-sm text-gray-500">Estado</p>
                  <p className={`font-semibold ${selectedUser.enabled ? 'text-slate-600' : 'text-red-600'}`}>
                    {selectedUser.enabled ? 'Activo' : 'Suspendido'}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-sm text-gray-500">Registrado</p>
                  <p className="font-semibold">{new Date(selectedUser.createdAt).toLocaleDateString('es-AR')}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-sm text-gray-500">Pedidos</p>
                  <p className="font-semibold">{selectedUser.ordersCount}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 col-span-2">
                  <p className="text-sm text-gray-500">Advertencias</p>
                  <p className={`font-semibold ${selectedUser.warnings > 0 ? 'text-orange-600' : 'text-gray-900'}`}>
                    {selectedUser.warnings} advertencia(s)
                  </p>
                </div>
              </div>

              <div className="flex gap-2 pt-4 border-t">
                <button
                  onClick={() => { setShowUserModal(false); setShowWarningModal(true); }}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200"
                >
                  <AlertTriangle className="w-4 h-4" />
                  Advertir
                </button>
                <button
                  onClick={() => updateUserStatus(selectedUser.id, !selectedUser.enabled)}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg ${
                    selectedUser.enabled 
                      ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {selectedUser.enabled ? <Ban className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                  {selectedUser.enabled ? 'Suspender' : 'Activar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Warning Modal */}
      {showWarningModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Enviar Advertencia</h3>
            <p className="text-gray-600 mb-4">Usuario: <strong>{selectedUser.firstName} {selectedUser.lastName}</strong></p>
            <textarea
              value={warningMessage}
              onChange={(e) => setWarningMessage(e.target.value)}
              placeholder="Describe la razón de la advertencia..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 mb-4"
              rows={4}
            />
            <div className="flex gap-2">
              <button
                onClick={() => warnUser(selectedUser.id, warningMessage)}
                className="flex-1 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
              >
                Enviar Advertencia
              </button>
              <button
                onClick={() => { setShowWarningModal(false); setWarningMessage(''); }}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Moderator Chatbot */}
      <DashboardChat role="MODERATOR" />
    </div>
  );
};

export default ModeratorDashboard;