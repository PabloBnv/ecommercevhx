import React from 'react';
import { Link } from 'react-router-dom';
import { Instagram, Facebook, Phone, Mail, MapPin, ShoppingBag } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-gray-300 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-slate-600 p-2 rounded-lg flex items-center justify-center" style={{ width: '36px', height: '36px' }}>
                <ShoppingBag className="text-white w-5 h-5" aria-hidden="true" />
              </div>
              <h2 className="font-bold text-xl text-white">
                STYLE <span className="text-slate-400">STORE</span>
              </h2>
            </div>
            <p className="max-w-md text-sm leading-relaxed mb-6">
              Tu tienda de moda online favorita. Descubre las últimas tendencias en ropa, 
              calzado y accesorios. Moda de calidad a precios accesibles.
            </p>
            <div className="flex space-x-4">
              <a href="#" target="_blank" rel="noopener noreferrer" className="hover:text-slate-400 transition-colors" aria-label="Visitar nuestro Instagram">
                <Instagram className="w-5 h-5" aria-hidden="true" />
              </a>
              <a href="#" target="_blank" rel="noopener noreferrer" className="hover:text-slate-400 transition-colors" aria-label="Visitar nuestro Facebook">
                <Facebook className="w-5 h-5" aria-hidden="true" />
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-white font-bold text-lg mb-4">Contacto</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-3">
                <MapPin className="w-4 h-4 mt-0.5 text-slate-400 flex-shrink-0" />
                <span>Av. Libertador 1234, Buenos Aires, Argentina</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-slate-400 flex-shrink-0" />
                <span>+54 11 5555-1234</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-slate-400 flex-shrink-0" />
                <span>contacto@yourdomain.com</span>
              </li>
              <li className="text-gray-400 mt-2">Lunes a Viernes 9am - 6pm</li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-bold text-lg mb-4">Enlaces Rápidos</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/" className="hover:text-slate-400 transition-colors">Productos</Link></li>
              <li><Link to="/contacto" className="hover:text-slate-400 transition-colors">Contacto</Link></li>
              <li><a href="#" className="hover:text-slate-400 transition-colors">Nosotros</a></li>
              <li><a href="#" className="hover:text-slate-400 transition-colors">Envíos</a></li>
              <li><a href="#" className="hover:text-slate-400 transition-colors">Devoluciones</a></li>
            </ul>
          </div>
        </div>
        
        <div className="mt-10 pt-8 border-t border-gray-700 text-center text-xs text-gray-500">
          <p>© 2024 Style Store. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
