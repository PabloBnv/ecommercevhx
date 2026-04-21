import React, { memo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Heart, Star } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useTheme } from '../context/ThemeContext';

const badgeStyles = {
  'NEW': { bg: 'bg-blue-500', text: 'text-white' },
  'SALE': { bg: 'bg-red-500', text: 'text-white' },
  'HOT': { bg: 'bg-orange-500', text: 'text-white' },
  'BEST SELLER': { bg: 'bg-yellow-500', text: 'text-black' },
};

const categoryColors = {
  'sneakers': 'from-red-500 to-orange-500',
  'streetwear': 'from-blue-500 to-cyan-500',
  'sport': 'from-green-500 to-emerald-500',
  'formal': 'from-purple-500 to-pink-500',
  'accessories': 'from-yellow-500 to-amber-500',
};

const ProductCard = memo(({ product, priority = false }) => {
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { theme } = useTheme();
  const inWishlist = isInWishlist(product.id);

  const badgeClass = badgeStyles[product.badge] || { bg: 'bg-gray-500', text: 'text-white' };
  const categoryGradient = categoryColors[product.category] || categoryColors['accessories'];

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
    <Link 
      to={`/product/${product.id}`} 
      className="block h-full group"
      style={{ color: theme.colors.text }}
    >
      <div 
        className="rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 flex flex-col h-full"
        style={{ 
          backgroundColor: theme.colors.card,
          border: `1px solid ${theme.colors.border}`,
          boxShadow: `0 4px 20px ${theme.colors.bg}10`,
        }}
      >
        <div className="relative aspect-square overflow-hidden bg-gray-100">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            loading={priority ? 'eager' : 'lazy'}
            onError={(e) => {
              e.target.src = `https://picsum.photos/seed/product${product.id}/800/800`;
            }}
          />
          
          <div 
            className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${badgeClass.bg} ${badgeClass.text}`}
          >
            {product.badge || product.category}
          </div>
          
          <button
            onClick={handleToggleWishlist}
            className="absolute top-3 right-3 p-2 rounded-full shadow-lg transition-all z-10 hover:scale-110"
            style={{ 
              backgroundColor: inWishlist ? '#ef4444' : theme.colors.card,
              color: inWishlist ? 'white' : theme.colors.textSecondary,
            }}
            aria-label={inWishlist ? 'Quitar de favoritos' : 'Agregar a favoritos'}
          >
            <Heart className={`w-5 h-5 ${inWishlist ? 'fill-current' : ''}`} />
          </button>
          
          <div 
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center bg-black/40"
          >
            <button
              onClick={handleAddToCart}
              className="px-6 py-3 rounded-xl font-semibold text-sm flex items-center gap-2 hover:scale-105 transition-transform"
              style={{
                backgroundColor: theme.colors.accent,
                color: theme.colors.buttonText,
              }}
            >
              <ShoppingCart className="w-4 h-4" />
              Agregar
            </button>
          </div>
        </div>
        
        <div className="p-4 flex flex-col flex-grow">
          <div className="flex items-center gap-2 mb-2">
            <div className={`w-4 h-4 rounded-full bg-gradient-to-br ${categoryGradient}`} />
            <span 
              className="text-xs font-medium uppercase tracking-wide"
              style={{ color: theme.colors.textSecondary }}
            >
              {product.brand}
            </span>
          </div>
          
          <h3 
            className="font-bold text-base md:text-lg mb-2 line-clamp-2"
            style={{ color: theme.colors.text }}
          >
            {product.name}
          </h3>
          
          <p 
            className="text-sm line-clamp-2 mb-4"
            style={{ color: theme.colors.textSecondary }}
          >
            {product.description}
          </p>
          
          <div className="mt-auto space-y-2">
            {product.sizes && (
              <div className="flex flex-wrap gap-1">
                {product.sizes.slice(0, 5).map((size) => (
                  <span 
                    key={size}
                    className="px-2 py-1 text-xs rounded"
                    style={{ 
                      backgroundColor: theme.colors.bgSecondary,
                      color: theme.colors.textSecondary,
                    }}
                  >
                    {size}
                  </span>
                ))}
                {product.sizes.length > 5 && (
                  <span 
                    className="px-2 py-1 text-xs rounded"
                    style={{ 
                      backgroundColor: theme.colors.bgSecondary,
                      color: theme.colors.textSecondary,
                    }}
                  >
                    +{product.sizes.length - 5}
                  </span>
                )}
              </div>
            )}
            
            <div className="flex items-center justify-between pt-3" style={{ borderTop: `1px solid ${theme.colors.border}` }}>
              <div className="flex flex-col">
                <div className="flex items-center gap-1">
                  <span className="text-xl font-bold" style={{ color: theme.colors.accent }}>
                    ${product.price?.toFixed(2)}
                  </span>
                  {product.originalPrice && (
                    <span 
                      className="text-sm line-through"
                      style={{ color: theme.colors.textSecondary }}
                    >
                      ${product.originalPrice?.toFixed(2)}
                    </span>
                  )}
                </div>
                {product.originalPrice && (
                  <span className="text-xs font-semibold text-red-500">
                    -{Math.round((1 - product.price / product.originalPrice) * 100)}% OFF
                  </span>
                )}
              </div>
              
              <div className="flex items-center gap-1">
                {[1,2,3,4,5].map((i) => (
                  <Star 
                    key={i}
                    className="w-3 h-3"
                    style={{ color: '#fbbf24', fill: '#fbbf24' }}
                  />
                ))}
                <span className="text-xs" style={{ color: theme.colors.textSecondary }}>
                  (4.5)
                </span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span 
                className="text-xs"
                style={{ color: product.stock > 10 ? theme.colors.textSecondary : '#ef4444' }}
              >
                {product.stock > 10 ? 'En stock' : product.stock > 0 ? `Solo ${product.stock} restantes` : 'Sin stock'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
});

export default ProductCard;