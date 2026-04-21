import React, { useState, useMemo } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { ChevronLeft, Truck, MapPin, Phone, CreditCard, CheckCircle, Loader, AlertCircle } from 'lucide-react';

const CheckoutPage = () => {
  const { cart, cartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [orderData, setOrderData] = useState(null);
  const [mpLoading, setMpLoading] = useState(false);
  const [mpConfig, setMpConfig] = useState(null);
  const [formData, setFormData] = useState({
    shippingAddress: user?.address || '',
    shippingCity: user?.city || 'CABA',
    shippingPostalCode: user?.postalCode || '',
    phone: user?.phone || '',
    notes: '',
    paymentMethod: 'TRANSFER',
  });

  const shippingCost = useMemo(() => {
    const city = formData.shippingCity?.toLowerCase() || '';
    if (city.includes('caba') || city.includes('capital')) return 500;
    if (city.includes('gba')) return 800;
    return 1500;
  }, [formData.shippingCity]);

  const orderTotal = cartTotal + shippingCost;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const items = cart.map(item => ({
        productId: item.id,
        quantity: item.quantity,
      }));

      const order = await api.orders.create({
        ...formData,
        items,
      });

      if (formData.paymentMethod === 'MERCADO_PAGO') {
        setMpLoading(true);
        try {
          const config = await api.get('/api/payments/config');
          setMpConfig({ ...config, orderId: order.id });
        } catch {
          setOrderData({
            id: order.id,
            total: order.total,
            paymentMethod: 'TRANSFER',
            shippingAddress: formData.shippingAddress,
            shippingCity: formData.shippingCity,
          });
          setOrderComplete(true);
          clearCart();
        }
      } else {
        setOrderData({
          id: order.id,
          total: order.total,
          paymentMethod: 'TRANSFER',
          shippingAddress: formData.shippingAddress,
          shippingCity: formData.shippingCity,
        });
        setOrderComplete(true);
        clearCart();
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleMercadoPagoSuccess = () => {
    setOrderComplete(true);
    clearCart();
  };

  if (cart.length === 0 && !orderComplete) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Tu carrito está vacío</h1>
        <button onClick={() => navigate('/')} className="text-slate-600 hover:underline">
          Volver a productos
        </button>
      </div>
    );
  }

  if (orderComplete) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="bg-slate-100 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-12 h-12 text-slate-600" />
        </div>
        <h1 className="text-3xl font-bold text-gray-800 mb-4">
          {formData.paymentMethod === 'MERCADO_PAGO' ? '¡Pago en proceso!' : '¡Pedido Confirmado!'}
        </h1>
        <p className="text-gray-600 mb-2">
          Tu pedido <span className="font-bold text-slate-600">#{orderData?.id}</span> fue recibido.
        </p>
        <p className="text-gray-500 mb-6">Te enviaremos un email de confirmación.</p>
        
        <div className="bg-gray-50 rounded-xl p-6 mb-8 text-left max-w-md mx-auto">
          <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Dirección de envío
          </h3>
          <p className="text-gray-600 mb-4">
            {orderData?.shippingAddress}<br />
            {orderData?.shippingCity} - CP: {formData.shippingPostalCode}
          </p>
          
          <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Método de pago
          </h3>
          <p className="text-gray-600 mb-4">
            {orderData?.paymentMethod === 'MERCADO_PAGO' ? 'MercadoPago' : 'Transferencia bancaria'}
          </p>
          
          <div className="border-t pt-4">
            <p className="text-lg font-bold text-gray-800">
              Total: <span className="text-slate-600">${orderData?.total?.toLocaleString('es-AR')}</span>
            </p>
          </div>
        </div>

        {formData.paymentMethod === 'TRANSFER' && (
          <div className="bg-blue-50 rounded-xl p-6 mb-8 text-left max-w-md mx-auto">
            <h3 className="font-bold text-blue-800 mb-3 flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              Datos para transferir
            </h3>
            <p className="text-sm text-blue-700">
              CBU: 1234567890123456789012<br />
              Alias: sabores.andinos<br />
              Banco: Mercado Pago<br />
              <strong>Referencia: Pedido #{orderData?.id}</strong>
            </p>
          </div>
        )}

        <button
          onClick={() => navigate('/profile')}
          className="bg-slate-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-slate-700 mr-4"
        >
          Ver mis pedidos
        </button>
        <button
          onClick={() => navigate('/')}
          className="border border-slate-600 text-slate-600 px-8 py-3 rounded-lg font-bold hover:bg-slate-50"
        >
          Continuar comprando
        </button>
      </div>
    );
  }

  if (mpLoading && mpConfig) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <Loader className="w-12 h-12 animate-spin text-slate-600 mx-auto mb-6" />
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Preparando pago con MercadoPago...</h1>
        <p className="text-gray-600 mb-8">Esto puede tomar unos segundos.</p>
        
        <div id="mercadopago-checkout-container" className="text-left bg-white rounded-xl p-6 shadow-md">
          <script src="https://sdk.mercadopago.com/js/v2"></script>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <button onClick={() => navigate(-1)} className="flex items-center text-gray-600 mb-6 hover:text-slate-600 transition-colors">
        <ChevronLeft className="w-5 h-5" />
        Volver
      </button>

      <h1 className="text-3xl font-bold text-gray-800 mb-8">Finalizar Compra</h1>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-md p-6 md:p-8">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b">
              <MapPin className="w-6 h-6 text-slate-600" />
              <h2 className="text-xl font-bold text-gray-800">Datos de envío</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Dirección *</label>
                <input
                  type="text"
                  name="shippingAddress"
                  value={formData.shippingAddress}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
                  placeholder="Ej: Av. Independencia 2231"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ciudad *</label>
                  <select
                    name="shippingCity"
                    value={formData.shippingCity}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500"
                    required
                  >
                    <option value="CABA">CABA - $500</option>
                    <option value="GBA Norte">GBA Norte - $800</option>
                    <option value="GBA Sur">GBA Sur - $800</option>
                    <option value="GBA Este">GBA Este - $800</option>
                    <option value="GBA Oeste">GBA Oeste - $800</option>
                    <option value="Interior">Interior del país - $1500</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Código Postal *</label>
                  <input
                    type="text"
                    name="shippingPostalCode"
                    value={formData.shippingPostalCode}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500"
                    placeholder="Ej: 1222"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  Teléfono de contacto *
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500"
                  placeholder="Ej: 11 2147-7611"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notas del pedido (opcional)</label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500"
                  placeholder="Indicaciones para el delivery, horarios preferidos, etc."
                />
              </div>

              <div className="pt-4">
                <div className="flex items-center gap-3 mb-4 pb-4 border-b">
                  <CreditCard className="w-6 h-6 text-slate-600" />
                  <h2 className="text-xl font-bold text-gray-800">Forma de pago</h2>
                </div>
                <div className="space-y-3">
                  <label className="flex items-center p-4 border-2 border-gray-200 rounded-xl cursor-pointer hover:border-slate-500 transition-colors">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="TRANSFER"
                      checked={formData.paymentMethod === 'TRANSFER'}
                      onChange={handleChange}
                      className="mr-3 w-5 h-5 text-slate-600"
                    />
                    <div>
                      <span className="font-medium text-gray-800">Transferencia bancaria</span>
                      <p className="text-sm text-gray-500">CBU / Alias para transferir</p>
                    </div>
                  </label>
                  <label className="flex items-center p-4 border-2 border-gray-200 rounded-xl cursor-pointer hover:border-slate-500 transition-colors">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="MERCADO_PAGO"
                      checked={formData.paymentMethod === 'MERCADO_PAGO'}
                      onChange={handleChange}
                      className="mr-3 w-5 h-5 text-slate-600"
                    />
                    <div>
                      <span className="font-medium text-gray-800">MercadoPago</span>
                      <p className="text-sm text-gray-500">Tarjeta de crédito/débito, efectivo</p>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || cart.length === 0}
              className="w-full mt-8 bg-slate-600 text-white font-bold py-4 rounded-xl hover:bg-slate-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  <span>Procesando...</span>
                </>
              ) : (
                <>
                  <span>Continuar</span>
                  <span className="ml-2 bg-slate-700 px-4 py-1 rounded-full text-sm">
                    ${orderTotal.toLocaleString('es-AR')}
                  </span>
                </>
              )}
            </button>
          </form>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-md p-6 sticky top-4">
            <div className="flex items-center gap-3 mb-4 pb-4 border-b">
              <Truck className="w-6 h-6 text-slate-600" />
              <h2 className="text-xl font-bold text-gray-800">Tu Pedido</h2>
            </div>
            
            <div className="space-y-3 max-h-64 overflow-y-auto mb-4">
              {cart.map(item => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span className="text-gray-600">
                    <span className="font-medium">{item.name}</span>
                    <br />
                    <span className="text-xs">x{item.quantity}</span>
                  </span>
                  <span className="font-medium">
                    ${(item.price * item.quantity).toLocaleString('es-AR')}
                  </span>
                </div>
              ))}
            </div>
            
            <div className="space-y-2 border-t pt-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium">${cartTotal.toLocaleString('es-AR')}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Envío</span>
                <span className="font-medium">${shippingCost.toLocaleString('es-AR')}</span>
              </div>
              <div className="flex justify-between text-lg font-bold pt-2 border-t">
                <span>Total</span>
                <span className="text-slate-600">${orderTotal.toLocaleString('es-AR')}</span>
              </div>
            </div>

            <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
              <p className="text-xs text-yellow-800">
                Los precios están en pesos argentinos (ARS). El envío se calcula según tu zona.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
