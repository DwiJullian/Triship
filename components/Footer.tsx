
import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, MapPin, Instagram, ShieldCheck } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-white pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-20">
          <div className="space-y-8">
            <Link to="/" className="text-2xl heading-font font-bold tracking-tighter">
              TRI<span className="text-amber-500">SHIP</span>
            </Link>
            <p className="text-slate-400 text-sm leading-relaxed">
              A premium fashion and accessories platform. We bring modern style and quality pieces directly to elevate your everyday look.
            </p>
          </div>

          <div>
            <h4 className="text-lg font-bold mb-8">Navigation</h4>
            <ul className="space-y-4 text-slate-400 text-sm">
              <li><Link to="/products" className="hover:text-amber-500 transition-colors">All Products</Link></li>
              <li><Link to="/history" className="hover:text-amber-500 transition-colors">Track My Order</Link></li>
              <li><Link to="/contact" className="hover:text-amber-500 transition-colors">Contact Us</Link></li>
              <li><Link to="/admin" className="hover:text-amber-500 transition-colors">Staff Portal</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-bold mb-8">Support & Policies</h4>
            <ul className="space-y-4 text-slate-400 text-sm">
              <li><Link to="/shipping-policy" className="hover:text-amber-500 transition-colors">Shipping Policy</Link></li>
              <li><Link to="/returns-policy" className="hover:text-amber-500 transition-colors">Returns & Refunds</Link></li>
              <li><Link to="/terms" className="hover:text-amber-500 transition-colors">Terms of Service</Link></li>
              <li><Link to="/privacy" className="hover:text-amber-500 transition-colors">Privacy Policy</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-bold mb-8">Head Office</h4>
            <ul className="space-y-6 text-slate-400 text-sm">
              <li className="flex items-start space-x-4">
                <MapPin size={20} className="text-amber-500 flex-shrink-0" />
                <span>Sepinggan Baru, Balikpapan Selatan, Indonesia 76115</span>
              </li>
              <li className="flex items-center space-x-4">
                <a href="https://www.instagram.com/trishop772?igsh=ZWIwZjZ5NWlmdHZq&utm_source=qr" target="_blank" rel="noopener noreferrer" className="flex items-center space-x-4 hover:text-amber-400 transition-colors">
                  <Instagram size={20} className="text-amber-500 flex-shrink-0" />
                  <span>@trishop772</span>
                </a>
              </li>
              <li className="flex items-center space-x-4">
                <Mail size={20} className="text-amber-500 flex-shrink-0" />
                <span>triship772@gmail.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-slate-500 text-xs">
            © {new Date().getFullYear()} TRISHIP Official Store. All rights reserved.
          </p>
          <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-full border border-white/10">
            <ShieldCheck size={14} className="text-green-500" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-300">Secure Payment Environment</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
