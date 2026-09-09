import React from 'react';
import { Loader2 } from 'lucide-react';

export const LoadingSpinner = ({ text = 'Loading...', size = 'md', className = '' }) => {
  const sizeClasses = size === 'sm' ? 'w-4 h-4' : size === 'lg' ? 'w-8 h-8' : 'w-6 h-6';

  return (
    <div className={`flex flex-col items-center justify-center p-8 text-slate-500 ${className}`}>
      <Loader2 className={`${sizeClasses} animate-spin text-teal-600 mb-2`} />
      {text && <p className="text-sm font-medium text-slate-600">{text}</p>}
    </div>
  );
};
