import React from 'react';
import type { InsulinData } from '../types';

interface InsulinSummaryProps {
  data: InsulinData;
}

const InsulinSummary: React.FC<InsulinSummaryProps> = ({ data }) => {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Insulin Delivery Summary</h3>
        <p className="text-sm text-gray-600 mt-1">Daily average - Last 7 days</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Total Daily Insulin */}
        <div className="col-span-2 p-5 bg-gradient-to-br from-primary to-primary-light rounded-lg text-white">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium opacity-90 mb-1">Total Daily Insulin</p>
              <p className="text-4xl font-bold">{data.totalDaily}</p>
              <p className="text-sm opacity-75 mt-1">units/day</p>
            </div>
            <div className="bg-white/20 p-3 rounded-lg">
              <svg
                className="h-8 w-8"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Basal Insulin */}
        <div className="p-4 bg-teal/5 rounded-lg border border-teal/20">
          <div className="flex items-center gap-2 mb-2">
            <div className="bg-teal p-2 rounded-md">
              <svg
                className="h-5 w-5 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                />
              </svg>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-600 uppercase">Basal</p>
            </div>
          </div>
          <p className="text-3xl font-bold text-teal">{data.basalAverage}</p>
          <p className="text-sm text-gray-600 mt-1">units/day</p>
          <p className="text-xs text-gray-500 mt-2">Background insulin</p>
        </div>

        {/* Bolus Insulin */}
        <div className="p-4 bg-teal/5 rounded-lg border border-teal/20">
          <div className="flex items-center gap-2 mb-2">
            <div className="bg-teal-dark p-2 rounded-md">
              <svg
                className="h-5 w-5 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11m0-5.5v-1a1.5 1.5 0 013 0v1m0 0V11m0-5.5a1.5 1.5 0 013 0v3m0 0V11"
                />
              </svg>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-600 uppercase">Bolus</p>
            </div>
          </div>
          <p className="text-3xl font-bold text-teal-dark">{data.bolusAverage}</p>
          <p className="text-sm text-gray-600 mt-1">units/day</p>
          <p className="text-xs text-gray-500 mt-2">Mealtime insulin</p>
        </div>

        {/* Boluses Per Day */}
        <div className="col-span-2 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 uppercase mb-1">Boluses Per Day</p>
              <p className="text-2xl font-bold text-primary">{data.bolusesPerDay}</p>
              <p className="text-xs text-gray-500 mt-1">Average number of doses</p>
            </div>
            <div className="flex items-center gap-1">
              {Array.from({ length: data.bolusesPerDay }).map((_, i) => (
                <div key={i} className="w-2 h-8 bg-teal rounded-sm"></div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Ratio */}
      <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <svg
              className="h-5 w-5 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
              />
            </svg>
            <span className="text-sm font-medium text-blue-900">Basal-Bolus Ratio</span>
          </div>
          <div className="text-right">
            <p className="text-lg font-bold text-blue-900">
              {Math.round((data.basalAverage / data.totalDaily) * 100)}% /{' '}
              {Math.round((data.bolusAverage / data.totalDaily) * 100)}%
            </p>
            <p className="text-xs text-blue-700">Typical target: 40-60% / 40-60%</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InsulinSummary;
