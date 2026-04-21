import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, User, Sparkles, HelpCircle, BarChart3, Package, Users, ShoppingCart, TrendingUp } from 'lucide-react';

const chatCommands = {
  CUSTOMER: {
    greeting: '¡Hola! Soy tu asistente virtual. ¿En qué puedo ayudarte con tus pedidos?',
    quickActions: [
      { icon: '📦', label: 'Mis pedidos', action: 'orders' },
      { icon: '🛒', label: 'Rastrear envío', action: 'track' },
      { icon: '↩️', label: 'Devoluciones', action: 'returns' },
      { icon: '💬', label: 'Contactar soporte', action: 'support' },
    ],
    responses: {
      orders: 'Para ver tus pedidos, ve a "Mi Perfil" > "Mis Pedidos". ¿Hay algo más en que pueda ayudarte?',
      track: 'Puedes rastrear tu pedido desde "Mi Perfil" > "Mis Pedidos" > seleccionar pedido. ¿Necesitas ayuda con algo específico?',
      returns: 'Para devoluciones tienes 30 días desde la recepción. ¿Quieres que te conecte con un agente?',
      support: 'Estoy aquí para ayudarte. Puedes preguntarme sobre pedidos, envíos, devoluciones o productos.',
      default: 'Puedo ayudarte con: pedidos, envíos, devoluciones, o información sobre productos. ¿Qué necesitas?',
    }
  },
  INVENTORY: {
    greeting: '¡Hola! ¿Necesitas ayuda con el inventario?',
    quickActions: [
      { icon: '📊', label: 'Mis ventas hoy', action: 'sales_today' },
      { icon: '📦', label: 'Productos sin stock', action: 'low_stock' },
      { icon: '📈', label: 'Estadísticas', action: 'stats' },
      { icon: '❓', label: 'Ayuda inventario', action: 'inventory_help' },
    ],
    responses: {
      sales_today: '📊 Resumen de hoy:\n• Pedidos: 5\n• Ventas: $12,500\n• Productos vendidos: 8\n\n¿Quieres ver más detalles?',
      low_stock: '📦 Productos con stock bajo:\n• Quinoa (2 unidades)\n• Kiwicha (5 unidades)\n\n¿Quieres actualizar el stock?',
      stats: '📈 Estadísticas del mes:\n• Ventas totales: $125,000\n• Pedidos completados: 45\n• Productos más vendidos: Quinoa, Kiwicha\n• Rating promedio: 4.8 ⭐',
      seller_help: '💡 Consejos para vendedores:\n1. Mantén tus productos actualizados\n2. Responde consultas rápidamente\n3. Usa buenas imágenes de producto\n4. Ofrece promociones ocasionales\n\n¿Tienes alguna pregunta específica?',
      default: 'Puedo ayudarte con estadísticas de ventas, gestión de stock, pedidos y consejos. ¿Qué necesitas?',
    }
  },
  MODERATOR: {
    greeting: '¡Hola moderador! ¿Qué necesitas revisar hoy?',
    quickActions: [
      { icon: '📝', label: 'Reviews pendientes', action: 'pending_reviews' },
      { icon: '👥', label: 'Reportes usuarios', action: 'user_reports' },
      { icon: '⚠️', label: 'Contenido reportado', action: 'reported_content' },
      { icon: '📊', label: 'Estadísticas moderación', action: 'mod_stats' },
    ],
    responses: {
      pending_reviews: '📝 Reviews pendientes de moderación: 3\n\n1. ⭐⭐⭐⭐⭐ "Excelente producto" - Revisar\n2. ⭐⭐ "Llegó dañado" - Requiere acción\n3. ⭐⭐⭐⭐ "Buen precio" - Aprobado automáticamente\n\n¿Cuál quieres revisar?',
      user_reports: '👥 Reportes de usuarios:\n• 2 reportes por spam\n• 1 reporte por conducta inapropiada\n• 0 reportes por fraude\n\n¿Quieres ver los detalles?',
      reported_content: '⚠️ Contenido reportado:\n• 2 productos con imágenes inapropiadas\n• 1 descripción con información falsa\n\n¿Quieres revisar estos casos?',
      mod_stats: '📊 Estadísticas de moderación:\n• Reviews aprobadas: 156\n• Reviews rechazadas: 23\n• Usuarios advertidos: 5\n• Tiempo promedio resolución: 2h',
      default: 'Puedo ayudarte con moderación de reviews, reportes de usuarios y contenido. ¿Qué necesitas?',
    }
  },
  ADMIN: {
    greeting: '¡Hola Admin! ¿Qué información necesitas?',
    quickActions: [
      { icon: '💰', label: 'Ventas hoy', action: 'sales_today' },
      { icon: '👥', label: 'Usuarios nuevos', action: 'new_users' },
      { icon: '📈', label: 'Métricas generales', action: 'metrics' },
      { icon: '🚨', label: 'Alertas', action: 'alerts' },
    ],
    responses: {
      sales_today: '💰 Ventas de hoy:\n• Total: $45,230\n• Pedidos: 23\n• Ticket promedio: $1,967\n• Producto más vendido: Quinoa Premium\n• Conversión: 3.2%',
      new_users: '👥 Usuarios nuevos (últimos 7 días):\n• Total: 45\n• Clientes: 38\n• Vendedores: 5\n• Moderadores: 2\n• Tasa de conversión: 62%',
      metrics: '📈 Métricas generales:\n• Usuarios totales: 1,234\n• Productos activos: 456\n• Pedidos mes: 890\n• Ingresos mes: $2.3M\n• Tasa de devolución: 2.1%\n• NPS: 72',
      alerts: '🚨 Alertas activas:\n• 3 productos sin stock\n• 2 vendedores inactivos\n• 1 pedido con retraso\n• 5 reviews pendientes\n\n¿Quieres ver detalles de alguna?',
      default: 'Puedo proporcionarte: ventas, usuarios, métricas, alertas, reportes financieros. ¿Qué necesitas?',
    }
  }
};

