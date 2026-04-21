import React, { memo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Heart } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import ImageWithLoader from './ImageWithLoader';

const categoryColors = {
  'Sin TACC': 'bg-amber-100 text-amber-800',
  'Veganos': 'bg-emerald-100 text-emerald-800',
  'Orgánicos': 'bg-slate-100 text-slate-800',
  'Especias': 'bg-red-100 text-red-800',
  'Frutos Secos': 'bg-orange-100 text-orange-800',
  'default': 'bg-gray-100 text-gray-800'
};

const ProductCard = memo(({ product, priority = false }) => {
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const inWishlist = isInWishlist(product.id);

  const badgeColor = categoryColors[product.category?.name] || categoryColors['default'];

  const handleAddToCart = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product);
  }, [addToCart, product]);

  const handleToggleWishlist = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product);
  }, [toggleWishlist, product]);

  return (
    <Link to={`/product/${product.id}`} className="block h-full">
      <div className="bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 flex flex-col h-full" style={{ height: '100%' }}>
        <div className="relative aspect-square overflow-hidden bg-gray-50" style={{ aspectRatio: '1/1' }}>
          <ImageWithLoader 
            src={product.imageUrl} 
            alt={product.name}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
            priority={priority}
          />
          <span className={`absolute top-2 left-2 text-[10px] font-bold px-2 py-1 rounded ${badgeColor}`}>
            {product.category?.name || 'General'}
          </span>
          
          <button
            onClick={handleToggleWishlist}
            className={`absolute top-2 right-2 p-2 rounded-full shadow-md transition-all z-10 ${
              inWishlist 
                ? 'bg-red-500 text-white hover:bg-red-600' 
                : 'bg-white text-gray-400 hover:text-red-500'
            }`}
            aria-label={inWishlist ? 'Quitar de favoritos' : 'Agregar a favoritos'}
          >
            <Heart className={`w-4 h-4 ${inWishlist ? 'fill-current' : ''}`} aria-hidden="true" />
          </button>
        </div>
        
        <div className="p-4 flex flex-col flex-grow">
          <h3 className="font-semibold text-sm text-gray-800 mb-2 leading-tight min-h-[2.5rem] line-clamp-2">
            {product.name}
          </h3>
          
          <p className="text-gray-500 text-xs mb-4 flex items-center gap-1">
            {product.unit && `x ${product.unit}`}
          </p>
          
          <div className="mt-auto pt-3 border-t border-gray-100 flex items-center justify-between gap-2">
            <div className="flex flex-col">
              <span className="text-xs text-gray-400">Precio</span>
              <span className="text-lg font-bold text-slate-800">
                ${product.price?.toLocaleString('es-AR') || '0'}
              </span>
            </div>
            
            <button 
              onClick={handleAddToCart}
              className="bg-slate-700 hover:bg-slate-800 text-white px-2 py-1.5 rounded text-xs font-bold transition-colors flex items-center gap-1 whitespace-nowrap"
            >
              <ShoppingCart className="w-3 h-3" aria-hidden="true" />
              Agregar
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
});

export default ProductCard;
