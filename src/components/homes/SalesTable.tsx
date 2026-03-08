import React, { useState } from 'react';
import type { Home } from '../../types/homes';

interface Props {
  sales: Home[];
  myBeds: number;
  myBaths: number;
  mySqft: number;
}

const fmt = (n: number) =>
  n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

const SalesTable: React.FC<Props> = ({ sales, myBeds, myBaths, mySqft }) => {
  const [showCompsOnly, setShowCompsOnly] = useState(false);

  const displayed = showCompsOnly
    ? sales.filter(
        (s) =>
          s.beds === myBeds &&
          s.baths === myBaths &&
          Math.abs(s.sqft - mySqft) <= 200
      )
    : sales;

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-base font-bold text-slate-900">Recent Sales</h2>
          <p className="text-xs text-slate-400 mt-0.5">Last 6 months · Trilogy at the Vineyards</p>
        </div>
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <div className="relative">
            <input
              type="checkbox"
              className="sr-only"
              checked={showCompsOnly}
              onChange={(e) => setShowCompsOnly(e.target.checked)}
            />
            <div className={`w-10 h-5 rounded-full transition-colors ${showCompsOnly ? 'bg-emerald-500' : 'bg-slate-200'}`} />
            <div className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${showCompsOnly ? 'translate-x-5' : ''}`} />
          </div>
          <span className="text-xs font-semibold text-slate-600">Comparable only (2bd/2ba)</span>
        </label>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 text-left">
              {['Address', 'Bd/Ba', 'Sqft', 'List Price', 'Sale Price', '$/Sqft', 'DOM', 'Sold Date'].map((h) => (
                <th key={h} className="px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider whitespace-nowrap">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {displayed.map((s) => {
              const isComp =
                s.beds === myBeds &&
                s.baths === myBaths &&
                Math.abs(s.sqft - mySqft) <= 200;
              const ratio = s.listPrice && s.salePrice
                ? ((s.salePrice / s.listPrice) * 100).toFixed(1)
                : null;

              return (
                <tr
                  key={s.id}
                  className={`transition-colors hover:bg-slate-50 ${isComp ? 'bg-emerald-50/40' : ''}`}
                >
                  <td className="px-4 py-3 text-slate-800 font-medium whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      {isComp && (
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block flex-shrink-0" />
                      )}
                      <span className="truncate max-w-[200px]" title={s.address}>{s.address}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{s.beds}/{s.baths}</td>
                  <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{s.sqft.toLocaleString()}</td>
                  <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{s.listPrice ? fmt(s.listPrice) : '—'}</td>
                  <td className="px-4 py-3 font-semibold text-slate-900 whitespace-nowrap">
                    <div>{s.salePrice ? fmt(s.salePrice) : '—'}</div>
                    {ratio && (
                      <div className={`text-[10px] font-medium ${parseFloat(ratio) >= 100 ? 'text-emerald-600' : 'text-red-500'}`}>
                        {ratio}% of list
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-slate-600 whitespace-nowrap">
                    {s.pricePerSqft ? fmt(s.pricePerSqft) : '—'}
                  </td>
                  <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{s.daysOnMarket ?? '—'}</td>
                  <td className="px-4 py-3 text-slate-500 whitespace-nowrap text-xs">
                    {s.saleDate
                      ? new Date(s.saleDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                      : '—'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {displayed.length === 0 && (
          <div className="text-center py-12 text-slate-400 text-sm">
            No comparable sales found.
          </div>
        )}
      </div>
    </div>
  );
};

export default SalesTable;
