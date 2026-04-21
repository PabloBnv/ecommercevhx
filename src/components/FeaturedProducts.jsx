import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { products as allProducts } from '../data/mockData';

const FeaturedProducts = () => {
  const { addToCart } = useCart();
  const { addToWishlist, isInWishlist } = useWishlist();
  
  const featuredProducts = allProducts.filter(p => p.featured).slice(0, 8);

  const handleAddToCart = (e, product) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product);
  };

  const handleAddToWishlist = (e, product) => {
    e.preventDefault();
    e.stopPropagation();
    addToWishlist(product);
  };

  if (featuredProducts.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
      {featuredProducts.map(product => (
        <Link 
          key={product.id} 
          to={`/product/${product.id}`}
          className="group rounded-xl overflow-hidden card-hover"
          style={{ 
            backgroundColor: 'var(--theme-card)',
            border: '1px solid var(--theme-border)'
          }}
        >
          <div className="relative aspect-square overflow-hidden bg-gray-100">
            <img 
              src={product.image} 
              alt={product.name}
              className="w-full h-full object-cover product-image-hover"
              loading="lazy"
              decoding="async"
              onError={(e) => {
                e.target.src = 'https://via.placeholder.com/600x600?text=Producto';
              }}
            />
            <button
              onClick={(e) => handleAddToWishlist(e, product)}
              className="absolute top-3 right-3 p-2 rounded-full shadow-md transition-all hover:scale-110"
              style={{ 
                backgroundColor: 'var(--theme-card)',
                opacity: 0.9
              }}
              aria-label="Agregar a favoritos"
            >
              <svg 
                className={`w-4 h-4 ${isInWishlist(product.id) ? 'fill-red-500 text-red-500' : ''}`} 
                style={{ color: isInWishlist(product.id) ? '#ef4444' : 'var(--theme-text-secondary)' }}
                fill={isInWishlist(product.id) ? 'currentColor' : 'none'}
                viewBox="0 0 24 24" 
                stroke="currentColor" 
                strokeWidth="2"
              >
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
            </button>
            {product.badge && (
              <div 
                className={`badge absolute top-3 left-3 badge-${product.badge.toLowerCase().replace(' ', '-')}`}
                style={{
                  backgroundColor: product.badge === 'NEW' ? 'var(--theme-accent)' : 
                               product.badge === 'SALE' ? '#ef4444' : 
                               product.badge === 'HOT' ? '#f97316' : 
                               '#eab308',
                  color: product.badge === 'BEST SELLER' ? '#1a1a1a' : 'white'
                }}
              >
                {product.badge}
              </div>
            )}
          </div>
          <div className="p-4">
            <p 
              className="text-xs mb-1 uppercase tracking-wide"
              style={{ color: 'var(--theme-text-secondary)' }}
            >
              {product.brand}
            </p>
            <h3 
              className="font-medium text-sm md:text-base line-clamp-2 mb-2 min-h-[2.5rem]"
              style={{ color: 'var(--theme-text)' }}
            >
              {product.name}
            </h3>
            <div className="flex items-center gap-2">
              <span 
                className="text-lg font-bold"
                style={{ color: 'var(--theme-accent)' }}
              >
                ${product.price?.toFixed(2)}
              </span>
              {product.originalPrice && (
                <span 
                  className="text-sm line-through opacity-60"
                  style={{ color: 'var(--theme-text-secondary)' }}
                >
                  ${product.originalPrice?.toFixed(2)}
                </span>
              )}
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
};

export default FeaturedProducts;