import React from 'react';
import type { Home } from '../../types/homes';

interface Props {
  home: Home;
  myBeds: number;
  myBaths: number;
  mySqft: number;
}

const fmt = (n: number) =>
  n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

const statusBadge = (status: Home['status'], dom?: number) => {
  if (status === 'active')
    return <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-xs font-semibold">Active · {dom}d</span>;
  if (status === 'pending')
    return <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-xs font-semibold">Pending · {dom}d</span>;
  return <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-xs font-semibold">Sold</span>;
};

const ListingCard: React.FC<Props> = ({ home, myBeds, myBaths, mySqft }) => {
  const isComp =
    home.beds === myBeds &&
    home.baths === myBaths &&
    Math.abs(home.sqft - mySqft) <= 200;

  const price = home.listPrice ?? home.salePrice ?? 0;
  const ppsf = home.pricePerSqft ?? Math.round(price / home.sqft);

  return (
    <div
      className={`relative rounded-2xl border shadow-sm hover:shadow-md transition-all bg-white overflow-hidden ${
        isComp ? 'border-emerald-300 ring-1 ring-emerald-200' : 'border-slate-100'
      }`}
    >
      {isComp && (
        <div className="absolute top-3 right-3 bg-emerald-600 text-white text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full">
          Comparable
        </div>
      )}

      {/* Color band */}
      <div className={`h-1.5 w-full ${
        home.status === 'active' ? 'bg-emerald-500' :
        home.status === 'pending' ? 'bg-amber-400' :
        'bg-slate-300'
      }`} />

      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="text-sm font-semibold text-slate-800 leading-snug pr-14">{home.address}</h3>
        </div>

        <div className="flex items-center gap-2 mb-3">
          {statusBadge(home.status, home.daysOnMarket)}
          {home.hasPool && (
            <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 text-xs font-semibold">Pool</span>
          )}
        </div>

        <div className="text-xl font-bold text-slate-900 mb-1">{fmt(price)}</div>
        <div className="text-xs text-slate-500 mb-3">{fmt(ppsf)}/sqft · Built {home.yearBuilt}</div>

        <div className="grid grid-cols-4 gap-1 text-center bg-slate-50 rounded-xl p-2">
          {[
            { label: 'Bed', value: home.beds },
            { label: 'Bath', value: home.baths },
            { label: 'Sqft', value: home.sqft.toLocaleString() },
            { label: 'Garage', value: `${home.garage}c` },
          ].map(({ label, value }) => (
            <div key={label}>
              <div className="text-sm font-semibold text-slate-800">{value}</div>
              <div className="text-[10px] text-slate-400 font-medium uppercase">{label}</div>
            </div>
          ))}
        </div>

        {home.features.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1">
            {home.features.slice(0, 3).map((f) => (
              <span key={f} className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-medium">
                {f}
              </span>
            ))}
            {home.features.length > 3 && (
              <span className="text-[10px] text-slate-400 px-1 py-0.5">+{home.features.length - 3} more</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ListingCard;
