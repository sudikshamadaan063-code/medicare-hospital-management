import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Activity,
  Calendar,
  User,
  LogOut,
  Menu,
  X,
  Shield,
  Stethoscope,
  ChevronDown,
  PhoneCall
} from 'lucide-react';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loginDropdownOpen, setLoginDropdownOpen] = useState(false);

  const getDashboardLink = () => {
    if (!user) return '/login';
    if (user.role === 'admin') return '/admin/dashboard';
    if (user.role === 'doctor') return '/doctor/dashboard';
    return '/patient/dashboard';
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 transition-all shadow-sm">
      {/* Top emergency announcement bar */}
      <div className="bg-gradient-to-r from-medicare-900 to-medicare-700 text-white text-xs py-1.5 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="font-medium">MediCare 24/7 Multi-Specialty Hospital & Trauma Center</span>
          </div>
          <div className="hidden sm:flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <PhoneCall className="w-3.5 h-3.5 text-tealcare-300" />
              <span>Emergency Helpline: <strong className="text-tealcare-200">+1 (800) 555-CARE</strong></span>
            </div>
            <span>•</span>
            <span>Mon - Sun: Open 24 Hours</span>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-medicare-600 to-tealcare-500 flex items-center justify-center text-white shadow-md shadow-medicare-500/20 group-hover:scale-105 transition-transform">
              <Activity className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <span className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-medicare-800 to-tealcare-700 bg-clip-text text-transparent">
                MediCare
              </span>
              <span className="block text-[10px] tracking-widest text-slate-400 uppercase font-bold -mt-1">
                Hospital System
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
            <Link
              to="/"
              className={`px-3.5 py-2 rounded-lg text-sm font-semibold transition-colors ${
                isActive('/') ? 'text-medicare-600 bg-medicare-50' : 'text-slate-600 hover:text-medicare-600 hover:bg-slate-50'
              }`}
            >
              Home
            </Link>
            <Link
              to="/about"
              className={`px-3.5 py-2 rounded-lg text-sm font-semibold transition-colors ${
                isActive('/about') ? 'text-medicare-600 bg-medicare-50' : 'text-slate-600 hover:text-medicare-600 hover:bg-slate-50'
              }`}
            >
              About Us
            </Link>
            <Link
              to="/doctors"
              className={`px-3.5 py-2 rounded-lg text-sm font-semibold transition-colors ${
                isActive('/doctors') ? 'text-medicare-600 bg-medicare-50' : 'text-slate-600 hover:text-medicare-600 hover:bg-slate-50'
              }`}
            >
              Our Doctors
            </Link>
            <Link
              to="/contact"
              className={`px-3.5 py-2 rounded-lg text-sm font-semibold transition-colors ${
                isActive('/contact') ? 'text-medicare-600 bg-medicare-50' : 'text-slate-600 hover:text-medicare-600 hover:bg-slate-50'
              }`}
            >
              Contact Us
            </Link>
          </nav>

          {/* Right Action Buttons */}
          <div className="hidden md:flex items-center space-x-3">
            <Link
              to="/book-appointment"
              className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-lg text-sm font-semibold text-white bg-gradient-to-r from-medicare-600 to-tealcare-600 hover:from-medicare-700 hover:to-tealcare-700 shadow-sm shadow-medicare-500/25 transition-all hover:shadow hover:-translate-y-0.5"
            >
              <Calendar className="w-4 h-4" />
              <span>Book Appointment</span>
            </Link>

            {isAuthenticated ? (
              <div className="flex items-center space-x-2 pl-2 border-l border-slate-200">
                <Link
                  to={getDashboardLink()}
                  className="flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-medicare-100 text-medicare-700 font-bold flex items-center justify-center text-xs">
                    {user?.name?.charAt(0) || 'U'}
                  </div>
                  <span className="max-w-[120px] truncate">{user?.name?.split(' ')[0]}</span>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-slate-200 text-slate-700">
                    {user?.role}
                  </span>
                </Link>
                <button
                  onClick={() => {
                    logout();
                    navigate('/');
                  }}
                  title="Logout"
                  className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="relative">
                <button
                  onClick={() => setLoginDropdownOpen(!loginDropdownOpen)}
                  onBlur={() => setTimeout(() => setLoginDropdownOpen(false), 200)}
                  className="flex items-center space-x-1.5 px-4 py-2 rounded-lg text-sm font-semibold text-slate-700 border border-slate-300 hover:border-medicare-500 hover:text-medicare-600 transition-all bg-white"
                >
                  <User className="w-4 h-4 text-slate-500" />
                  <span>Portals</span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {loginDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 rounded-xl bg-white shadow-xl ring-1 ring-slate-900/5 py-2 z-50 animate-in fade-in slide-in-from-top-2">
                    <div className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100">
                      Select Access Portal
                    </div>
                    <Link
                      to="/login?portal=patient"
                      className="flex items-center space-x-2.5 px-3.5 py-2.5 text-sm text-slate-700 hover:bg-medicare-50 hover:text-medicare-700 transition-colors"
                    >
                      <User className="w-4 h-4 text-medicare-600" />
                      <div>
                        <div className="font-semibold">Patient Portal</div>
                        <div className="text-xs text-slate-400">Bookings & Prescriptions</div>
                      </div>
                    </Link>
                    <Link
                      to="/login?portal=doctor"
                      className="flex items-center space-x-2.5 px-3.5 py-2.5 text-sm text-slate-700 hover:bg-tealcare-50 hover:text-tealcare-700 transition-colors"
                    >
                      <Stethoscope className="w-4 h-4 text-tealcare-600" />
                      <div>
                        <div className="font-semibold">Doctor Portal</div>
                        <div className="text-xs text-slate-400">Consultations & Rx</div>
                      </div>
                    </Link>
                    <Link
                      to="/login?portal=admin"
                      className="flex items-center space-x-2.5 px-3.5 py-2.5 text-sm text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors"
                    >
                      <Shield className="w-4 h-4 text-indigo-600" />
                      <div>
                        <div className="font-semibold">Admin Portal</div>
                        <div className="text-xs text-slate-400">Staff, Stats & Control</div>
                      </div>
                    </Link>
                    <div className="border-t border-slate-100 mt-1 pt-1">
                      <Link
                        to="/register"
                        className="flex items-center justify-between px-3.5 py-2 text-xs font-semibold text-medicare-600 hover:bg-medicare-50"
                      >
                        <span>New Patient? Register here</span>
                        <span>→</span>
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Mobile menu toggle */}
          <div className="flex md:hidden items-center space-x-2">
            <Link
              to="/book-appointment"
              className="p-2 text-white bg-medicare-600 rounded-lg"
              title="Book Appointment"
            >
              <Calendar className="w-5 h-5" />
            </Link>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-2 pb-6 space-y-3">
          <nav className="flex flex-col space-y-1">
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg text-base font-medium text-slate-700 hover:bg-slate-50"
            >
              Home
            </Link>
            <Link
              to="/about"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg text-base font-medium text-slate-700 hover:bg-slate-50"
            >
              About Us
            </Link>
            <Link
              to="/doctors"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg text-base font-medium text-slate-700 hover:bg-slate-50"
            >
              Our Doctors
            </Link>
            <Link
              to="/contact"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg text-base font-medium text-slate-700 hover:bg-slate-50"
            >
              Contact Us
            </Link>
          </nav>

          <div className="pt-3 border-t border-slate-200 space-y-2">
            {isAuthenticated ? (
              <>
                <Link
                  to={getDashboardLink()}
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full flex items-center justify-center space-x-2 py-2.5 rounded-lg font-semibold bg-medicare-50 text-medicare-700 border border-medicare-200"
                >
                  <Activity className="w-4 h-4" />
                  <span>Go to {user?.role?.toUpperCase()} Dashboard</span>
                </Link>
                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                    navigate('/');
                  }}
                  className="w-full flex items-center justify-center space-x-2 py-2.5 rounded-lg font-semibold text-rose-600 bg-rose-50"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center py-2.5 rounded-lg font-semibold text-slate-700 border border-slate-300"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center py-2.5 rounded-lg font-semibold text-white bg-medicare-600"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
