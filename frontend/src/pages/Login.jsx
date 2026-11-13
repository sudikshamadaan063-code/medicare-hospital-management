import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Activity,
  User,
  Stethoscope,
  Shield,
  Lock,
  Mail,
  AlertCircle,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

const Login = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuth();

  const initialPortal = searchParams.get('portal') || 'patient';
  const [selectedRole, setSelectedRole] = useState(initialPortal);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const portal = searchParams.get('portal');
    if (portal && ['patient', 'doctor', 'admin'].includes(portal)) {
      setSelectedRole(portal);
    }
  }, [searchParams]);

  // Demo accounts autofill helper
  const fillDemoAccount = (role, demoEmail, demoPass) => {
    setSelectedRole(role);
    setEmail(demoEmail);
    setPassword(demoPass);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = await login(email, password, selectedRole);
      // Navigate to corresponding dashboard
      if (user.role === 'admin') navigate('/admin/dashboard');
      else if (user.role === 'doctor') navigate('/doctor/dashboard');
      else navigate('/patient/dashboard');
    } catch (err) {
      setError(
        err.response?.data?.message || 'Login failed. Please verify your credentials and portal.'
      );
    } finally {
      setLoading(false);
    }
  };

  const getPortalInfo = () => {
    if (selectedRole === 'admin') {
      return {
        badge: 'Administrative Portal',
        color: 'from-indigo-600 to-slate-900',
        icon: Shield,
        desc: 'Access hospital statistics, manage medical faculty, view analytics, and oversee operations.',
      };
    }
    if (selectedRole === 'doctor') {
      return {
        badge: 'Doctor & Clinician Portal',
        color: 'from-tealcare-600 to-medicare-800',
        icon: Stethoscope,
        desc: 'Access patient consultations, issue electronic prescriptions (Rx), and configure consultation schedules.',
      };
    }
    return {
      badge: 'Patient Portal',
      color: 'from-medicare-600 to-tealcare-700',
      icon: User,
      desc: 'Book specialist appointments, view digital prescriptions, and check consultation history.',
    };
  };

  const portal = getPortalInfo();
  const PortalIcon = portal.icon;

  return (
    <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-100/60">
      <div className="max-w-md w-full space-y-6">
        {/* Brand & Portal Switcher */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-medicare-600 to-tealcare-500 text-white shadow-md shadow-medicare-600/30">
            <Activity className="w-6 h-6 stroke-[2.5]" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Sign in to MediCare
          </h2>
          <p className="text-xs text-slate-500">
            Select your role to access your personalized hospital workspace
          </p>
        </div>

        {/* Role Tabs */}
        <div className="grid grid-cols-3 gap-1.5 p-1 bg-white rounded-2xl border border-slate-200 shadow-sm text-xs font-bold">
          <button
            type="button"
            onClick={() => {
              setSelectedRole('patient');
              setError('');
            }}
            className={`flex items-center justify-center space-x-1.5 py-2.5 rounded-xl transition-all ${
              selectedRole === 'patient'
                ? 'bg-medicare-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Patient</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setSelectedRole('doctor');
              setError('');
            }}
            className={`flex items-center justify-center space-x-1.5 py-2.5 rounded-xl transition-all ${
              selectedRole === 'doctor'
                ? 'bg-tealcare-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Stethoscope className="w-3.5 h-3.5" />
            <span>Doctor</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setSelectedRole('admin');
              setError('');
            }}
            className={`flex items-center justify-center space-x-1.5 py-2.5 rounded-xl transition-all ${
              selectedRole === 'admin'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Admin</span>
          </button>
        </div>

        {/* Login Form Box */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center space-x-3 p-3 bg-slate-50 rounded-xl border border-slate-200/80">
            <div className="w-8 h-8 rounded-lg bg-medicare-100 text-medicare-700 flex items-center justify-center">
              <PortalIcon className="w-4 h-4" />
            </div>
            <div className="text-xs">
              <span className="font-bold text-slate-800 block">{portal.badge}</span>
              <span className="text-slate-500 line-clamp-1">{portal.desc}</span>
            </div>
          </div>

          {error && (
            <div className="p-3 text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-xl flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  placeholder="name@medicare.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-medicare-500 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-medicare-500 outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl text-sm font-bold text-white bg-medicare-600 hover:bg-medicare-700 shadow-md shadow-medicare-600/30 transition-all disabled:opacity-50 flex items-center justify-center space-x-2"
            >
              <span>{loading ? 'Authenticating...' : `Sign In to ${portal.badge}`}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick 1-Click Demo Accounts Selector */}
          <div className="pt-4 border-t border-slate-100 space-y-2">
            <div className="flex items-center space-x-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Quick Demo Accounts (1-Click Fill)</span>
            </div>
            <div className="grid grid-cols-2 gap-1.5 text-xs">
              <button
                type="button"
                onClick={() => fillDemoAccount('patient', 'rahul.verma@example.com', 'patient123')}
                className="p-2 text-left rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-colors"
              >
                <div className="font-bold text-slate-800">Demo Patient</div>
                <div className="text-[10px] text-slate-500">Rahul Verma</div>
              </button>
              <button
                type="button"
                onClick={() => fillDemoAccount('doctor', 'dr.sharma@medicare.com', 'doctor123')}
                className="p-2 text-left rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-colors"
              >
                <div className="font-bold text-slate-800">Demo Doctor</div>
                <div className="text-[10px] text-slate-500">Dr. Sharma (Cardio)</div>
              </button>
              <button
                type="button"
                onClick={() => fillDemoAccount('doctor', 'dr.sarah@medicare.com', 'doctor123')}
                className="p-2 text-left rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-colors"
              >
                <div className="font-bold text-slate-800">Demo Doctor 2</div>
                <div className="text-[10px] text-slate-500">Dr. Sarah (Neuro)</div>
              </button>
              <button
                type="button"
                onClick={() => fillDemoAccount('admin', 'admin@medicare.com', 'admin123')}
                className="p-2 text-left rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-colors"
              >
                <div className="font-bold text-slate-800">Demo Admin</div>
                <div className="text-[10px] text-slate-500">Hospital Admin</div>
              </button>
            </div>
          </div>

          {selectedRole === 'patient' && (
            <div className="pt-2 text-center text-xs text-slate-500">
              Don't have a patient account yet?{' '}
              <Link to="/register" className="font-bold text-medicare-600 hover:text-medicare-700">
                Register here
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
