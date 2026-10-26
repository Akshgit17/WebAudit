import React from 'react';
import { LogIn, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const AuthButton: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { isAuthenticated, user, loginWithRedirect, logout } = useAuth();

  if (isAuthenticated && user) {
    return (
      <div className={`space-y-2 ${className}`}>
        <div className="flex items-center gap-2 text-xs text-white/60 px-3">
          <div className="w-2 h-2 rounded-full bg-emerald-400" />
          <span className="truncate">{user.name || user.email}</span>
        </div>
        <button
          onClick={() => logout()}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-white/70 hover:text-white hover:bg-white/10 transition-colors duration-200"
          title="Sign out"
        >
          <LogOut size={16} />
          <span>Sign out</span>
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => loginWithRedirect()}
      className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold bg-brand-500 text-white hover:bg-brand-600 transition-colors duration-200 ${className}`}
    >
      <LogIn size={16} />
      <span>Sign in</span>
    </button>
  );
};
