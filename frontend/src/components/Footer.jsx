import React from 'react';
import { Link } from 'react-router-dom';
import { Activity, Phone, Mail, MapPin, Clock, ShieldCheck, Heart } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-12">
          {/* Col 1: About */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-medicare-500 to-tealcare-400 flex items-center justify-center text-white">
                <Activity className="w-5 h-5 stroke-[2.5]" />
              </div>
              <span className="text-2xl font-black tracking-tight text-white">
                MediCare
              </span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed max-w-sm">
              MediCare is a state-of-the-art tertiary care healthcare institution committed to delivering
              compassionate, world-class clinical care, cutting-edge diagnostics, and accessible online patient services.
            </p>
            <div className="pt-2 flex items-center space-x-3 text-xs text-slate-400">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>JCI & NABH Accredited Healthcare Facility</span>
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div>
            <h4 className="text-white text-sm font-semibold tracking-wider uppercase mb-4">
              Quick Navigation
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/" className="hover:text-medicare-400 transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-medicare-400 transition-colors">
                  About Our Hospital
                </Link>
              </li>
              <li>
                <Link to="/doctors" className="hover:text-medicare-400 transition-colors">
                  Our Medical Specialists
                </Link>
              </li>
              <li>
                <Link to="/book-appointment" className="hover:text-medicare-400 transition-colors">
                  Book an Appointment
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-medicare-400 transition-colors">
                  Emergency & Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Medical Specialties */}
          <div>
            <h4 className="text-white text-sm font-semibold tracking-wider uppercase mb-4">
              Specialties
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li className="hover:text-tealcare-300 transition-colors">Cardiology & Heart Care</li>
              <li className="hover:text-tealcare-300 transition-colors">Neurology & Spine</li>
              <li className="hover:text-tealcare-300 transition-colors">Orthopedics & Joint Care</li>
              <li className="hover:text-tealcare-300 transition-colors">Pediatrics & Neonatal</li>
              <li className="hover:text-tealcare-300 transition-colors">Internal & Preventative Med</li>
              <li className="hover:text-tealcare-300 transition-colors">Dermatology & Skin Center</li>
            </ul>
          </div>

          {/* Col 4: Contact & Emergency */}
          <div>
            <h4 className="text-white text-sm font-semibold tracking-wider uppercase mb-4">
              Emergency & Location
            </h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 text-medicare-400 shrink-0 mt-0.5" />
                <span>742 Health Boulevard, Medical District, Metropolis</span>
              </li>
              <li className="flex items-center space-x-3">
                <Phone className="w-4 h-4 text-rose-400 shrink-0" />
                <span>
                  <strong className="text-rose-400">Emergency:</strong> +1 (800) 555-CARE
                </span>
              </li>
              <li className="flex items-center space-x-3">
                <Mail className="w-4 h-4 text-tealcare-400 shrink-0" />
                <span>support@medicare-hospital.org</span>
              </li>
              <li className="flex items-center space-x-3">
                <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                <span>OPD: 8:00 AM - 8:00 PM (Emergency: 24/7)</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-slate-800 text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} MediCare Hospital Management System. All rights reserved.</p>
          <p className="flex items-center space-x-1">
            <span>Built with</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
            <span>for B.Tech CSE Capstone Project</span>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
