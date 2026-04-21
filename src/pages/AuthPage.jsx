import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const { theme } = useTheme();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
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

  const demoCredentials = [
    { email: 'customer@test.com', password: 'customer123', role: 'Customer' },
    { email: 'admin@test.com', password: 'admin123', role: 'Admin' },
    { email: 'moderator@test.com', password: 'moderator123', role: 'Moderator' },
  ];

  const fillCredentials = (email, password) => {
    setFormData({ ...formData, email, password });
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center px-4 py-12"
      style={{
        background: `linear-gradient(135deg, ${theme.colors.accent}20 0%, ${theme.colors.bg} 50%, ${theme.colors.accent}10 100%)`,
      }}
    >
      <div 
        className="w-full max-w-md"
        style={{
          background: `${theme.colors.card}80`,
          backdropFilter: 'blur(20px)',
          border: `1px solid ${theme.colors.border}`,
          borderRadius: '24px',
          boxShadow: `0 25px 50px -12px ${theme.colors.accent}40`,
        }}
      >
        <div className="p-8">
          <div className="text-center mb-8">
            <div className="text-4xl mb-2">🛍️</div>
            <h1 
              className="text-3xl font-bold"
              style={{ color: theme.colors.text, fontFamily: theme.fonts.display }}
            >
              STORE
            </h1>
            <p style={{ color: theme.colors.textSecondary }}>
              {isLogin ? 'Bienvenido de vuelta' : 'Crea tu cuenta'}
            </p>
          </div>

          <div 
            className="rounded-xl p-4 mb-6"
            style={{ backgroundColor: theme.colors.accent + '15' }}
          >
            <p 
              className="text-sm font-semibold mb-3 text-center"
              style={{ color: theme.colors.accent }}
            >
              👇 Credenciales de Prueba
            </p>
            <div className="space-y-2">
              {demoCredentials.map((cred) => (
                <button
                  key={cred.email}
                  onClick={() => fillCredentials(cred.email, cred.password)}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all hover:scale-[1.02]"
                  style={{ 
                    backgroundColor: theme.colors.bgSecondary,
                    border: `1px solid ${theme.colors.border}`,
                  }}
                >
                  <span style={{ color: theme.colors.text }}>
                    <span className="font-semibold">{cred.role}:</span> {cred.email}
                  </span>
                  <span 
                    className="font-mono px-2 py-1 rounded text-xs"
                    style={{ 
                      backgroundColor: theme.colors.accent,
                      color: theme.colors.buttonText,
                    }}
                  >
                    {cred.password}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div 
              className="mb-4 px-4 py-3 rounded-lg text-sm"
              style={{ 
                backgroundColor: '#fee2e2',
                color: '#dc2626',
                border: '1px solid #fecaca',
              }}
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label 
                    className="block text-sm font-medium mb-1"
                    style={{ color: theme.colors.text }}
                  >
                    Nombre
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl text-sm"
                    style={{
                      backgroundColor: theme.colors.bgSecondary,
                      border: `1px solid ${theme.colors.border}`,
                      color: theme.colors.text,
                    }}
                    required={!isLogin}
                  />
                </div>
                <div>
                  <label 
                    className="block text-sm font-medium mb-1"
                    style={{ color: theme.colors.text }}
                  >
                    Apellido
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl text-sm"
                    style={{
                      backgroundColor: theme.colors.bgSecondary,
                      border: `1px solid ${theme.colors.border}`,
                      color: theme.colors.text,
                    }}
                    required={!isLogin}
                  />
                </div>
              </div>
            )}

            <div>
              <label 
                className="block text-sm font-medium mb-1"
                style={{ color: theme.colors.text }}
              >
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl text-sm"
                style={{
                  backgroundColor: theme.colors.bgSecondary,
                  border: `1px solid ${theme.colors.border}`,
                  color: theme.colors.text,
                }}
                required
              />
            </div>

            <div>
              <label 
                className="block text-sm font-medium mb-1"
                style={{ color: theme.colors.text }}
              >
                Contraseña
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl text-sm"
                style={{
                  backgroundColor: theme.colors.bgSecondary,
                  border: `1px solid ${theme.colors.border}`,
                  color: theme.colors.text,
                }}
                required
                minLength={6}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-xl font-semibold text-lg transition-all hover:scale-[1.02] hover:shadow-lg"
              style={{
                backgroundColor: theme.colors.accent,
                color: theme.colors.buttonText,
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? 'Cargando...' : isLogin ? 'Iniciar Sesión' : 'Crear Cuenta'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm transition-colors hover:underline"
              style={{ color: theme.colors.accent }}
            >
              {isLogin 
                ? '¿No tienes cuenta? Regístrate' 
                : '¿Ya tienes cuenta? Inicia sesión'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;