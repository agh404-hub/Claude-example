import React from 'react';
import type { TimeInRangeData } from '../types';

interface TimeInRangeProps {
  data: TimeInRangeData;
}

const TimeInRange: React.FC<TimeInRangeProps> = ({ data }) => {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Time in Range</h3>
        <p className="text-sm text-gray-600 mt-1">Last 7 days</p>
      </div>

      {/* Horizontal bar chart */}
      <div className="mb-6">
        <div className="flex h-12 rounded-lg overflow-hidden">
          <div
            className="bg-critical flex items-center justify-center text-white font-semibold text-sm transition-all"
            style={{ width: `${data.belowRange}%` }}
          >
            {data.belowRange > 5 && `${data.belowRange}%`}
          </div>
          <div
            className="bg-safe flex items-center justify-center text-white font-semibold text-sm transition-all"
            style={{ width: `${data.inRange}%` }}
          >
            {data.inRange > 5 && `${data.inRange}%`}
          </div>
          <div
            className="bg-warning flex items-center justify-center text-white font-semibold text-sm transition-all"
            style={{ width: `${data.aboveRange}%` }}
          >
            {data.aboveRange > 5 && `${data.aboveRange}%`}
          </div>
        </div>
      </div>

      {/* Detailed breakdown */}
      <div className="space-y-4">
        {/* In Range */}
        <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 rounded bg-safe"></div>
            <div>
              <p className="text-sm font-medium text-gray-900">In Range</p>
              <p className="text-xs text-gray-600">70-180 mg/dL</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-safe">{data.inRange}%</p>
            <p className="text-xs text-gray-600">{data.inRangeHours} hours</p>
          </div>
        </div>

        {/* Above Range */}
        <div className="flex items-center justify-between p-4 bg-amber-50 rounded-lg border border-amber-200">
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 rounded bg-warning"></div>
            <div>
              <p className="text-sm font-medium text-gray-900">Above Range</p>
              <p className="text-xs text-gray-600">&gt;180 mg/dL</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-warning">{data.aboveRange}%</p>
            <p className="text-xs text-gray-600">{data.aboveRangeHours} hours</p>
          </div>
        </div>

        {/* Below Range */}
        <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-200">
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 rounded bg-critical"></div>
            <div>
              <p className="text-sm font-medium text-gray-900">Below Range</p>
              <p className="text-xs text-gray-600">&lt;70 mg/dL</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-critical">{data.belowRange}%</p>
            <p className="text-xs text-gray-600">{data.belowRangeHours} hours</p>
          </div>
        </div>
      </div>

      {/* Clinical target note */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <div className="flex items-start gap-2">
          <svg
            className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <div className="text-sm text-blue-800">
            <p className="font-semibold mb-1">Clinical Target</p>
            <p>Aim for &gt;70% time in range (70-180 mg/dL) and &lt;4% time below range (&lt;70 mg/dL)</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TimeInRange;
