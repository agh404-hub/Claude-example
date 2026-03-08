import React from 'react';
import type { MyHome, ComparableStats } from '../../types/homes';

interface Props {
  home: MyHome;
  compStats: ComparableStats;
}

const fmt = (n: number) =>
  n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

const MyHomePanel: React.FC<Props> = ({ home, compStats }) => {
  const ppsf = Math.round(home.estimatedValue / home.sqft);
  const vsAvg = home.estimatedValue - compStats.avgSalePrice;
  const vsAvgPct = ((vsAvg / compStats.avgSalePrice) * 100).toFixed(1);
  const barPct = Math.round(
    ((home.estimatedValue - home.estimatedValueLow) /
      (home.estimatedValueHigh - home.estimatedValueLow)) *
      100
  );

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-700 px-6 py-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center text-white text-lg">
            🏠
          </div>
          <div>
            <h2 className="text-white font-bold text-lg leading-tight">My Home</h2>
            <p className="text-slate-300 text-sm">{home.address}</p>
          </div>
        </div>
      </div>

      <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Home Details */}
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">Home Details</h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Bedrooms', value: `${home.beds} bd` },
              { label: 'Bathrooms', value: `${home.baths} ba` },
              { label: 'Square Feet', value: home.sqft.toLocaleString() },
              { label: 'Year Built', value: home.yearBuilt },
              { label: 'Garage', value: `${home.garage}-car` },
              { label: 'Pool', value: home.hasPool ? 'Yes' : 'No' },
            ].map(({ label, value }) => (
              <div key={label} className="bg-slate-50 rounded-xl p-3">
                <div className="text-xs text-slate-400 font-medium">{label}</div>
                <div className="text-sm font-semibold text-slate-800 mt-0.5">{value}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Estimated Value */}
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">Estimated Value</h3>
          <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4">
            <div className="text-3xl font-bold text-emerald-700">{fmt(home.estimatedValue)}</div>
            <div className="text-sm text-slate-500 mt-1">
              {fmt(ppsf)}/sqft · Updated {new Date(home.lastUpdated).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </div>

            {/* Value range bar */}
            <div className="mt-4">
              <div className="flex justify-between text-xs text-slate-500 mb-1">
                <span>{fmt(home.estimatedValueLow)}</span>
                <span className="font-semibold text-emerald-700">Estimate</span>
                <span>{fmt(home.estimatedValueHigh)}</span>
              </div>
              <div className="relative h-2 bg-slate-200 rounded-full overflow-hidden">
                <div className="absolute inset-y-0 left-0 bg-emerald-200 rounded-full" style={{ width: '100%' }} />
                <div
                  className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-emerald-600 rounded-full border-2 border-white shadow"
                  style={{ left: `calc(${barPct}% - 6px)` }}
                />
              </div>
            </div>

            {/* vs comps */}
            <div className={`mt-4 text-sm font-medium flex items-center gap-1 ${vsAvg >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
              <span>{vsAvg >= 0 ? '▲' : '▼'}</span>
              <span>{fmt(Math.abs(vsAvg))} ({vsAvgPct}%) vs avg comparable sale</span>
            </div>
          </div>

          {/* Comparable summary */}
          <div className="mt-4 bg-slate-50 rounded-xl p-4">
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              2bd/2ba Comparable Homes
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <div className="text-slate-400 text-xs">Avg Sale Price</div>
                <div className="font-semibold text-slate-800">{fmt(compStats.avgSalePrice)}</div>
              </div>
              <div>
                <div className="text-slate-400 text-xs">Avg $/sqft</div>
                <div className="font-semibold text-slate-800">{fmt(compStats.avgPricePerSqft)}</div>
              </div>
              <div>
                <div className="text-slate-400 text-xs">Avg Days on Market</div>
                <div className="font-semibold text-slate-800">{compStats.avgDaysOnMarket} days</div>
              </div>
              <div>
                <div className="text-slate-400 text-xs">Comps Used</div>
                <div className="font-semibold text-slate-800">{compStats.count} sales</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyHomePanel;
