import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import type { GlucoseTrend } from '../types';

interface GlucoseCardProps {
  value: number;
  timestamp: Date;
  trend: GlucoseTrend;
}

const GlucoseCard: React.FC<GlucoseCardProps> = ({ value, timestamp, trend }) => {
  // Determine color based on glucose value
  const getGlucoseStatus = (val: number): { color: string; label: string; bgColor: string } => {
    if (val >= 70 && val <= 180) {
      return {
        color: 'text-safe',
        label: 'In Range',
        bgColor: 'bg-green-50',
      };
    } else if ((val >= 54 && val < 70) || (val > 180 && val <= 250)) {
      return {
        color: 'text-warning',
        label: val < 70 ? 'Low' : 'High',
        bgColor: 'bg-amber-50',
      };
    } else {
      return {
        color: 'text-critical',
        label: val < 54 ? 'Critically Low' : 'Critically High',
        bgColor: 'bg-red-50',
      };
    }
  };

  const getTrendIcon = (t: GlucoseTrend): string => {
    switch (t) {
      case 'rising':
        return '↑';
      case 'falling':
        return '↓';
      case 'steady':
        return '→';
    }
  };

  const getTrendLabel = (t: GlucoseTrend): string => {
    switch (t) {
      case 'rising':
        return 'Rising';
      case 'falling':
        return 'Falling';
      case 'steady':
        return 'Steady';
    }
  };

  const getTrendColor = (t: GlucoseTrend): string => {
    switch (t) {
      case 'rising':
        return 'text-red-600';
      case 'falling':
        return 'text-blue-600';
      case 'steady':
        return 'text-gray-600';
    }
  };

  const status = getGlucoseStatus(value);

  return (
    <div className={`${status.bgColor} rounded-lg border-2 ${status.color.replace('text-', 'border-')} p-6 transition-all hover:shadow-lg`}>
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-sm font-medium text-gray-600 uppercase tracking-wide">
            Current Glucose
          </h3>
          <p className={`text-xs ${status.color} font-semibold mt-1`}>
            {status.label}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-3xl font-bold ${getTrendColor(trend)}`}>
            {getTrendIcon(trend)}
          </span>
        </div>
      </div>

      <div className="flex items-baseline gap-2 mb-4">
        <span className={`text-6xl font-bold ${status.color}`}>
          {value}
        </span>
        <span className="text-2xl text-gray-500 font-medium">
          mg/dL
        </span>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
        <div>
          <p className="text-xs text-gray-500">Trend</p>
          <p className={`text-sm font-semibold ${getTrendColor(trend)}`}>
            {getTrendLabel(trend)}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-500">Last Reading</p>
          <p className="text-sm font-medium text-gray-700">
            {formatDistanceToNow(timestamp, { addSuffix: true })}
          </p>
        </div>
      </div>

      {/* Target range indicator */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between text-xs text-gray-600 mb-2">
          <span>Target Range</span>
          <span className="font-semibold">70-180 mg/dL</span>
        </div>
        <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden">
          <div className="absolute inset-0 flex">
            <div className="w-[27.5%] bg-red-200"></div>
            <div className="w-[45%] bg-green-200"></div>
            <div className="w-[27.5%] bg-red-200"></div>
          </div>
          {/* Current position indicator */}
          <div
            className="absolute top-0 h-full w-1 bg-gray-800"
            style={{
              left: `${Math.min(100, Math.max(0, (value / 400) * 100))}%`,
              transform: 'translateX(-50%)',
            }}
          ></div>
        </div>
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>40</span>
          <span>180</span>
          <span>400</span>
        </div>
      </div>
    </div>
  );
};

export default GlucoseCard;
