import React, { useState } from 'react';
import { Mail, Phone, MapPin, Clock, Send, CheckCircle } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const ContactPage = () => {
  const { theme } = useTheme();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setTimeout(() => {
      setSubmitted(true);
      setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
      setLoading(false);
    }, 1000);
  };

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="rounded-2xl shadow-lg p-8" style={{ backgroundColor: theme.colors.card }}>
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6" style={{ backgroundColor: theme.colors.accent + '20' }}>
            <CheckCircle className="w-8 h-8" style={{ color: '#22c55e' }} />
          </div>
          <h2 className="text-2xl font-bold mb-4" style={{ color: theme.colors.text }}>¡Mensaje Enviado!</h2>
          <p className="mb-6" style={{ color: theme.colors.textSecondary }}>
            Gracias por contactarnos. Te responderemos a la brevedad.
          </p>
          <button
            onClick={() => setSubmitted(false)}
            className="px-6 py-3 rounded-lg font-medium transition-colors"
            style={{ backgroundColor: theme.colors.button, color: theme.colors.buttonText }}
          >
            Enviar otro mensaje
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: theme.colors.text }}>Contáctanos</h1>
        <p className="max-w-2xl mx-auto" style={{ color: theme.colors.textSecondary }}>
          ¿Tienes alguna pregunta o necesitas ayuda? Estamos aquí para asistirte.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-12">
        <div>
          <div className="rounded-2xl shadow-lg p-8 mb-8" style={{ backgroundColor: theme.colors.card }}>
            <h2 className="text-xl font-bold mb-6" style={{ color: theme.colors.text }}>Información de Contacto</h2>
            
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: theme.colors.bgSecondary }}>
                  <MapPin className="w-6 h-6" style={{ color: theme.colors.accent }} />
                </div>
                <div>
                  <h3 className="font-medium" style={{ color: theme.colors.text }}>Dirección</h3>
                  <p style={{ color: theme.colors.textSecondary }}>Av. Libertador 1234, Buenos Aires, Argentina</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: theme.colors.bgSecondary }}>
                  <Phone className="w-6 h-6" style={{ color: theme.colors.accent }} />
                </div>
                <div>
                  <h3 className="font-medium" style={{ color: theme.colors.text }}>Teléfono</h3>
                  <p style={{ color: theme.colors.textSecondary }}>+54 11 5555-1234</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: theme.colors.bgSecondary }}>
                  <Mail className="w-6 h-6" style={{ color: theme.colors.accent }} />
                </div>
                <div>
                  <h3 className="font-medium" style={{ color: theme.colors.text }}>Email</h3>
                  <p style={{ color: theme.colors.textSecondary }}>contacto@store.com</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: theme.colors.bgSecondary }}>
                  <Clock className="w-6 h-6" style={{ color: theme.colors.accent }} />
                </div>
                <div>
                  <h3 className="font-medium" style={{ color: theme.colors.text }}>Horario de Atención</h3>
                  <p style={{ color: theme.colors.textSecondary }}>Lunes a Viernes: 9:00 - 18:00</p>
                  <p style={{ color: theme.colors.textSecondary }}>Sábados: 9:00 - 13:00</p>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl p-8 text-white" style={{ backgroundColor: theme.colors.button }}>
            <h3 className="font-bold text-lg mb-4">Síguenos en Redes</h3>
            <p className="mb-4" style={{ opacity: 0.8 }}>
              Mantente conectado con nosotros para ver las últimas novedades y ofertas.
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors">
                <span className="text-lg">📷</span>
              </a>
              <a href="#" className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors">
                <span className="text-lg">📘</span>
              </a>
              <a href="#" className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors">
                <span className="text-lg">🐦</span>
              </a>
            </div>
          </div>
        </div>

        <div className="rounded-2xl shadow-lg p-8" style={{ backgroundColor: theme.colors.card }}>
          <h2 className="text-xl font-bold mb-6" style={{ color: theme.colors.text }}>Envíanos un Mensaje</h2>
          
          {error && (
            <div className="px-4 py-3 rounded-lg mb-6" style={{ backgroundColor: '#fee2e2', color: '#dc2626', border: '1px solid #fecaca' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: theme.colors.text }}>
                  Nombre Completo *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-lg"
                  style={{ backgroundColor: theme.colors.bgSecondary, color: theme.colors.text, border: '1px solid ' + theme.colors.border }}
                  placeholder="Juan Pérez"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: theme.colors.text }}>
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-lg"
                  style={{ backgroundColor: theme.colors.bgSecondary, color: theme.colors.text, border: '1px solid ' + theme.colors.border }}
                  placeholder="juan@ejemplo.com"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: theme.colors.text }}>
                  Teléfono
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg"
                  style={{ backgroundColor: theme.colors.bgSecondary, color: theme.colors.text, border: '1px solid ' + theme.colors.border }}
                  placeholder="+54 11 5555-1234"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: theme.colors.text }}>
                  Asunto *
                </label>
                <select
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-lg"
                  style={{ backgroundColor: theme.colors.bgSecondary, color: theme.colors.text, border: '1px solid ' + theme.colors.border }}
                >
                  <option value="">Seleccionar...</option>
                  <option value="Consulta General">Consulta General</option>
                  <option value="Problemas con Pedido">Problemas con Pedido</option>
                  <option value="Devoluciones">Devoluciones</option>
                  <option value="Sugerencias">Sugerencias</option>
                  <option value="Otro">Otro</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: theme.colors.text }}>
                Mensaje *
              </label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                required
                rows={5}
                className="w-full px-4 py-3 rounded-lg resize-none"
                style={{ backgroundColor: theme.colors.bgSecondary, color: theme.colors.text, border: '1px solid ' + theme.colors.border }}
                placeholder="¿En qué podemos ayudarte?"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 px-6 rounded-lg font-medium transition-colors disabled:opacity-50"
              style={{ backgroundColor: theme.colors.button, color: theme.colors.buttonText }}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-current border-t-transparent"></div>
                  Enviando...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  Enviar Mensaje
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;