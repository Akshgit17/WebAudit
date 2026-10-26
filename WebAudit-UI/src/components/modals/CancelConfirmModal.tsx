import React from 'react';

export interface CancelConfirmModalProps {
  isOpen: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export const CancelConfirmModal: React.FC<CancelConfirmModalProps> = ({
  isOpen,
  onCancel,
  onConfirm,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
      <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative bg-white w-full max-w-md rounded-2xl shadow-elevated overflow-hidden z-50 p-6">
        <h2 className="text-xl font-semibold text-gray-900">Cancel the audit in progress?</h2>
        <p className="mt-2 text-sm text-gray-600 leading-relaxed">
          Starting a new audit will stop the one currently running. Findings collected so far will not be saved.
        </p>

        <div className="mt-6 flex items-center justify-end gap-3">
          <button onClick={onCancel} className="btn-outline">
            Keep auditing
          </button>
          <button onClick={onConfirm} className="btn-accent">
            Start new audit
          </button>
        </div>
      </div>
    </div>
  );
};
