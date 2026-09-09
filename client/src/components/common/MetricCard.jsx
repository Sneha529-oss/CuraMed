import React from 'react';

export const MetricCard = ({ title, value, subtitle, icon: Icon, color = 'brand', trend }) => {
  const colorMap = {
    brand: 'bg-teal-50 text-teal-600 border-teal-100',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    amber: 'bg-amber-50 text-amber-600 border-amber-100',
    rose: 'bg-rose-50 text-rose-600 border-rose-100',
    blue: 'bg-sky-50 text-sky-600 border-sky-100',
    slate: 'bg-slate-100 text-slate-700 border-slate-200',
  };

  const iconBg = colorMap[color] || colorMap.brand;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-soft hover:shadow-card transition-all duration-200">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-slate-600">{title}</span>
        {Icon && (
          <div className={`p-2.5 rounded-xl border ${iconBg}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      <div className="mt-3 flex items-baseline gap-2">
        <span className="text-2xl font-bold tracking-tight text-slate-900">{value}</span>
        {trend && (
          <span className={`text-xs font-semibold ${trend.positive ? 'text-emerald-600' : 'text-slate-500'}`}>
            {trend.text}
          </span>
        )}
      </div>

      {subtitle && <p className="mt-1 text-xs text-slate-500">{subtitle}</p>}
    </div>
  );
};
