import React, { useState, useEffect } from 'react';
import { Star, ShoppingCart, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { api } from '../services/api';

const FeaturedProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();
  const { addToWishlist, isInWishlist } = useWishlist();

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const data = await api.products.getAll();
      const shuffled = [...data].sort(() => 0.5 - Math.random());
      setProducts(shuffled.slice(0, 8));
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (e, product) => {
    e.preventDefault();
    addToCart(product);
  };

  const handleAddToWishlist = (e, product) => {
    e.preventDefault();
    addToWishlist(product);
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-slate-600"></div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
      {products.map(product => (
        <Link 
          key={product.id} 
          to={`/product/${product.id}`}
          className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100"
        >
          <div className="relative aspect-square overflow-hidden bg-gray-100">
            {product.imageUrl ? (
              <img 
                src={product.imageUrl} 
                alt={product.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                loading="lazy"
                decoding="async"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-gray-400 text-4xl">👕</span>
              </div>
            )}
            <button
              onClick={(e) => handleAddToWishlist(e, product)}
              className="absolute top-2 right-2 p-2 bg-white/90 rounded-full shadow-md hover:bg-white transition-colors opacity-0 group-hover:opacity-100"
              aria-label="Agregar a favoritos"
            >
              <Heart className={`w-4 h-4 ${isInWishlist(product.id) ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} />
            </button>
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4 pt-12 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={(e) => handleAddToCart(e, product)}
                className="w-full flex items-center justify-center gap-2 bg-white text-slate-700 py-2 px-4 rounded-lg font-medium hover:bg-slate-100 transition-colors"
              >
                <ShoppingCart className="w-4 h-4" />
                Agregar
              </button>
            </div>
          </div>
          <div className="p-4">
            <p className="text-xs text-slate-500 mb-1">{product.category?.name}</p>
            <h3 className="font-medium text-gray-900 text-sm md:text-base line-clamp-2 mb-2 min-h-[2.5rem]">
              {product.name}
            </h3>
            <div className="flex items-center gap-1 mb-2">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-3 h-3 text-yellow-400 fill-yellow-400" />
              ))}
              <span className="text-xs text-gray-500 ml-1">(4.0)</span>
            </div>
            <p className="text-lg font-bold text-slate-700">
              ${product.price?.toLocaleString('es-AR')}
            </p>
          </div>
        </Link>
      ))}
    </div>
  );
};

export default FeaturedProducts;
