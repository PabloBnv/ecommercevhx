import React from 'react';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';
import { Heart, Trash2, ShoppingCart, ChevronLeft } from 'lucide-react';

const WishlistPage = () => {
  const { wishlist, removeFromWishlist, clearWishlist } = useWishlist();
  const { addToCart } = useCart();
  const navigate = useNavigate();

  const handleAddToCart = (product) => {
    addToCart(product);
    removeFromWishlist(product.id);
  };

  if (wishlist.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <div className="bg-gray-100 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
          <Heart className="w-12 h-12 text-gray-400" />
        </div>
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Tu lista de favoritos está vacía</h1>
        <p className="text-gray-500 mb-8">Guarda productos que te gusten para comprarlos después.</p>
        <button
          onClick={() => navigate('/')}
          className="bg-slate-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-slate-700"
        >
          Ver productos
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="text-gray-600 hover:text-slate-600">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h1 className="text-3xl font-bold text-gray-800">
            Mis Favoritos <span className="text-slate-600">({wishlist.length})</span>
          </h1>
        </div>
        <button
          onClick={clearWishlist}
          className="text-red-600 hover:text-red-700 text-sm font-medium"
        >
          Vaciar lista
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
        {wishlist.map(product => (
          <div key={product.id} className="bg-white rounded-xl shadow-md overflow-hidden group">
            <div className="relative aspect-square bg-gray-100">
              {product.imageUrl ? (
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="w-full h-full object-cover"
                  loading="lazy"
                  decoding="async"
                  width="300"
                  height="300"
                  onError={(e) => {
                    e.target.src = `https://placehold.co/300x300?text=${encodeURIComponent(product.name.substring(0, 10))}`;
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-200">
                  <Heart className="w-12 h-12 text-gray-400" />
                </div>
              )}
              
              <button
                onClick={() => removeFromWishlist(product.id)}
                className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md hover:bg-red-50 transition-colors"
              >
                <Trash2 className="w-4 h-4 text-red-500" />
              </button>
            </div>

            <div className="p-4">
              <h3 className="font-medium text-gray-800 text-sm mb-2 line-clamp-2 h-10">
                {product.name}
              </h3>
              <p className="text-lg font-bold text-slate-600 mb-4">
                ${product.price?.toLocaleString('es-AR')}
              </p>
              
              <button
                onClick={() => handleAddToCart(product)}
                className="w-full flex items-center justify-center gap-2 bg-slate-600 text-white py-2 rounded-lg font-medium hover:bg-slate-700 transition-colors"
              >
                <ShoppingCart className="w-4 h-4" />
                Agregar al carrito
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WishlistPage;
