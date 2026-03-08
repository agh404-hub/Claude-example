import React from 'react';

interface StatCardProps {
  label: string;
  value: string;
  subValue?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendLabel?: string;
  highlight?: boolean;
  icon?: React.ReactNode;
}

const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  subValue,
  trend,
  trendLabel,
  highlight = false,
  icon,
}) => {
  const trendColor =
    trend === 'up' ? 'text-emerald-600' :
    trend === 'down' ? 'text-red-500' :
    'text-slate-500';

  const trendArrow =
    trend === 'up' ? '▲' :
    trend === 'down' ? '▼' : '—';

  return (
    <div
      className={`rounded-2xl p-5 shadow-sm border transition-all hover:shadow-md ${
        highlight
          ? 'bg-gradient-to-br from-emerald-600 to-teal-700 text-white border-transparent'
          : 'bg-white border-slate-100 text-slate-800'
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <span className={`text-xs font-semibold uppercase tracking-wider ${highlight ? 'text-emerald-100' : 'text-slate-400'}`}>
          {label}
        </span>
        {icon && (
          <span className={`text-lg ${highlight ? 'text-emerald-200' : 'text-slate-300'}`}>
            {icon}
          </span>
        )}
      </div>
      <div className={`mt-2 text-2xl font-bold tracking-tight ${highlight ? 'text-white' : 'text-slate-900'}`}>
        {value}
      </div>
      {subValue && (
        <div className={`mt-0.5 text-sm ${highlight ? 'text-emerald-100' : 'text-slate-500'}`}>
          {subValue}
        </div>
      )}
      {trendLabel && (
        <div className={`mt-2 text-xs font-medium flex items-center gap-1 ${highlight ? 'text-emerald-100' : trendColor}`}>
          <span>{trendArrow}</span>
          <span>{trendLabel}</span>
        </div>
      )}
    </div>
  );
};

export default StatCard;
