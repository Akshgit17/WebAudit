import React from 'react';
import { Check, AlertTriangle } from 'lucide-react';

export interface BetaWelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BetaWelcomeModal: React.FC<BetaWelcomeModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
      <div
        className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <section className="relative bg-white w-full max-w-lg rounded-2xl shadow-elevated overflow-hidden z-50 animate-fade-in p-6">
        <header className="pb-2">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-brand-50 text-brand-600">
              Early Access
            </span>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mt-3">Welcome to WebAudit Beta</h2>
        </header>

        <div className="py-3 space-y-4">
          <p className="text-sm text-gray-600 leading-relaxed">
            Thank you for being an early adopter. Some features are actively evolving.
          </p>

          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-2">Available features</h4>
            <ul className="space-y-1.5">
              <li className="flex items-center gap-2 text-sm text-gray-600">
                <Check size={16} className="text-emerald-500 flex-shrink-0" />
                <span>Single page review, contrast analysis, and scoring</span>
              </li>
              <li className="flex items-center gap-2 text-sm text-gray-600">
                <Check size={16} className="text-emerald-500 flex-shrink-0" />
                <span>Full site review and journey mapping</span>
              </li>
              <li className="flex items-center gap-2 text-sm text-gray-600">
                <Check size={16} className="text-emerald-500 flex-shrink-0" />
                <span>Domain management & multi-page navigation audit</span>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-2">Known limitations</h4>
            <ul className="space-y-1.5">
              <li className="flex items-start gap-2 text-sm text-gray-500">
                <AlertTriangle size={16} className="text-amber-500 flex-shrink-0 mt-0.5" />
                <span>Site audit progress indicators may take a moment to refresh</span>
              </li>
              <li className="flex items-start gap-2 text-sm text-gray-500">
                <AlertTriangle size={16} className="text-amber-500 flex-shrink-0 mt-0.5" />
                <span>Dashboard for in-progress audits may display initial estimates</span>
              </li>
            </ul>
          </div>
        </div>

        <footer className="pt-4">
          <button className="btn-primary w-full py-3" onClick={onClose}>
            Get started
          </button>
        </footer>
      </section>
    </div>
  );
};
