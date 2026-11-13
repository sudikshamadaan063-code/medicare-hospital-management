import React from 'react';
import { Link } from 'react-router-dom';
import { Activity, Home } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="min-h-[calc(100vh-15rem)] flex items-center justify-center p-6 text-center">
      <div className="max-w-md space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-medicare-100 text-medicare-600 flex items-center justify-center mx-auto">
          <Activity className="w-8 h-8" />
        </div>
        <h1 className="text-4xl font-black text-slate-900">404</h1>
        <h2 className="text-lg font-bold text-slate-700">Page Not Found</h2>
        <p className="text-xs text-slate-500">
          The requested page does not exist or has been relocated within the MediCare health portal.
        </p>
        <div className="pt-2">
          <Link
            to="/"
            className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-medicare-600 hover:bg-medicare-700 transition-colors"
          >
            <Home className="w-4 h-4" />
            <span>Return to MediCare Home</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
