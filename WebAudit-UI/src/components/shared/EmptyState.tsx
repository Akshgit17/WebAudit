import React from 'react';
import { Search } from 'lucide-react';

export interface EmptyStateProps {
  title?: string;
  body?: string;
  actionText?: string;
  onAction?: () => void;
  compact?: boolean;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'No records found.',
  body = 'Run an audit to see results here.',
  actionText,
  onAction,
  compact = false,
}) => {
  return (
    <div className={`card text-center flex flex-col items-center justify-center ${compact ? 'p-8' : 'p-16'}`}>
      <div className="w-14 h-14 rounded-2xl bg-brand-50 text-brand-500 flex items-center justify-center mb-4">
        <Search size={28} />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-1">{title}</h3>
      <p className="text-sm text-gray-500 max-w-md leading-relaxed">{body}</p>
      {actionText && onAction && (
        <button onClick={onAction} className="btn-accent mt-6">
          {actionText}
        </button>
      )}
    </div>
  );
};
