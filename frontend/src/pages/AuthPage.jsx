import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [creatingUsers, setCreatingUsers] = useState(false);
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const fillCredentials = (email, password) => {
    setFormData({ ...formData, email, password });
  };

  const createTestUsers = async () => {
    setCreatingUsers(true);
    alert('Para pruebas usa:\n- admin@test.com / admin123\n- customer@test.com / customer123\n- moderator@test.com / moderator123');
    setCreatingUsers(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        await login(formData.email, formData.password);
      } else {
        await register(formData);
      }
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-800">
              {isLogin ? 'Iniciar Sesión' : 'Crear Cuenta'}
            </h1>
            <p className="text-gray-500 mt-2">
              {isLogin ? 'Bienvenido de vuelta' : 'Regístrate para comprar'}
            </p>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
                required
                minLength={6}
              />
            </div>

            {!isLogin && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Apellido</label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Dirección</label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Ciudad</label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Código Postal</label>
                    <input
                      type="text"
                      name="postalCode"
                      value={formData.postalCode}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
                    />
                  </div>
                </div>
              </>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-slate-600 text-white font-bold py-3 rounded-lg hover:bg-slate-700 transition-colors disabled:opacity-50"
            >
              {loading ? 'Cargando...' : (isLogin ? 'Ingresar' : 'Registrarse')}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-slate-600 hover:underline"
            >
              {isLogin ? '¿No tienes cuenta? Regístrate' : '¿Ya tienes cuenta? Inicia sesión'}
            </button>
          </div>
        </div>
        
        {isLogin && (
          <div className="mt-8 border-2 border-yellow-400 rounded-xl p-5 bg-gradient-to-r from-yellow-50 to-orange-50">
            <div className="flex items-center justify-center gap-3 mb-4">
              <span className="bg-yellow-500 text-white px-3 py-1 rounded-full text-xs font-bold tracking-wide">ESTADO DE PRUEBA</span>
              <p className="text-base font-bold text-yellow-800">Hacé clic para autocompletar:</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div 
                onClick={() => fillCredentials('cliente@test.com', 'cliente123')}
                className="bg-white rounded-xl p-3 shadow-sm border-l-4 border-blue-500 cursor-pointer hover:bg-blue-50 hover:scale-105 transition-all"
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">👤</span>
                  <p className="font-bold text-gray-800">Cliente</p>
                </div>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Email:</span>
                    <code className="font-mono text-blue-700 bg-white px-1 rounded text-[10px]">cliente@test.com</code>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Pass:</span>
                    <code className="font-mono text-slate-700 bg-white px-1 rounded text-[10px]">cliente123</code>
                  </div>
                </div>
              </div>
              
              <div 
                onClick={() => fillCredentials('inventario@test.com', 'inventario123')}
                className="bg-white rounded-xl p-3 shadow-sm border-l-4 border-slate-500 cursor-pointer hover:bg-slate-50 hover:scale-105 transition-all"
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">📦</span>
                  <p className="font-bold text-gray-800">Encargado Inv.</p>
                </div>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Email:</span>
                    <code className="font-mono text-blue-700 bg-white px-1 rounded text-[10px]">vendedor@test.com</code>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Pass:</span>
                    <code className="font-mono text-slate-700 bg-white px-1 rounded text-[10px]">vendedor123</code>
                  </div>
                </div>
              </div>
              
              <div 
                onClick={() => fillCredentials('moderador@test.com', 'moderador123')}
                className="bg-white rounded-xl p-3 shadow-sm border-l-4 border-purple-500 cursor-pointer hover:bg-purple-50 hover:scale-105 transition-all"
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">👮</span>
                  <p className="font-bold text-gray-800">Moderador</p>
                </div>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Email:</span>
                    <code className="font-mono text-blue-700 bg-white px-1 rounded text-[10px]">moderador@test.com</code>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Pass:</span>
                    <code className="font-mono text-slate-700 bg-white px-1 rounded text-[10px]">moderador123</code>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-4 text-center">
              <p className="text-xs text-yellow-700 font-medium">🔒 El usuario admin no se muestra públicamente por seguridad</p>
              <button
                onClick={createTestUsers}
                disabled={creatingUsers}
                className="mt-3 px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 disabled:opacity-50 text-sm font-medium"
              >
                {creatingUsers ? 'Creando...' : '🔧 Crear usuarios de prueba'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthPage;
