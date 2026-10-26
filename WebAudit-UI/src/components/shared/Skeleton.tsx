import React from 'react';

export interface SkeletonProps {
  variant?: 'row' | 'card' | 'text';
  rows?: number;
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  variant = 'row',
  rows = 3,
  className = '',
}) => {
  if (variant === 'row') {
    return (
      <div className={`space-y-3 ${className}`}>
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="card p-4 animate-pulse">
            <div className="grid grid-cols-12 gap-4 items-center">
              <div className="col-span-4 h-4 bg-gray-200 rounded w-3/4" />
              <div className="col-span-1 h-5 bg-gray-200 rounded-full w-16 mx-auto" />
              <div className="col-span-1 h-5 bg-gray-200 rounded-full w-12 mx-auto" />
              <div className="col-span-2 h-4 bg-gray-200 rounded w-12 mx-auto" />
              <div className="col-span-2 h-4 bg-gray-200 rounded w-12 mx-auto" />
              <div className="col-span-1 h-4 bg-gray-200 rounded w-12 mx-auto" />
              <div className="col-span-1 h-4 bg-gray-200 rounded w-4 mx-auto" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (variant === 'card') {
    return (
      <div className={`card p-6 animate-pulse space-y-4 ${className}`}>
        <div className="h-5 bg-gray-200 rounded w-1/3" />
        <div className="h-4 bg-gray-200 rounded w-2/3" />
        <div className="h-20 bg-gray-100 rounded w-full" />
      </div>
    );
  }

  return (
    <div className={`animate-pulse space-y-2 ${className}`}>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-4 bg-gray-200 rounded w-full" />
      ))}
    </div>
  );
};
