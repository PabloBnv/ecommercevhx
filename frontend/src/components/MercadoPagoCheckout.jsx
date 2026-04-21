import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { ChevronLeft, CreditCard, AlertCircle, CheckCircle, Loader } from 'lucide-react';

const MercadoPagoCheckout = ({ orderId, onSuccess, onError }) => {
  const { cart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [preferenceData, setPreferenceData] = useState(null);

  useEffect(() => {
    const initMercadoPago = async () => {
      try {
        const config = await api.get('/api/payments/config');
        
        if (!config.configured) {
          setError('MercadoPago no está configurado. Por favor, usa transferencia bancaria.');
          setLoading(false);
          return;
        }

        const items = cart.map(item => ({
          name: item.name,
          quantity: item.quantity,
          price: item.price
        }));

        const preference = await api.post('/api/payments/create-preference', {
          orderId,
          items
        });

        setPreferenceData(preference);

        const script = document.createElement('script');
        script.src = 'https://sdk.mercadopago.com/js/v2';
        script.onload = () => {
          const mp = new window.MercadoPago(config.publicKey, {
            locale: 'es-AR'
          });

          mp.checkout({
            preference: {
              id: preference.preferenceId
            },
            render: {
              container: '#mercadopago-button',
              label: 'Pagar con MercadoPago'
            }
          });
          setLoading(false);
        };
        document.body.appendChild(script);

      } catch (err) {
        setError(err.message || 'Error al inicializar MercadoPago');
        setLoading(false);
      }
    };

    if (orderId && cart.length > 0) {
      initMercadoPago();
    }
  }, [orderId, cart]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-8">
        <Loader className="w-8 h-8 animate-spin text-slate-600 mb-4" />
        <p className="text-gray-600">Inicializando MercadoPago...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center gap-2 text-red-700 mb-2">
          <AlertCircle className="w-5 h-5" />
          <span className="font-medium">Error</span>
        </div>
        <p className="text-red-600 text-sm">{error}</p>
        <button
          onClick={() => navigate('/')}
          className="mt-4 text-sm text-red-700 hover:underline"
        >
          Volver al inicio
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl p-6">
      <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
        <CreditCard className="w-5 h-5 text-slate-600" />
        Pagar con MercadoPago
      </h3>
      
      <div id="mercadopago-button" className="mt-4"></div>
      
      <p className="text-xs text-gray-500 mt-4">
        Tus pagos están protegidos por MercadoPago.
      </p>
    </div>
  );
};

export default MercadoPagoCheckout;
