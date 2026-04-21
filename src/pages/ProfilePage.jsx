import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, MapPin, LogOut, Phone, Mail, Lock, Edit2, Save, X, CreditCard, Shield, Settings } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api, API_URL } from '../services/api';

const ProfilePage = () => {
  const { user, logout, updateUser } = useAuth();
  const navigate = useNavigate();
  const [editingProfile, setEditingProfile] = useState(false);
  const [editingAddress, setEditingAddress] = useState(false);
  const [editingPassword, setEditingPassword] = useState(false);
  const [profileData, setProfileData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    phone: user?.phone || '',
  });
  const [addressData, setAddressData] = useState({
    address: user?.address || '',
    city: user?.city || '',
    postalCode: user?.postalCode || '',
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 3000);
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const updatedUser = await api.auth.updateProfile({
        firstName: profileData.firstName,
        lastName: profileData.lastName,
        phone: profileData.phone,
        address: user.address,
        city: user.city,
        postalCode: user.postalCode,
      });
      updateUser(updatedUser);
      setEditingProfile(false);
      showMessage('success', 'Perfil actualizado correctamente');
    } catch (err) {
      showMessage('error', err.message || 'Error al actualizar el perfil');
    }
    setLoading(false);
  };

  const handleAddressUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const updatedUser = await api.auth.updateProfile({
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        ...addressData
      });
      updateUser(updatedUser);
      setEditingAddress(false);
      showMessage('success', 'Dirección actualizada correctamente');
    } catch (err) {
      showMessage('error', err.message || 'Error al actualizar la dirección');
    }
    setLoading(false);
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showMessage('error', 'Las contraseñas no coinciden');
      return;
    }
    if (passwordData.newPassword.length < 6) {
      showMessage('error', 'La nueva contraseña debe tener al menos 6 caracteres');
      return;
    }
    setLoading(true);
    try {
      await api.auth.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setEditingPassword(false);
      showMessage('success', 'Contraseña actualizada correctamente');
    } catch (err) {
      showMessage('error', err.message || 'Error al cambiar la contraseña');
    }
    setLoading(false);
  };

  if (!user) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-700 to-slate-600 rounded-2xl p-6 mb-8 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center">
              <span className="text-3xl font-bold">{user.firstName?.charAt(0)}{user.lastName?.charAt(0)}</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold">{user.firstName} {user.lastName}</h1>
              <p className="text-slate-100">{user.email}</p>
              <span className={`inline-flex items-center gap-1 mt-2 px-3 py-1 rounded-full text-sm ${
                user.role === 'ADMIN' ? 'bg-red-500/30 text-red-100' :
                user.role === 'INVENTARIO' ? 'bg-blue-500/30 text-blue-100' :
                user.role === 'MODERATOR' ? 'bg-purple-500/30 text-purple-100' :
                'bg-white/20 text-white'
              }`}>
                <Shield className="w-3 h-3" />
                {user.role === 'INVENTARIO' ? 'Inventario' : user.role === 'CUSTOMER' ? 'Cliente' : user.role === 'MODERATOR' ? 'Moderador' : user.role === 'ADMIN' ? 'Admin' : user.role}
              </span>
            </div>
          </div>
          <Link 
            to="/dashboard" 
            className="hidden md:flex items-center gap-2 px-4 py-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
          >
            <Settings className="w-4 h-4" />
            Panel Cliente
          </Link>
        </div>
      </div>

      {/* Messages */}
      {message.text && (
        <div className={`mb-6 p-4 rounded-lg ${
          message.type === 'success' ? 'bg-slate-100 text-slate-700 border border-slate-200' : 
          'bg-red-100 text-red-700 border border-red-200'
        }`}>
          {message.text}
        </div>
      )}

      {/* Quick Links */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Link to="/dashboard" className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-lg transition-shadow flex flex-col items-center gap-2">
          <div className="p-3 bg-blue-100 rounded-lg">
            <span className="text-2xl">📊</span>
          </div>
          <span className="text-sm font-medium text-gray-700">Panel Cliente</span>
        </Link>
        
        <Link to="/favoritos" className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-lg transition-shadow flex flex-col items-center gap-2">
          <div className="p-3 bg-red-100 rounded-lg">
            <span className="text-2xl">❤️</span>
          </div>
          <span className="text-sm font-medium text-gray-700">Favoritos</span>
        </Link>
        
        <Link to="/order/tracking" className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-lg transition-shadow flex flex-col items-center gap-2">
          <div className="p-3 bg-purple-100 rounded-lg">
            <span className="text-2xl">📦</span>
          </div>
          <span className="text-sm font-medium text-gray-700">Mis Pedidos</span>
        </Link>
        
        <Link to="/" className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-lg transition-shadow flex flex-col items-center gap-2">
          <div className="p-3 bg-slate-100 rounded-lg">
            <span className="text-2xl">🛒</span>
          </div>
          <span className="text-sm font-medium text-gray-700">Ir a Comprar</span>
        </Link>
      </div>

      {/* Profile Sections */}
      <div className="space-y-6">
        {/* Personal Information */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <User className="w-5 h-5 text-slate-600" />
              Información Personal
            </h3>
            <button
              onClick={() => setEditingProfile(!editingProfile)}
              className="text-slate-600 hover:text-slate-700 flex items-center gap-1"
            >
              {editingProfile ? <X className="w-4 h-4" /> : <Edit2 className="w-4 h-4" />}
              {editingProfile ? 'Cancelar' : 'Editar'}
            </button>
          </div>

          {editingProfile ? (
            <form onSubmit={handleProfileUpdate} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                  <input
                    type="text"
                    value={profileData.firstName}
                    onChange={(e) => setProfileData({...profileData, firstName: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Apellido</label>
                  <input
                    type="text"
                    value={profileData.lastName}
                    onChange={(e) => setProfileData({...profileData, lastName: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                <input
                  type="tel"
                  value={profileData.phone}
                  onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
                  placeholder="+54 11 1234 5678"
                />
              </div>
              <div className="flex gap-2">
                <button type="submit" disabled={loading} className="flex items-center gap-2 px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 disabled:opacity-50">
                  <Save className="w-4 h-4" />
                  {loading ? 'Guardando...' : 'Guardar'}
                </button>
              </div>
            </form>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm text-gray-500">Nombre completo</label>
                <p className="font-medium">{user.firstName} {user.lastName}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">Email</label>
                <p className="font-medium flex items-center gap-2">
                  <Mail className="w-4 h-4 text-gray-400" />
                  {user.email}
                </p>
              </div>
              <div>
                <label className="text-sm text-gray-500">Teléfono</label>
                <p className="font-medium flex items-center gap-2">
                  <Phone className="w-4 h-4 text-gray-400" />
                  {user.phone || 'No definido'}
                </p>
              </div>
              <div>
                <label className="text-sm text-gray-500">Rol</label>
                <p className="font-medium">{user.role}</p>
              </div>
            </div>
          )}
        </div>

        {/* Shipping Address */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <MapPin className="w-5 h-5 text-slate-600" />
              Dirección de Envío
            </h3>
            <button
              onClick={() => setEditingAddress(!editingAddress)}
              className="text-slate-600 hover:text-slate-700 flex items-center gap-1"
            >
              {editingAddress ? <X className="w-4 h-4" /> : <Edit2 className="w-4 h-4" />}
              {editingAddress ? 'Cancelar' : 'Editar'}
            </button>
          </div>

          {editingAddress ? (
            <form onSubmit={handleAddressUpdate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Dirección</label>
                <input
                  type="text"
                  value={addressData.address}
                  onChange={(e) => setAddressData({...addressData, address: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
                  placeholder="Calle y número"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ciudad</label>
                  <input
                    type="text"
                    value={addressData.city}
                    onChange={(e) => setAddressData({...addressData, city: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
                    placeholder="Ciudad"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Código Postal</label>
                  <input
                    type="text"
                    value={addressData.postalCode}
                    onChange={(e) => setAddressData({...addressData, postalCode: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
                    placeholder="CP"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <button type="submit" disabled={loading} className="flex items-center gap-2 px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 disabled:opacity-50">
                  <Save className="w-4 h-4" />
                  {loading ? 'Guardando...' : 'Guardar'}
                </button>
              </div>
            </form>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="text-sm text-gray-500">Dirección</label>
                <p className="font-medium">{user.address || 'No definida'}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">Ciudad</label>
                <p className="font-medium">{user.city || 'No definida'}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">Código Postal</label>
                <p className="font-medium">{user.postalCode || 'No definido'}</p>
              </div>
            </div>
          )}
        </div>

        {/* Security */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Lock className="w-5 h-5 text-slate-600" />
              Seguridad
            </h3>
            <button
              onClick={() => setEditingPassword(!editingPassword)}
              className="text-slate-600 hover:text-slate-700 flex items-center gap-1"
            >
              {editingPassword ? <X className="w-4 h-4" /> : <Edit2 className="w-4 h-4" />}
              {editingPassword ? 'Cancelar' : 'Cambiar contraseña'}
            </button>
          </div>

          {editingPassword ? (
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña actual</label>
                <input
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nueva contraseña</label>
                  <input
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Confirmar contraseña</label>
                  <input
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
                  />
                </div>
              </div>
              <button type="submit" className="flex items-center gap-2 px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700">
                <Lock className="w-4 h-4" />
                Actualizar contraseña
              </button>
            </form>
          ) : (
            <p className="text-gray-600">Tu cuenta está protegida. Última actualización de contraseña: hace 30 días.</p>
          )}
        </div>

        {/* Danger Zone */}
        <div className="bg-white border border-red-200 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-red-600 mb-4">Zona de Peligro</h3>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <p className="font-medium text-gray-900">Eliminar cuenta</p>
              <p className="text-sm text-gray-500">Esta acción es permanente y no se puede deshacer</p>
            </div>
            <button className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50">
              Eliminar mi cuenta
            </button>
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 bg-gray-100 text-gray-700 py-4 rounded-xl hover:bg-gray-200 transition-colors font-medium"
        >
          <LogOut className="w-5 h-5" />
          Cerrar Sesión
        </button>
      </div>
    </div>
  );
};

export default ProfilePage;