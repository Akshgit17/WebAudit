import React from 'react';
import { useAuth } from '../context/AuthContext';
import { User, ShieldCheck } from 'lucide-react';

export const AccountPage: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Account Settings</h1>
        <p className="text-sm text-gray-500 mt-1">Manage your WebAudit profile and authentication.</p>
      </div>

      <div className="card p-6 space-y-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center font-bold text-xl">
            {user?.name ? user.name[0].toUpperCase() : <User size={28} />}
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">{user?.name || 'Local Developer'}</h2>
            <p className="text-sm text-gray-500">{user?.email || 'local-dev@webaudit.local'}</p>
            <div className="flex items-center gap-1.5 mt-1 text-xs text-emerald-600">
              <ShieldCheck size={14} />
              <span>Authenticated</span>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-100 pt-6 space-y-4">
          <h3 className="text-sm font-semibold text-gray-900">Environment & Authentication</h3>
          <div className="bg-gray-50 p-4 rounded-xl text-xs space-y-2 text-gray-600">
            <p>
              <span className="font-semibold text-gray-700">Mode:</span> Local Development
            </p>
            <p>
              <span className="font-semibold text-gray-700">API URL:</span> http://localhost:9080/v1
            </p>
            <p>
              <span className="font-semibold text-gray-700">Method-Level Security:</span> Enabled (@EnableMethodSecurity)
            </p>
          </div>
        </div>

        <div className="border-t border-gray-100 pt-4 flex justify-end">
          <button onClick={() => logout()} className="btn-outline text-red-600 hover:bg-red-50 hover:border-red-200">
            Sign out
          </button>
        </div>
      </div>
    </div>
  );
};
