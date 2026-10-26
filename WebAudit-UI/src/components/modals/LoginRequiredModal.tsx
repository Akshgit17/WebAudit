import React from 'react';
import { useAuth } from '../../context/AuthContext';

export interface LoginRequiredModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LoginRequiredModal: React.FC<LoginRequiredModalProps> = ({ isOpen, onClose }) => {
  const { loginWithRedirect } = useAuth();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
      <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white w-full max-w-md rounded-2xl shadow-elevated overflow-hidden z-50 p-6">
        <h2 className="text-xl font-semibold text-gray-900">Save this audit for later?</h2>
        <p className="mt-2 text-sm text-gray-600 leading-relaxed">
          Create a free account to save your report, track your score over time, and unlock full domain auditing.
        </p>

        <div className="mt-6 flex items-center justify-end gap-3">
          <button onClick={onClose} className="btn-outline">
            Not now
          </button>
          <button
            onClick={() => {
              onClose();
              loginWithRedirect();
            }}
            className="btn-accent"
          >
            Sign in / Sign up
          </button>
        </div>
      </div>
    </div>
  );
};
