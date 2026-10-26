import React from 'react';
import { CheckCircle2, AlertTriangle, AlertOctagon, Loader2 } from 'lucide-react';

export type ScoreBadgeSize = 'sm' | 'md' | 'lg';

export interface ScoreBadgeProps {
  score: number;
  size?: ScoreBadgeSize;
  showValue?: boolean;
  showIcon?: boolean;
  loading?: boolean;
}

export const ScoreBadge: React.FC<ScoreBadgeProps> = ({
  score = 0,
  size = 'md',
  showValue = true,
  showIcon = true,
  loading = false,
}) => {
  const rounded = Math.round(score);

  if (loading) {
    const spinnerSize = size === 'sm' ? 14 : size === 'lg' ? 24 : 18;
    return (
      <span className="inline-flex items-center gap-1.5 text-gray-400">
        <Loader2 className="animate-spin" size={spinnerSize} />
        {showValue && <span className="text-xs text-gray-400">Auditing…</span>}
      </span>
    );
  }

  let color = '#ef4444'; // critical
  let Icon = AlertOctagon;
  if (rounded >= 80) {
    color = '#10b981'; // good
    Icon = CheckCircle2;
  } else if (rounded >= 60) {
    color = '#f59e0b'; // warning
    Icon = AlertTriangle;
  }

  const iconSize = size === 'sm' ? 14 : size === 'lg' ? 22 : 16;
  const textSize = size === 'sm' ? 'text-xs' : size === 'lg' ? 'text-xl' : 'text-sm';

  return (
    <span className="inline-flex items-center gap-1.5" style={{ color }}>
      {showIcon && <Icon size={iconSize} />}
      {showValue && <span className={`${textSize} font-semibold`}>{rounded}%</span>}
    </span>
  );
};
