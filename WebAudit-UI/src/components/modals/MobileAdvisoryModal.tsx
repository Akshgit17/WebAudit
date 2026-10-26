import React from 'react';

export interface MobileAdvisoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileAdvisoryModal: React.FC<MobileAdvisoryModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
      <div
        className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <section className="relative bg-white w-full max-w-md rounded-2xl shadow-elevated overflow-hidden z-50 animate-fade-in p-6">
        <header className="pb-2">
          <h2 className="text-xl font-semibold text-gray-900">Mobile Experience</h2>
        </header>
        <div className="py-3 text-sm text-gray-600 leading-relaxed space-y-2">
          <p>
            WebAudit is optimized for desktop browsers. You may experience layout issues on smaller screens.
          </p>
          <p>
            For the best experience inspecting rendered pixels and interactive user journeys, please visit us on a laptop or desktop computer.
          </p>
        </div>
        <footer className="pt-4">
          <button className="btn-primary w-full py-3" onClick={onClose}>
            Continue anyway
          </button>
        </footer>
      </section>
    </div>
  );
};
