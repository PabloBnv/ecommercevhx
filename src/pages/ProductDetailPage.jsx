import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Star, ShoppingCart, Heart, ArrowLeft } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { products as allProducts } from '../data/mockData';

const mockReviews = [
  { id: 1, userId: 2, userFirstName: 'Juan', userLastName: 'Pérez', rating: 5, comment: 'Excelente producto, muy buena calidad!', createdAt: '2026-04-15T10:00:00Z' },
  { id: 2, userId: 3, userFirstName: 'María', userLastName: 'García', rating: 4, comment: 'Muy bueno, llegó rápido.', createdAt: '2026-04-10T15:30:00Z' },
  { id: 3, userId: 4, userFirstName: 'Carlos', userLastName: 'López', rating: 5, comment: ' recomiendo totalmente', createdAt: '2026-04-05T09:20:00Z' },
];

const Reviews = ({ productId, theme }) => {
  const { user } = useAuth();
  const [reviews] = useState(mockReviews.filter(r => r.id));
  const [stats] = useState({ averageRating: 4.5, reviewCount: 3 });
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const renderStars = (count, interactive = false, currentRating = 0) => {
    return [...Array(5)].map((_, i) => (
      <Star
        key={i}
        className={`w-5 h-5 ${interactive 
          ? 'cursor-pointer ' + (i < currentRating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300 hover:text-yellow-400')
          : (i < count ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300')
        }`}
        onClick={() => interactive && setRating(i + 1)}
      />
    ));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      setError('Debes iniciar sesión para dejar una reseña');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setSubmitted(true);
      setComment('');
      setRating(5);
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="mt-8">
      <div className="flex items-center gap-4 mb-6">
        <div className="flex items-center gap-2">
          {renderStars(Math.round(stats.averageRating || 0))}
          <span style={{ color: theme.colors.textSecondary }}>
            {stats.averageRating ? stats.averageRating.toFixed(1) : '0'} ({stats.reviewCount} reseñas)
          </span>
        </div>
      </div>

      {user ? (
        <form onSubmit={handleSubmit} className="p-4 rounded-lg mb-6" style={{ backgroundColor: theme.colors.bgSecondary }}>
          <h3 className="font-semibold mb-3" style={{ color: theme.colors.text }}>Deja tu reseña</h3>
          {error && <p style={{ color: '#dc2626', fontSize: '0.875rem', marginBottom: '0.5rem' }}>{error}</p>}
          
          <div className="flex items-center gap-1 mb-3">
            <span className="text-sm mr-2" style={{ color: theme.colors.text }}>Tu calificación:</span>
            {renderStars(5, true, rating)}
          </div>
          
          {submitted && (
            <p style={{ color: '#22c55e', marginBottom: '0.5rem' }}>¡Gracias por tu reseña!</p>
          )}
          
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Escribe tu comentario (opcional)"
            className="w-full p-2 rounded mb-3"
            style={{ backgroundColor: theme.colors.card, color: theme.colors.text, border: '1px solid ' + theme.colors.border }}
            rows={3}
            maxLength={500}
          />
          
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 rounded font-medium transition-colors disabled:opacity-50"
            style={{ backgroundColor: theme.colors.button, color: theme.colors.buttonText }}
          >
            {loading ? 'Enviando...' : 'Enviar Reseña'}
          </button>
        </form>
      ) : (
        <p style={{ color: theme.colors.textSecondary, marginBottom: '1rem' }}>
          <Link to="/auth" style={{ color: theme.colors.accent }}>Inicia sesión</Link> para dejar una reseña
        </p>
      )}

      <div className="space-y-4">
        {reviews.length === 0 ? (
          <p style={{ color: theme.colors.textSecondary, textAlign: 'center', padding: '1rem' }}>Aún no hay reseñas. ¡Sé el primero!</p>
        ) : (
          reviews.map((review) => (
            <div key={review.id} className="pb-4" style={{ borderBottom: '1px solid ' + theme.colors.border }}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-medium" style={{ color: theme.colors.text }}>{review.userFirstName} {review.userLastName}</span>
                  <span style={{ color: theme.colors.textSecondary }}>•</span>
                  <div className="flex">{renderStars(review.rating)}</div>
                </div>
              </div>
              {review.comment && <p style={{ color: theme.colors.textSecondary }}>{review.comment}</p>}
              <p className="text-xs mt-1" style={{ color: theme.colors.textSecondary }}>
                {new Date(review.createdAt).toLocaleDateString('es-AR')}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

const ProductDetailPage = () => {
  const { id } = useParams();
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { theme } = useTheme();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const found = allProducts.find(p => p.id === parseInt(id));
    setProduct(found || null);
    setLoading(false);
  }, [id]);

  if (loading) return <div className="text-center py-20" style={{ color: theme.colors.text }}>Cargando...</div>;
  if (!product) return <div className="text-center py-20" style={{ color: theme.colors.text }}>Producto no encontrado</div>;

  const inWishlist = isInWishlist(product.id);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <Link to="/" className="flex items-center gap-2 mb-6" style={{ color: theme.colors.textSecondary }}>
        <ArrowLeft className="w-4 h-4" /> Volver a productos
      </Link>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="relative aspect-square rounded-lg overflow-hidden" style={{ backgroundColor: theme.colors.bgSecondary }}>
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover rounded-lg shadow-lg"
            loading="lazy"
            onError={(e) => { e.target.src = 'https://picsum.photos/seed/product' + product.id + '/500/500'; }}
          />
          <button
            onClick={() => toggleWishlist(product)}
            className="absolute top-4 right-4 p-3 rounded-full shadow-lg transition-all"
            style={{ backgroundColor: inWishlist ? '#ef4444' : theme.colors.card, color: inWishlist ? 'white' : theme.colors.textSecondary }}
          >
            <Heart className={`w-6 h-6 ${inWishlist ? 'fill-current' : ''}`} />
          </button>
        </div>

        <div>
          <span className="text-sm font-medium" style={{ color: theme.colors.accent }}>
            {product.brand} • {product.category}
          </span>
          <h1 className="text-3xl font-bold mt-2 mb-2" style={{ color: theme.colors.text }}>{product.name}</h1>
          <div className="flex items-center gap-2 mb-4">
            <span className="text-2xl font-bold" style={{ color: theme.colors.accent }}>
              ${product.price?.toFixed(2)}
            </span>
            {product.originalPrice && (
              <span className="text-lg line-through" style={{ color: theme.colors.textSecondary }}>
                ${product.originalPrice?.toFixed(2)}
              </span>
            )}
            {product.originalPrice && (
              <span className="px-2 py-1 rounded text-xs font-bold text-white" style={{ backgroundColor: '#ef4444' }}>
                -{Math.round((1 - product.price / product.originalPrice) * 100)}% OFF
              </span>
            )}
          </div>
          
          {product.description && (
            <p className="mb-6" style={{ color: theme.colors.textSecondary }}>{product.description}</p>
          )}

          {product.sizes && (
            <div className="mb-4">
              <span className="text-sm font-medium mb-2 block" style={{ color: theme.colors.text }}>Tallas:</span>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map(size => (
                  <button
                    key={size}
                    className="px-3 py-1 rounded text-sm"
                    style={{ backgroundColor: theme.colors.bgSecondary, color: theme.colors.text, border: '1px solid ' + theme.colors.border }}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center gap-4 mb-6">
            <div className="flex items-center border rounded" style={{ borderColor: theme.colors.border }}>
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="px-4 py-2"
                style={{ color: theme.colors.text }}
              >
                -
              </button>
              <span className="px-4" style={{ color: theme.colors.text }}>{quantity}</span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="px-4 py-2"
                style={{ color: theme.colors.text }}
              >
                +
              </button>
            </div>
            <span style={{ color: theme.colors.textSecondary }}>
              {product.stock > 10 ? 'En stock' : product.stock > 0 ? `Solo ${product.stock} restantes` : 'Sin stock'}
            </span>
          </div>

          <button
            onClick={() => addToCart(product, quantity)}
            className="w-full py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors"
            style={{ backgroundColor: theme.colors.button, color: theme.colors.buttonText }}
          >
            <ShoppingCart className="w-5 h-5" />
            Agregar al Carrito
          </button>
        </div>
      </div>

      <Reviews productId={product.id} theme={theme} />
    </div>
  );
};

export default ProductDetailPage;