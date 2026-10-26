import React from 'react';
import { Loader2, Check, AlertTriangle, X } from 'lucide-react';

export type StatusChipKind =
  | 'queued'
  | 'running'
  | 'complete'
  | 'failed'
  | 'cancelled'
  | 'critical'
  | 'major'
  | 'minor'
  | 'open'
  | 'in-progress'
  | 'done'
  | 'ignored'
  | 'beta'
  | 'new';

export interface StatusChipProps {
  kind: StatusChipKind | string;
  size?: 'sm' | 'md';
}

export const StatusChip: React.FC<StatusChipProps> = ({ kind, size = 'sm' }) => {
  const normalized = (kind || '').toLowerCase();

  const getDetails = () => {
    switch (normalized) {
      case 'running':
      case 'auditing':
      case 'in-progress':
        return {
          label: 'Auditing…',
          bg: 'bg-brand-50 text-brand-700 border-brand-200',
          icon: <Loader2 size={12} className="animate-spin text-brand-600" />,
        };
      case 'complete':
      case 'done':
        return {
          label: 'Complete',
          bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          icon: <Check size={12} className="text-emerald-600" />,
        };
      case 'failed':
      case 'error':
        return {
          label: 'Failed',
          bg: 'bg-red-50 text-red-700 border-red-200',
          icon: <AlertTriangle size={12} className="text-red-600" />,
        };
      case 'cancelled':
        return {
          label: 'Cancelled',
          bg: 'bg-gray-100 text-gray-600 border-gray-200',
          icon: <X size={12} className="text-gray-500" />,
        };
      case 'critical':
      case 'high':
        return {
          label: 'Critical',
          bg: 'bg-red-50 text-red-700 border-red-200',
          icon: null,
        };
      case 'major':
      case 'medium':
        return {
          label: 'Medium',
          bg: 'bg-amber-50 text-amber-700 border-amber-200',
          icon: null,
        };
      case 'minor':
      case 'low':
        return {
          label: 'Low',
          bg: 'bg-blue-50 text-blue-700 border-blue-200',
          icon: null,
        };
      case 'queued':
        return {
          label: 'Queued',
          bg: 'bg-gray-100 text-gray-700 border-gray-200',
          icon: null,
        };
      case 'beta':
        return {
          label: 'BETA',
          bg: 'bg-brand-500/10 text-brand-600 border-brand-500/20',
          icon: null,
        };
      default:
        return {
          label: kind || 'Status',
          bg: 'bg-gray-100 text-gray-700 border-gray-200',
          icon: null,
        };
    }
  };

  const { label, bg, icon } = getDetails();
  const padding = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-sm';

  return (
    <span className={`inline-flex items-center gap-1.5 font-medium rounded-full border ${bg} ${padding}`}>
      {icon}
      <span>{label}</span>
    </span>
  );
};
