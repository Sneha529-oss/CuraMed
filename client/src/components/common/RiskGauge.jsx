import React from 'react';

export const RiskGauge = ({ probability = 0, riskLevel = 'Low', size = 200 }) => {
  const percentage = Math.min(Math.max(probability, 0), 100);
  
  // Calculate arc parameters for semi-circle gauge (180 degrees)
  const radius = 70;
  const strokeWidth = 14;
  const circumference = Math.PI * radius; // Half circle
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  let strokeColor = '#059669'; // emerald
  let textColor = 'text-emerald-700';
  let bgColor = 'text-emerald-50';

  if (riskLevel.toLowerCase() === 'high') {
    strokeColor = '#e11d48'; // rose
    textColor = 'text-rose-700';
    bgColor = 'text-rose-50';
  } else if (riskLevel.toLowerCase() === 'moderate' || riskLevel.toLowerCase() === 'medium') {
    strokeColor = '#d97706'; // amber
    textColor = 'text-amber-700';
    bgColor = 'text-amber-50';
  }

  return (
    <div className="flex flex-col items-center justify-center relative">
      <svg width={size} height={size * 0.65} viewBox="0 0 180 110" className="overflow-visible">
        {/* Background track arc */}
        <path
          d="M 20 95 A 70 70 0 0 1 160 95"
          fill="none"
          stroke="#e2e8f0"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />
        {/* Active colored arc */}
        <path
          d="M 20 95 A 70 70 0 0 1 160 95"
          fill="none"
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      
      {/* Centered Probability Readout */}
      <div className="absolute top-[42%] flex flex-col items-center">
        <div className="flex items-baseline">
          <span className={`text-3xl font-extrabold tracking-tight ${textColor}`}>
            {percentage.toFixed(1)}
          </span>
          <span className={`text-base font-semibold ml-0.5 ${textColor}`}>%</span>
        </div>
        <span className="text-xs uppercase tracking-wider text-slate-500 font-medium mt-0.5">
          Risk Probability
        </span>
      </div>

      {/* Baseline labels */}
      <div className="w-full flex justify-between px-6 text-[11px] font-medium text-slate-400 -mt-2">
        <span>0% (Low)</span>
        <span>50% (Mod)</span>
        <span>100% (High)</span>
      </div>
    </div>
  );
};
