import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Package, Truck, CheckCircle, Clock, MapPin, CreditCard, ArrowLeft, RefreshCw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { API_URL } from '../services/api';

const STATUS_CONFIG = {
  PENDING: { label: 'Recibido', icon: Clock, color: 'yellow', step: 1 },
  CONFIRMED: { label: 'Confirmado', icon: CheckCircle, color: 'blue', step: 2 },
  PROCESSING: { label: 'Preparando', icon: Package, color: 'indigo', step: 3 },
  SHIPPED: { label: 'Enviado', icon: Truck, color: 'purple', step: 4 },
  DELIVERED: { label: 'Entregado', icon: CheckCircle, color: 'green', step: 5 },
  CANCELLED: { label: 'Cancelado', icon: Package, color: 'red', step: 0 }
};

const OrderTrackingPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user && id) {
      fetchOrder();
    }
  }, [user, id]);

  const fetchOrder = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/api/orders/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (res.ok) {
        const data = await res.json();
        setOrder(data);
      } else {
        setError('Pedido no encontrado');
      }
    } catch (err) {
      setError('Error al cargar el pedido');
    }
    setLoading(false);
  };

  const getStatusConfig = (status) => {
    return STATUS_CONFIG[status] || STATUS_CONFIG.PENDING;
  };

  const getOrderSteps = () => {
    const statusOrder = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED'];
    const currentStatus = order?.status;
    
    if (currentStatus === 'CANCELLED') {
      return [{ status: 'CANCELLED', label: 'Cancelado', completed: true, current: false }];
    }
    
    return statusOrder.map(status => {
      const config = STATUS_CONFIG[status];
      const currentIndex = statusOrder.indexOf(currentStatus);
      const statusIndex = statusOrder.indexOf(status);
      
      return {
        status,
        label: config.label,
        icon: config.icon,
        completed: statusIndex <= currentIndex,
        current: status === currentStatus
      };
    });
  };

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Inicia sesión para ver el pedido</h1>
        <button onClick={() => navigate('/auth')} className="text-slate-600 hover:underline">
          Ir a iniciar sesión
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <RefreshCw className="w-8 h-8 animate-spin text-slate-600 mx-auto mb-4" />
        <p className="text-gray-600">Cargando pedido...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <Package className="w-16 h-16 mx-auto text-gray-300 mb-4" />
        <h1 className="text-2xl font-bold text-gray-800 mb-2">{error || 'Pedido no encontrado'}</h1>
        <button onClick={() => navigate('/profile')} className="text-slate-600 hover:underline mt-4">
          Volver a mis pedidos
        </button>
      </div>
    );
  }

  const steps = getOrderSteps();
  const statusConfig = getStatusConfig(order.status);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <button onClick={() => navigate('/profile')} className="flex items-center text-gray-600 mb-6 hover:text-slate-600 transition-colors">
        <ArrowLeft className="w-5 h-5 mr-2" />
        Volver a mis pedidos
      </button>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="bg-gradient-to-r from-slate-700 to-slate-600 text-white p-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold mb-2">
                Pedido #{order.orderNumber || order.id}
              </h1>
              <p className="text-slate-100">
                {new Date(order.createdAt).toLocaleDateString('es-AR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
            <span className={`px-4 py-2 rounded-full font-medium bg-white/20`}>
              {statusConfig.label}
            </span>
          </div>
        </div>

        <div className="p-6">
          {/* Timeline de estados */}
          <div className="mb-8">
            <h2 className="text-lg font-bold text-gray-800 mb-6">Estado del pedido</h2>
            
            {order.status === 'CANCELLED' ? (
              <div className="text-center py-8 bg-red-50 rounded-lg">
                <Package className="w-12 h-12 mx-auto text-red-500 mb-4" />
                <p className="text-red-800 font-medium">Este pedido fue cancelado</p>
              </div>
            ) : (
              <div className="relative">
                <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200"></div>
                <div className="space-y-6">
                  {steps.map((step, index) => {
                    const Icon = step.icon;
                    return (
                      <div key={step.status} className="relative flex items-start">
                        <div className={`absolute left-6 w-0.5 h-full ${index < steps.length - 1 ? 'bg-gray-200' : ''}`}></div>
                        <div className={`relative z-10 w-12 h-12 rounded-full flex items-center justify-center ${
                          step.completed 
                            ? 'bg-slate-500 text-white' 
                            : 'bg-gray-200 text-gray-400'
                        }`}>
                          <Icon className="w-6 h-6" />
                        </div>
                        <div className="ml-4">
                          <p className={`font-medium ${step.completed ? 'text-gray-800' : 'text-gray-400'}`}>
                            {step.label}
                          </p>
                          {step.current && (
                            <p className="text-sm text-slate-600">Estado actual</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Información del envío */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-slate-600" />
                Dirección de envío
              </h3>
              <p className="text-gray-600">
                {order.shippingAddress}<br />
                {order.shippingCity}
                {order.shippingPostalCode && ` - CP: ${order.shippingPostalCode}`}
              </p>
              {order.phone && (
                <p className="text-gray-600 mt-2">
                  <span className="font-medium">Tel:</span> {order.phone}
                </p>
              )}
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-slate-600" />
                Método de pago
              </h3>
              <p className="text-gray-600">
                {order.paymentMethod === 'MERCADO_PAGO' ? 'MercadoPago' : 'Transferencia bancaria'}
              </p>
              <p className="text-gray-600 mt-2">
                <span className="font-medium">Estado del pago:</span>{' '}
                <span className={order.paymentStatus === 'PAID' ? 'text-slate-600' : 'text-yellow-600'}>
                  {order.paymentStatus === 'PAID' ? 'Pagado' : 'Pendiente'}
                </span>
              </p>
            </div>
          </div>

          {/* Detalle del pedido */}
          <div className="mt-6">
            <h3 className="font-bold text-gray-800 mb-4">Detalle del pedido</h3>
            <div className="border rounded-lg divide-y">
              {order.items?.map((item, index) => (
                <div key={index} className="p-4 flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    {item.product?.imageUrl && (
                      <img 
                        src={item.product.imageUrl} 
                        alt={item.product.name}
                        className="w-16 h-16 object-cover rounded"
                        loading="lazy"
                        decoding="async"
                        width="64"
                        height="64"
                      />
                    )}
                    <div>
                      <p className="font-medium">{item.product?.name || 'Producto'}</p>
                      <p className="text-sm text-gray-500">Cantidad: {item.quantity}</p>
                    </div>
                  </div>
                  <p className="font-medium">${(item.price * item.quantity).toLocaleString('es-AR')}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Totales */}
          <div className="mt-6 bg-gray-50 rounded-lg p-4">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-600">Subtotal</span>
              <span>${order.subtotal?.toLocaleString('es-AR')}</span>
            </div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-600">Envío</span>
              <span>${order.shippingCost?.toLocaleString('es-AR')}</span>
            </div>
            <div className="flex justify-between font-bold text-lg pt-2 border-t">
              <span>Total</span>
              <span className="text-slate-600">${order.total?.toLocaleString('es-AR')}</span>
            </div>
          </div>

          {/* Notas */}
          {order.notes && (
            <div className="mt-6 bg-yellow-50 rounded-lg p-4">
              <h3 className="font-bold text-gray-800 mb-2">Notas del pedido</h3>
              <p className="text-gray-600">{order.notes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderTrackingPage;
