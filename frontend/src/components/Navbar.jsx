import React, { useState, useCallback, memo } from 'react';
import { ShoppingCart, User, Menu, X, LogOut, Settings, Heart, Package, Shield, Headphones } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

const Navbar = memo(({ onCartClick }) => {
  const { cartCount } = useCart();
  const { user, logout, isAdmin, isInventory, isModerator } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = useCallback(() => {
    logout();
    setIsUserMenuOpen(false);
    navigate('/');
  }, [logout, navigate]);

  const handleCartClick = useCallback(() => {
    onCartClick?.();
  }, [onCartClick]);

  const toggleUserMenu = useCallback(() => {
    setIsUserMenuOpen(prev => !prev);
  }, []);

  const toggleMenu = useCallback(() => {
    setIsMenuOpen(prev => !prev);
  }, []);

  const closeUserMenu = useCallback(() => setIsUserMenuOpen(false), []);
  const closeMenu = useCallback(() => setIsMenuOpen(false), []);

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center gap-2">
            <img 
              src="/logo.svg" 
              alt="Style Store" 
              className="h-12 w-32 object-contain"
              width="128"
              height="48"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          </Link>

          <div className="hidden lg:flex items-center space-x-6">
            <Link to="/" className="text-gray-700 hover:text-slate-600 font-medium text-sm transition-colors">Inicio</Link>
            <div className="relative group">
              <span className="text-gray-700 hover:text-slate-600 font-medium text-sm cursor-pointer flex items-center gap-1 transition-colors">
                Nosotros ▾
              </span>
              <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 border border-gray-100">
                <a href="#" className="block px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 rounded-t-lg">La empresa</a>
                <a href="#" className="block px-4 py-3 text-sm text-gray-700 hover:bg-gray-50">Preguntas frecuentes</a>
                <a href="#" className="block px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 rounded-b-lg">Devoluciones</a>
              </div>
            </div>
            <Link to="/" className="text-slate-600 font-bold text-sm">Productos</Link>
            <Link to="/contacto" className="text-gray-700 hover:text-slate-600 font-medium text-sm transition-colors">Contacto</Link>
          </div>

          <div className="flex items-center space-x-3">
            <button 
              onClick={handleCartClick}
              className="relative p-2 bg-slate-700 hover:bg-slate-800 text-white rounded-lg transition-colors"
              aria-label="Ver carrito de compras"
            >
              <ShoppingCart className="w-5 h-5" aria-hidden="true" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full">
                  {cartCount > 9 ? '9+' : cartCount}
                </span>
              )}
            </button>

            {user ? (
              <div className="relative">
                <button
                  onClick={toggleUserMenu}
                  className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <User className="w-5 h-5 text-gray-600" />
                  <span className="hidden md:block text-sm text-gray-700">{user.firstName}</span>
                </button>
                
                {isUserMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-100">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-sm font-medium">{user.firstName} {user.lastName}</p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                    {isAdmin && (
                      <Link 
                        to="/admin"
                        className="flex items-center gap-2 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50"
                        onClick={closeUserMenu}
                      >
                        <Settings className="w-4 h-4" />
                        Panel Admin
                      </Link>
                    )}
                    {isInventory && (
                      <Link 
                        to="/seller"
                        className="flex items-center gap-2 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50"
                        onClick={closeUserMenu}
                      >
                        <Package className="w-4 h-4" />
                        Gestor Inventario
                      </Link>
                    )}
                    {isModerator && (
                      <Link 
                        to="/moderator"
                        className="flex items-center gap-2 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50"
                        onClick={closeUserMenu}
                      >
                        <Shield className="w-4 h-4" />
                        Panel Moderador
                      </Link>
                    )}
                    {user?.role === 'CUSTOMER' && (
                      <Link 
                        to="/dashboard"
                        className="flex items-center gap-2 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50"
                        onClick={closeUserMenu}
                      >
                        <Settings className="w-4 h-4" />
                        Mi Panel
                      </Link>
                    )}
                    <Link 
                      to="/support"
                      className="flex items-center gap-2 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50"
                      onClick={closeUserMenu}
                    >
                      <Headphones className="w-4 h-4" />
                      Soporte
                    </Link>
                    <Link 
                      to="/profile"
                      className="flex items-center gap-2 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50"
                      onClick={closeUserMenu}
                    >
                      <User className="w-4 h-4" />
                      Mi Perfil
                    </Link>
                    <Link 
                      to="/favoritos"
                      className="flex items-center gap-2 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50"
                      onClick={closeUserMenu}
                    >
                      <Heart className="w-4 h-4" />
                      Favoritos
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2 w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-gray-50 rounded-b-lg"
                    >
                      <LogOut className="w-4 h-4" />
                      Cerrar sesión
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/auth"
                className="hidden md:flex items-center gap-2 px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors text-sm font-medium"
              >
                <User className="w-4 h-4" />
                Ingresar
              </Link>
            )}

            <button 
              onClick={toggleMenu}
              className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label={isMenuOpen ? "Cerrar menú" : "Abrir menú"}
              aria-expanded={isMenuOpen}
            >
              {isMenuOpen ? <X className="w-6 h-6" aria-hidden="true" /> : <Menu className="w-6 h-6" aria-hidden="true" />}
            </button>
          </div>
        </div>

        {isMenuOpen && (
          <div className="lg:hidden py-4 border-t border-gray-100">
            <div className="flex flex-col space-y-3">
              <Link to="/" className="text-gray-700 hover:text-slate-600 font-medium py-2" onClick={closeMenu}>Inicio</Link>
              <Link to="/" className="text-slate-600 font-bold py-2" onClick={closeMenu}>Productos</Link>
              {!user && (
                <Link to="/auth" className="text-slate-600 font-medium py-2 md:hidden" onClick={closeMenu}>
                  Ingresar / Registrarse
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
});

export default Navbar;
