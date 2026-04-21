import React, { useState, useCallback, memo, useRef, useEffect } from 'react';
import { ShoppingCart, User, Menu, X, LogOut, Settings, Heart, Package, Shield, Headphones, Search, ChevronDown, Palette } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Link, useNavigate } from 'react-router-dom';

const Navbar = memo(({ onCartClick }) => {
  const { cartCount } = useCart();
  const { user, logout, isAdmin, isInventory, isModerator } = useAuth();
  const { theme, themes, changeTheme, currentTheme } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isThemeMenuOpen, setIsThemeMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const themeMenuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (themeMenuRef.current && !themeMenuRef.current.contains(event.target)) {
        setIsThemeMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = useCallback(() => {
    logout();
    setIsUserMenuOpen(false);
    navigate('/');
  }, [logout, navigate]);

  const handleCartClick = useCallback(() => {
    onCartClick?.();
  }, [onCartClick]);

  const handleSearch = useCallback((e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/?search=${encodeURIComponent(searchQuery)}`);
    }
  }, [searchQuery, navigate]);

  return (
    <nav 
      className="sticky top-0 z-50 shadow-lg"
      style={{ backgroundColor: 'var(--theme-card)', borderBottom: '1px solid var(--theme-border)' }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 lg:h-20">
          <Link to="/" className="flex items-center gap-3">
            <div 
              className="text-2xl font-bold tracking-tight"
              style={{ color: 'var(--theme-text)', fontFamily: 'var(--theme-font-display)' }}
            >
              STORE
            </div>
          </Link>

          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar productos..."
                className="input-field pl-10 pr-4"
                style={{ 
                  backgroundColor: 'var(--theme-bg-secondary)',
                  borderColor: 'var(--theme-border)',
                  color: 'var(--theme-text)'
                }}
              />
              <Search 
                className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5"
                style={{ color: 'var(--theme-text-secondary)' }}
              />
            </div>
          </form>

          <div className="hidden lg:flex items-center space-x-4">
            <div className="relative" ref={themeMenuRef}>
              <button
                onClick={() => setIsThemeMenuOpen(!isThemeMenuOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg transition-colors hover:opacity-80"
                style={{ color: 'var(--theme-text)', border: '1px solid var(--theme-border)' }}
              >
                <Palette className="w-4 h-4" />
                <span className="text-sm">{theme.name}</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${isThemeMenuOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {isThemeMenuOpen && (
                <div 
                  className="theme-dropdown"
                  style={{ 
                    backgroundColor: 'var(--theme-card)', 
                    border: '1px solid var(--theme-border)',
                    boxShadow: '0 10px 40px rgba(0,0,0,0.2)'
                  }}
                >
                  {Object.values(themes).map((t) => (
                    <div
                      key={t.id}
                      onClick={() => {
                        changeTheme(t.id);
                        setIsThemeMenuOpen(false);
                      }}
                      className={`theme-option ${currentTheme === t.id ? 'active' : ''}`}
                      style={{
                        backgroundColor: currentTheme === t.id ? 'var(--theme-accent)' : 'transparent',
                        color: currentTheme === t.id ? 'var(--theme-button-text)' : 'var(--theme-text)',
                      }}
                    >
                      <div 
                        className="theme-preview"
                        style={{ 
                          backgroundColor: t.colors.bg,
                          border: `2px solid ${t.colors.accent}`
                        }}
                      >
                        <div 
                          className="w-full h-full rounded"
                          style={{ backgroundColor: t.colors.accent, opacity: 0.5 }}
                        />
                      </div>
                      <div>
                        <div className="font-medium text-sm">{t.name}</div>
                        <div className="text-xs opacity-70">{t.description}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <Link 
              to="/"
              className="text-sm font-medium transition-colors hover:opacity-75"
              style={{ color: 'var(--theme-text)' }}
            >
              Inicio
            </Link>
            <Link 
              to="/"
              className="text-sm font-medium transition-colors hover:opacity-75"
              style={{ color: 'var(--theme-text)' }}
            >
              Productos
            </Link>
            <Link 
              to="/contacto"
              className="text-sm font-medium transition-colors hover:opacity-75"
              style={{ color: 'var(--theme-text)' }}
            >
              Contacto
            </Link>
          </div>

          <div className="flex items-center space-x-2">
            <button 
              onClick={handleCartClick}
              className="relative p-2 rounded-lg transition-colors"
              style={{ 
                backgroundColor: 'var(--theme-button)',
                color: 'var(--theme-button-text)'
              }}
              aria-label="Ver carrito de compras"
            >
              <ShoppingCart className="w-5 h-5" aria-hidden="true" />
              {cartCount > 0 && (
                <span 
                  className="absolute -top-1 -right-1 text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full"
                  style={{ 
                    backgroundColor: 'var(--theme-accent)',
                    color: 'var(--theme-button-text)'
                  }}
                >
                  {cartCount > 9 ? '9+' : cartCount}
                </span>
              )}
            </button>

            {user ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 p-2 rounded-lg transition-colors"
                  style={{ border: '1px solid var(--theme-border)' }}
                >
                  <User className="w-5 h-5" style={{ color: 'var(--theme-text)' }} />
                  <span className="text-sm hidden sm:inline" style={{ color: 'var(--theme-text)' }}>
                    {user.firstName}
                  </span>
                </button>

                {isUserMenuOpen && (
                  <div 
                    className="absolute right-0 mt-2 w-56 rounded-lg shadow-xl border overflow-hidden"
                    style={{ backgroundColor: 'var(--theme-card)', borderColor: 'var(--theme-border)' }}
                  >
                    <div className="px-4 py-3" style={{ borderBottom: '1px solid var(--theme-border)' }}>
                      <p className="font-medium text-sm" style={{ color: 'var(--theme-text)' }}>
                        {user.firstName} {user.lastName}
                      </p>
                      <p className="text-xs" style={{ color: 'var(--theme-text-secondary)' }}>
                        {user.email}
                      </p>
                    </div>
                    <div className="py-1">
                      <Link 
                        to="/perfil"
                        className="flex items-center gap-3 px-4 py-2 text-sm transition-colors"
                        style={{ color: 'var(--theme-text)' }}
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <User className="w-4 h-4" /> Mi Perfil
                      </Link>
                      <Link 
                        to="/pedidos"
                        className="flex items-center gap-3 px-4 py-2 text-sm transition-colors"
                        style={{ color: 'var(--theme-text)' }}
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <Package className="w-4 h-4" /> Mis Pedidos
                      </Link>
                      <Link 
                        to="/wishlist"
                        className="flex items-center gap-3 px-4 py-2 text-sm transition-colors"
                        style={{ color: 'var(--theme-text)' }}
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <Heart className="w-4 h-4" /> Wishlist
                      </Link>
                      
                      {(isAdmin || isInventory) && (
                        <>
                          <div className="px-4 py-1 text-xs uppercase" style={{ color: 'var(--theme-text-secondary)' }}>
                            Admin
                          </div>
                          <Link 
                            to="/admin"
                            className="flex items-center gap-3 px-4 py-2 text-sm transition-colors"
                            style={{ color: 'var(--theme-text)' }}
                            onClick={() => setIsUserMenuOpen(false)}
                          >
                            <Shield className="w-4 h-4" /> Dashboard
                          </Link>
                        </>
                      )}
                      
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-4 py-2 text-sm w-full transition-colors"
                        style={{ color: '#ef4444' }}
                      >
                        <LogOut className="w-4 h-4" /> Cerrar Sesión
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link 
                to="/auth"
                className="btn-primary text-sm"
              >
                Login
              </Link>
            )}

            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden p-2 rounded-lg"
              style={{ color: 'var(--theme-text)' }}
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {isMenuOpen && (
          <div className="lg:hidden py-4 border-t" style={{ borderColor: 'var(--theme-border)' }}>
            <form onSubmit={handleSearch} className="mb-4">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar..."
                className="input-field"
              />
            </form>
            <div className="space-y-2">
              <Link 
                to="/"
                className="block py-2 text-sm font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Inicio
              </Link>
              <Link 
                to="/"
                className="block py-2 text-sm font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Productos
              </Link>
              <Link 
                to="/contacto"
                className="block py-2 text-sm font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Contacto
              </Link>
              <Link 
                to="/auth"
                className="block py-2 text-sm font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Iniciar Sesión
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
});

export default Navbar;