import React from 'react';

export const RiskBadge = ({ level = 'Low', size = 'md' }) => {
  const normalized = (level || 'Low').toLowerCase();
  
  let bgClasses = 'bg-emerald-50 text-emerald-700 border-emerald-200';
  let dotClasses = 'bg-emerald-500';

  if (normalized === 'high') {
    bgClasses = 'bg-rose-50 text-rose-700 border-rose-200';
    dotClasses = 'bg-rose-500';
  } else if (normalized === 'moderate' || normalized === 'medium') {
    bgClasses = 'bg-amber-50 text-amber-700 border-amber-200';
    dotClasses = 'bg-amber-500';
  }

  const sizeClasses = size === 'sm' 
    ? 'px-2 py-0.5 text-xs' 
    : size === 'lg' 
    ? 'px-3.5 py-1.5 text-sm font-semibold' 
    : 'px-2.5 py-1 text-xs font-medium';

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border ${bgClasses} ${sizeClasses}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dotClasses} animate-pulse`} />
      {level} Risk
    </span>
  );
};
