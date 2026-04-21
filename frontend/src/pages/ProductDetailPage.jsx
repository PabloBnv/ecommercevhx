import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Star, ShoppingCart, Heart, ArrowLeft, Trash2 } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import { API_URL } from '../services/api';

const Reviews = ({ productId }) => {
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState({ averageRating: 0, reviewCount: 0 });
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchReviews = async () => {
    try {
      const res = await fetch(`${API_URL}/api/reviews/product/${productId}`);
      if (res.ok) {
        const data = await res.json();
        setReviews(data);
      }
    } catch (err) {
      console.error('Error fetching reviews:', err);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await fetch(`${API_URL}/api/reviews/product/${productId}/stats`);
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  useEffect(() => {
    fetchReviews();
    fetchStats();
  }, [productId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      setError('Debes iniciar sesión para dejar una reseña');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/api/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ rating, comment, productId })
      });

      if (res.ok) {
        setComment('');
        setRating(5);
        fetchReviews();
        fetchStats();
      } else {
        const data = await res.json();
        setError(data.error || 'Error al enviar reseña');
      }
    } catch (err) {
      setError('Error al enviar reseña');
    }
    setLoading(false);
  };

  const handleDelete = async (reviewId) => {
    if (!confirm('¿Eliminar esta reseña?')) return;

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/api/reviews/${reviewId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.ok) {
        fetchReviews();
        fetchStats();
      }
    } catch (err) {
      console.error('Error deleting review:', err);
    }
  };

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

  return (
    <div className="mt-8">
      <div className="flex items-center gap-4 mb-6">
        <div className="flex items-center gap-2">
          {renderStars(Math.round(stats.averageRating || 0))}
          <span className="text-gray-600">
            {stats.averageRating ? stats.averageRating.toFixed(1) : '0'} ({stats.reviewCount} reseñas)
          </span>
        </div>
      </div>

      {user && (
        <form onSubmit={handleSubmit} className="bg-gray-50 p-4 rounded-lg mb-6">
          <h3 className="font-semibold mb-3">Deja tu reseña</h3>
          {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
          
          <div className="flex items-center gap-1 mb-3">
            <span className="text-sm mr-2">Tu calificación:</span>
            {renderStars(5, true, rating)}
          </div>
          
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Escribe tu comentario (opcional)"
            className="w-full p-2 border rounded mb-3"
            rows={3}
            maxLength={500}
          />
          
          <button
            type="submit"
            disabled={loading}
            className="bg-slate-600 text-white px-4 py-2 rounded hover:bg-slate-700 disabled:opacity-50"
          >
            {loading ? 'Enviando...' : 'Enviar Reseña'}
          </button>
        </form>
      )}

      {!user && (
        <p className="text-gray-500 mb-4">
          <Link to="/auth" className="text-slate-600 hover:underline">Inicia sesión</Link> para dejar una reseña
        </p>
      )}

      <div className="space-y-4">
        {reviews.length === 0 ? (
          <p className="text-gray-500 text-center py-4">Aún no hay reseñas. ¡Sé el primero!</p>
        ) : (
          reviews.map((review) => (
            <div key={review.id} className="border-b pb-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{review.userFirstName} {review.userLastName}</span>
                  <span className="text-gray-400">•</span>
                  <div className="flex">{renderStars(review.rating)}</div>
                </div>
                {(user?.id === review.userId || user?.role === 'ADMIN') && (
                  <button onClick={() => handleDelete(review.id)} className="text-gray-400 hover:text-red-500">
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
              {review.comment && <p className="text-gray-600">{review.comment}</p>}
              <p className="text-xs text-gray-400 mt-1">
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
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(`${API_URL}/api/products/${id}`);
        if (res.ok) {
          const data = await res.json();
          setProduct(data);
        }
      } catch (err) {
        console.error('Error:', err);
      }
      setLoading(false);
    };
    fetchProduct();
  }, [id]);

  if (loading) return <div className="text-center py-20">Cargando...</div>;
  if (!product) return <div className="text-center py-20">Producto no encontrado</div>;

  const inWishlist = isInWishlist(product.id);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <Link to="/" className="flex items-center gap-2 text-gray-600 hover:text-slate-600 mb-6">
        <ArrowLeft className="w-4 h-4" /> Volver a productos
      </Link>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden">
          <img
            src={product.imageUrl || 'https://via.placeholder.com/500'}
            alt={product.name}
            className="w-full h-full object-cover rounded-lg shadow-lg"
            loading="lazy"
            decoding="async"
            width="500"
            height="500"
          />
          <button
            onClick={() => toggleWishlist(product)}
            className={`absolute top-4 right-4 p-3 rounded-full shadow-lg transition-all ${
              inWishlist ? 'bg-red-500 text-white' : 'bg-white text-gray-400 hover:text-red-500'
            }`}
          >
            <Heart className={`w-6 h-6 ${inWishlist ? 'fill-current' : ''}`} />
          </button>
        </div>

        <div>
          <span className="text-sm text-slate-600 font-medium">
            {product.category?.name || 'Sin categoría'}
          </span>
          <h1 className="text-3xl font-bold mt-2 mb-2">{product.name}</h1>
          <p className="text-2xl font-bold text-slate-600 mb-4">
            ${product.price?.toLocaleString('es-AR')}
            {product.unit && <span className="text-sm font-normal text-gray-500 ml-1">/ {product.unit}</span>}
          </p>
          
          {product.description && (
            <p className="text-gray-600 mb-6">{product.description}</p>
          )}

          <div className="flex items-center gap-4 mb-6">
            <div className="flex items-center border rounded">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="px-3 py-2 hover:bg-gray-100"
              >
                -
              </button>
              <span className="px-4">{quantity}</span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="px-3 py-2 hover:bg-gray-100"
              >
                +
              </button>
            </div>
          </div>

          <button
            onClick={() => addToCart(product, quantity)}
            className="w-full bg-slate-600 text-white py-3 rounded-lg font-semibold hover:bg-slate-700 flex items-center justify-center gap-2"
          >
            <ShoppingCart className="w-5 h-5" />
            Agregar al Carrito
          </button>
        </div>
      </div>

      <Reviews productId={product.id} />
    </div>
  );
};

export default ProductDetailPage;