const DashboardChat = ({ role = 'CUSTOMER' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  
  const config = chatCommands[role] || chatCommands.CUSTOMER;

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([{
        id: 1,
        type: 'bot',
        message: config.greeting,
        timestamp: new Date().toISOString()
      }]);
    }
  }, [isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleAction = (action) => {
    const response = config.responses[action] || config.responses.default;
    addUserMessage(`Necesito ayuda con: ${config.quickActions.find(a => a.action === action)?.label || action}`);
    
    setIsTyping(true);
    setTimeout(() => {
      addBotMessage(response);
      setIsTyping(false);
    }, 800);
  };

  const addUserMessage = (text) => {
    const msg = {
      id: messages.length + 1,
      type: 'user',
      message: text,
      timestamp: new Date().toISOString()
    };
    setMessages(prev => [...prev, msg]);
  };

  const addBotMessage = (text) => {
    const msg = {
      id: messages.length + 2,
      type: 'bot',
      message: text,
      timestamp: new Date().toISOString()
    };
    setMessages(prev => [...prev, msg]);
  };

  const sendMessage = async () => {
    if (!input.trim()) return;
    
    addUserMessage(input);
    setInput('');
    setIsTyping(true);

    // Simulate AI response based on keywords
    setTimeout(() => {
      const lowerInput = input.toLowerCase();
      let response = config.responses.default;

      if (lowerInput.includes('venta') || lowerInput.includes('dinero') || lowerInput.includes('ingreso')) {
        response = config.responses.sales_today || config.responses.default;
      } else if (lowerInput.includes('stock') || lowerInput.includes('inventario')) {
        response = config.responses.low_stock || config.responses.default;
      } else if (lowerInput.includes('pedido') || lowerInput.includes('orden')) {
        response = config.responses.orders || config.responses.default;
      } else if (lowerInput.includes('envio') || lowerInput.includes('rastrear')) {
        response = config.responses.track || config.responses.default;
      } else if (lowerInput.includes('estadistica') || lowerInput.includes('métrica') || lowerInput.includes('metrica')) {
        response = config.responses.stats || config.responses.metrics || config.responses.default;
      } else if (lowerInput.includes('review') || lowerInput.includes('reseña') || lowerInput.includes('resena')) {
        response = config.responses.pending_reviews || config.responses.default;
      } else if (lowerInput.includes('reporte') || lowerInput.includes('usuario')) {
        response = config.responses.user_reports || config.responses.default;
      } else if (lowerInput.includes('ayuda') || lowerInput.includes('help')) {
        response = config.responses.default;
      }

      addBotMessage(response);
      setIsTyping(false);
    }, 1000);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const getRoleColor = () => {
    switch (role) {
      case 'ADMIN': return 'bg-red-600';
      case 'INVENTORY': return 'bg-blue-600';
      case 'MODERATOR': return 'bg-purple-600';
      default: return 'bg-slate-600';
    }
  };

  const getRoleIcon = () => {
    switch (role) {
      case 'ADMIN': return <BarChart3 className="w-5 h-5" />;
      case 'INVENTORY': return <TrendingUp className="w-5 h-5" />;
      case 'MODERATOR': return <Users className="w-5 h-5" />;
      default: return <ShoppingCart className="w-5 h-5" />;
    }
  };

  return (
    <>
      {/* Chat Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 ${getRoleColor()} text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all z-40 flex items-center gap-2`}
      >
        {isOpen ? <X className="w-6 h-6" /> : getRoleIcon()}
        {!isOpen && <span className="hidden md:block text-sm font-medium">Ayuda</span>}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-96 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden z-40">
          {/* Header */}
          <div className={`${getRoleColor()} text-white p-4`}>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold">Asistente Inteligente</h3>
                <p className="text-xs opacity-80">Especializado en {role === 'ADMIN' ? 'administración' : role === 'INVENTORY' ? 'inventario' : role === 'MODERATOR' ? 'moderación' : 'soporte al cliente'}</p>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="p-3 bg-gray-50 border-b">
            <p className="text-xs text-gray-500 mb-2">Acciones rápidas:</p>
            <div className="grid grid-cols-2 gap-2">
              {config.quickActions.map((action, idx) => (
                <button
                  key={idx}
                  onClick={() => handleAction(action.action)}
                  className="flex items-center gap-2 p-2 text-xs bg-white border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <span>{action.icon}</span>
                  <span className="truncate">{action.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Messages */}
          <div className="h-64 overflow-y-auto p-4 space-y-3">
            {messages.map(msg => (
              <div
                key={msg.id}
                className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[85%] ${
                  msg.type === 'user' 
                    ? `${getRoleColor()} text-white rounded-l-lg rounded-tr-lg`
                    : 'bg-gray-100 text-gray-900 rounded-r-lg rounded-tl-lg'
                } px-3 py-2`}>
                  <div className="flex items-center gap-1 mb-1">
                    {msg.type === 'bot' ? (
                      <Bot className="w-3 h-3 text-gray-500" />
                    ) : (
                      <User className="w-3 h-3" />
                    )}
                    <span className="text-[10px] opacity-70">
                      {msg.type === 'bot' ? 'Asistente' : 'Tú'}
                    </span>
                  </div>
                  <p className="text-sm whitespace-pre-line">{msg.message}</p>
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-gray-100 rounded-r-lg rounded-tl-lg px-3 py-2">
                  <div className="flex items-center gap-2">
                    <Bot className="w-3 h-3 text-gray-500" />
                    <div className="flex gap-1">
                      <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-3 border-t bg-gray-50">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Pregúntame algo..."
                className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500"
              />
              <button
                onClick={sendMessage}
                disabled={!input.trim()}
                className={`p-2 ${getRoleColor()} text-white rounded-lg hover:opacity-90 disabled:opacity-50`}
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default DashboardChat;