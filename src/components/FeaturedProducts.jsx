import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { products as allProducts } from '../data/mockData';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useRef } from 'react';

const FeaturedProducts = () => {
  const { addToCart } = useCart();
  const { addToWishlist, isInWishlist } = useWishlist();
  const scrollRef = useRef(null);
  
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

  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -300 : 300;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  if (featuredProducts.length === 0) {
    return null;
  }

  return (
    <div className="relative group">
      <div 
        className="flex gap-4 overflow-x-auto scrollbar-hide px-2 py-4"
        style={{ scrollSnapType: 'x mandatory' }}
        ref={scrollRef}
      >
        {featuredProducts.map(product => (
          <Link 
            key={product.id} 
            to={`/product/${product.id}`}
            className="flex-shrink-0 w-48 md:w-56 rounded-xl overflow-hidden transition-all hover:shadow-lg"
            style={{ 
              backgroundColor: 'var(--theme-card)',
              border: '1px solid var(--theme-border)',
              scrollSnapAlign: 'start',
            }}
          >
            <div className="relative aspect-square overflow-hidden bg-gray-100">
              <img 
                src={product.image} 
                alt={product.name}
                className="w-full h-full object-cover"
                loading="lazy"
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/400?text=Producto';
                }}
              />
              <button
                onClick={(e) => handleAddToWishlist(e, product)}
                className="absolute top-2 right-2 p-1.5 rounded-full shadow-md"
                style={{ 
                  backgroundColor: 'var(--theme-card)',
                }}
                aria-label="Agregar a favoritos"
              >
                <svg 
                  className={`w-3 h-3 ${isInWishlist(product.id) ? 'fill-red-500 text-red-500' : ''}`} 
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
                  className="absolute top-2 left-2 px-2 py-0.5 text-[10px] font-bold rounded-full"
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
            <div className="p-3">
              <p 
                className="text-[10px] uppercase tracking-wide"
                style={{ color: 'var(--theme-text-secondary)' }}
              >
                {product.brand}
              </p>
              <h3 
                className="font-medium text-xs line-clamp-2 mb-1"
                style={{ color: 'var(--theme-text)' }}
              >
                {product.name}
              </h3>
              <div className="flex items-center gap-1">
                <span 
                  className="text-sm font-bold"
                  style={{ color: 'var(--theme-accent)' }}
                >
                  ${product.price?.toFixed(2)}
                </span>
                {product.originalPrice && (
                  <span 
                    className="text-xs line-through opacity-50"
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
      
      <button 
        onClick={() => scroll('left')}
        className="absolute left-0 top-1/2 -translate-y-1/2 p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-10"
        style={{ 
          backgroundColor: 'var(--theme-card)',
          border: '1px solid var(--theme-border)',
        }}
        aria-label="Deslizar izquierda"
      >
        <ChevronLeft className="w-4 h-4" style={{ color: 'var(--theme-text)' }} />
      </button>
      <button 
        onClick={() => scroll('right')}
        className="absolute right-0 top-1/2 -translate-y-1/2 p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-10"
        style={{ 
          backgroundColor: 'var(--theme-card)',
          border: '1px solid var(--theme-border)',
        }}
        aria-label="Deslizar derecha"
      >
        <ChevronRight className="w-4 h-4" style={{ color: 'var(--theme-text)' }} />
      </button>
    </div>
  );
};

export default FeaturedProducts;