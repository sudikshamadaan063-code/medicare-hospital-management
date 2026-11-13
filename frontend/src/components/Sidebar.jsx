import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Activity,
  Calendar,
  Clock,
  FileText,
  User,
  Users,
  Settings,
  LogOut,
  BarChart3,
  Stethoscope,
  PlusCircle,
  Shield,
  ChevronRight,
} from 'lucide-react';

const Sidebar = ({ activeTab, setActiveTab }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Role-based navigation items
  const getNavItems = () => {
    if (user?.role === 'admin') {
      return [
        { id: 'overview', label: 'Hospital Overview', icon: BarChart3 },
        { id: 'doctors', label: 'Doctor Directory', icon: Stethoscope },
        { id: 'patients', label: 'Patient Directory', icon: Users },
        { id: 'appointments', label: 'Manage Appointments', icon: Calendar },
        { id: 'reports', label: 'Reports & Analytics', icon: FileText },
      ];
    } else if (user?.role === 'doctor') {
      return [
        { id: 'overview', label: 'Doctor Overview', icon: BarChart3 },
        { id: 'today', label: "Today's Schedule", icon: Clock },
        { id: 'appointments', label: 'All Consultations', icon: Calendar },
        { id: 'availability', label: 'My Availability', icon: Settings },
        { id: 'profile', label: 'Doctor Profile', icon: User },
      ];
    } else {
      // Patient
      return [
        { id: 'overview', label: 'My Health Overview', icon: BarChart3 },
        { id: 'book', label: 'Book Appointment', icon: PlusCircle, isAction: true },
        { id: 'appointments', label: 'My Appointments', icon: Calendar },
        { id: 'prescriptions', label: 'My Prescriptions', icon: FileText },
        { id: 'profile', label: 'Medical Profile', icon: User },
      ];
    }
  };

  const navItems = getNavItems();

  const getRoleBadge = () => {
    if (user?.role === 'admin') {
      return <span className="bg-indigo-100 text-indigo-700 border border-indigo-200 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">Administrator</span>;
    }
    if (user?.role === 'doctor') {
      return <span className="bg-tealcare-100 text-tealcare-800 border border-tealcare-200 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">Medical Doctor</span>;
    }
    return <span className="bg-medicare-100 text-medicare-700 border border-medicare-200 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">Patient</span>;
  };

  return (
    <aside className="w-64 bg-white border-r border-slate-200 min-h-[calc(100vh-5rem)] flex flex-col justify-between p-4 shrink-0 shadow-sm">
      <div className="space-y-6">
        {/* User Card */}
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-medicare-600 to-tealcare-500 text-white font-bold flex items-center justify-center text-sm shadow-sm">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-sm font-bold text-slate-800 truncate">{user?.name}</h3>
              <p className="text-xs text-slate-500 truncate">{user?.email}</p>
            </div>
          </div>
          <div>{getRoleBadge()}</div>
        </div>

        {/* Navigation items */}
        <div>
          <div className="px-3 mb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Navigation Menu
          </div>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    if (item.id === 'book') {
                      navigate('/book-appointment');
                    } else {
                      setActiveTab(item.id);
                    }
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                    isActive
                      ? 'bg-medicare-600 text-white shadow-sm shadow-medicare-600/30 font-bold'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                    <span>{item.label}</span>
                  </div>
                  {isActive && <ChevronRight className="w-4 h-4 text-white/80" />}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Logout button */}
      <div className="pt-4 border-t border-slate-200">
        <button
          onClick={() => {
            logout();
            navigate('/');
          }}
          className="w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold text-rose-600 hover:bg-rose-50 hover:text-rose-700 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
