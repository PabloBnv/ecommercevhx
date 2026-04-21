import React from 'react';
import { ShoppingCart, X, Plus, Minus, Trash2, ArrowRight } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';

const CartModal = ({ isOpen, onClose }) => {
  const { cart, removeFromCart, updateQuantity, cartTotal, clearCart } = useCart();
  const navigate = useNavigate();

  const handleCheckout = () => {
    onClose();
    navigate('/checkout');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] overflow-hidden">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      
      <div className="absolute inset-y-0 right-0 max-w-full flex">
        <div className="w-screen max-w-md animate-fade-in">
          <div className="h-full flex flex-col bg-white shadow-2xl">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <ShoppingCart className="w-6 h-6 text-slate-600" />
                <h2 className="text-xl font-bold text-gray-800">
                  Mi Carrito <span className="text-slate-600">({cart.length})</span>
                </h2>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <X className="w-6 h-6 text-gray-600" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {cart.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <div className="bg-gray-100 p-6 rounded-full mb-4">
                    <ShoppingCart className="w-12 h-12 text-gray-400" />
                  </div>
                  <p className="text-gray-500 font-medium">Tu carrito está vacío</p>
                  <button onClick={onClose} className="mt-4 text-slate-600 font-bold hover:underline">
                    ¡Empezar a comprar!
                  </button>
                </div>
              ) : (
                <ul className="space-y-4">
                  {cart.map((product) => (
                    <li key={product.id} className="flex gap-4 bg-gray-50 rounded-lg p-3">
                      <div className="w-20 h-20 border border-gray-200 rounded-lg overflow-hidden bg-white flex-shrink-0">
                        <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" loading="lazy" decoding="async" width="80" height="80" />
                      </div>

                      <div className="flex-1 flex flex-col justify-between min-w-0">
                        <div>
                          <h3 className="font-semibold text-sm text-gray-800 line-clamp-2">{product.name}</h3>
                          <p className="text-xs text-gray-500 mt-1">x {product.unit}</p>
                        </div>
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center bg-white border border-gray-200 rounded-lg">
                            <button 
                              onClick={() => updateQuantity(product.id, -1)} 
                              className="p-1 hover:bg-gray-100 transition-colors"
                            >
                              <Minus className="w-4 h-4 text-gray-600" />
                            </button>
                            <span className="px-3 font-bold text-sm">{product.quantity}</span>
                            <button 
                              onClick={() => updateQuantity(product.id, 1)} 
                              className="p-1 hover:bg-gray-100 transition-colors"
                            >
                              <Plus className="w-4 h-4 text-gray-600" />
                            </button>
                          </div>

                          <p className="font-bold text-gray-800">
                            ${(product.price * product.quantity).toLocaleString('es-AR')}
                          </p>
                        </div>
                      </div>

                      <button 
                        onClick={() => removeFromCart(product.id)}
                        className="text-gray-400 hover:text-red-500 transition-colors self-start"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {cart.length > 0 && (
              <div className="border-t border-gray-200 p-4 bg-gray-50">
                <div className="flex justify-between items-center mb-4">
                  <span className="font-bold text-gray-700">Subtotal:</span>
                  <span className="text-2xl font-bold text-gray-900">
                    ${cartTotal.toLocaleString('es-AR')}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mb-4">Envío calculado en el checkout</p>
                
                <button
                  onClick={handleCheckout}
                  disabled={cart.length === 0}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-slate-600 hover:bg-slate-700 text-white font-bold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Finalizar Compra
                  <ArrowRight className="w-5 h-5" />
                </button>
                
                <button
                  onClick={clearCart}
                  className="w-full text-center text-sm text-gray-500 hover:text-red-500 mt-3 transition-colors"
                >
                  Vaciar carrito
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartModal;
