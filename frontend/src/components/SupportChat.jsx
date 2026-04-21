import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Send, Bot, User, Headphones, AlertCircle, Ticket } from 'lucide-react';

const SupportChat = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      message: 'Hello! Welcome to Style Store. How can I help you today?',
      timestamp: new Date().toISOString()
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showTicketForm, setShowTicketForm] = useState(false);
  const [ticketForm, setTicketForm] = useState({ subject: '', description: '', category: 'GENERAL' });
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const createTicket = async () => {
    if (!ticketForm.subject.trim()) {
      alert('Por favor ingresa un asunto');
      return;
    }
    
    try {
      const data = await api.support.createTicket({
        subject: ticketForm.subject,
        description: ticketForm.description,
      });
      
      const botMessage = {
        id: messages.length + 1,
        type: 'bot',
        message: `✅ Ticket creado exitosamente. Número: ${data.id}. Un agente de soporte se pondrá en contacto contigo pronto.`,
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, botMessage]);
      setShowTicketForm(false);
      setTicketForm({ subject: '', description: '', category: 'GENERAL' });
    } catch (error) {
      console.error('Error creating ticket:', error);
      alert('Error al crear el ticket');
    }
  };

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = {
      id: messages.length + 1,
      type: 'user',
      message: input,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    const userInput = input;
    setInput('');
    setIsTyping(true);

    const mockResponses = {
      'hola': '¡Hola! Bienvenido a nuestra tienda. ¿En qué puedo ayudarte hoy?',
      'precio': 'Nuestros productos tienen precios competitivos. ¿Te gustaría ver algún producto en particular?',
      'envío': 'Los envíos se realizan en 2-5 días hábiles. ¿Tienes alguna duda sobre el envío?',
      'default': 'Gracias por tu mensaje. Un agente de soporte te ayudará pronto. ¿Deseas crear un ticket de soporte?'
    };

    const response = mockResponses[userInput.toLowerCase()] || mockResponses['default'];
    const botMessage = {
      id: messages.length + 2,
      type: 'bot',
      message: response,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, botMessage]);
    setIsTyping(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const escalateToHuman = async () => {
    setShowTicketForm(true);
    const botMessage = {
      id: messages.length + 1,
      type: 'bot',
      message: 'Voy a crear un ticket de soporte para ti. Por favor completa los siguientes datos:',
      timestamp: new Date().toISOString()
    };
    setMessages(prev => [...prev, botMessage]);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 bg-slate-600 text-white">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <Headphones className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Style Store Support</h2>
              <p className="text-sm text-slate-200">Virtual assistant available 24/7</p>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="h-96 overflow-y-auto p-4 space-y-4">
          {messages.map(msg => (
            <div
              key={msg.id}
              className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[80%] ${
                msg.type === 'user' 
                  ? 'bg-slate-600 text-white rounded-l-xl rounded-tr-xl'
                  : 'bg-gray-100 text-gray-900 rounded-r-xl rounded-tl-xl'
              } px-4 py-3`}>
                <div className="flex items-center gap-2 mb-1">
                  {msg.type === 'bot' ? (
                    <Bot className="w-4 h-4 text-slate-600" />
                  ) : (
                    <User className="w-4 h-4 text-white" />
                  )}
                  <span className="text-xs opacity-70">
                    {msg.type === 'bot' ? 'Asistente' : 'Tú'}
                  </span>
                </div>
                <p className="text-sm">{msg.message}</p>
              </div>
            </div>
          ))}
          
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-gray-100 rounded-r-xl rounded-tl-xl px-4 py-3">
                <div className="flex items-center gap-2">
                  <Bot className="w-4 h-4 text-slate-600" />
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Escalation / Ticket Form */}
        <div className="px-4 py-2 border-t border-gray-200 bg-gray-50">
          {showTicketForm ? (
            <div className="space-y-3 py-2">
              <input
                type="text"
                placeholder="Issue subject"
                value={ticketForm.subject}
                onChange={(e) => setTicketForm({...ticketForm, subject: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
              <select
                value={ticketForm.category}
                onChange={(e) => setTicketForm({...ticketForm, category: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              >
                <option value="GENERAL">General</option>
                <option value="ORDER">Order</option>
                <option value="PRODUCT">Product</option>
                <option value="PAYMENT">Payment</option>
                <option value="SHIPPING">Shipping</option>
                <option value="RETURN">Return</option>
                <option value="TECHNICAL">Technical</option>
                <option value="COMPLAINT">Complaint</option>
              </select>
              <textarea
                placeholder="Describe your issue..."
                value={ticketForm.description}
                onChange={(e) => setTicketForm({...ticketForm, description: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                rows={3}
              />
              <div className="flex gap-2">
                <button
                  onClick={createTicket}
                  className="flex-1 flex items-center justify-center gap-2 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 text-sm"
                >
                  <Ticket className="w-4 h-4" />
                  Crear Ticket
                </button>
                <button
                  onClick={() => setShowTicketForm(false)}
                  className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 text-sm"
                >
                  Cancelar
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={escalateToHuman}
              className="w-full flex items-center justify-center gap-2 py-2 text-sm text-slate-600 hover:text-slate-700 hover:bg-slate-50 rounded-lg transition-colors"
            >
              <Headphones className="w-4 h-4" />
              Crear ticket de soporte
            </button>
          )}
        </div>

        {/* Input */}
        <div className="px-4 py-3 border-t border-gray-200">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Escribe tu mensaje..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500"
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim()}
              className="px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupportChat;