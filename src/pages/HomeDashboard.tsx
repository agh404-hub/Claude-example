import React, { useState } from 'react';
import StatCard from '../components/homes/StatCard';
import MyHomePanel from '../components/homes/MyHomePanel';
import ListingCard from '../components/homes/ListingCard';
import SalesTable from '../components/homes/SalesTable';
import PriceTrendChart from '../components/homes/PriceTrendChart';
import MarketAnalyst from '../components/homes/MarketAnalyst';
import {
  MY_HOME,
  ACTIVE_LISTINGS,
  RECENT_SALES,
  MARKET_STATS,
  COMP_STATS,
  PRICE_TREND,
} from '../data/homesData';

type Tab = 'overview' | 'listings' | 'sales' | 'trends';

const NAV_TABS: { id: Tab; label: string; icon: string }[] = [
  { id: 'overview', label: 'Overview', icon: '◉' },
  { id: 'listings', label: 'For Sale', icon: '🏷' },
  { id: 'sales', label: 'Recent Sales', icon: '✓' },
  { id: 'trends', label: 'Trends', icon: '↗' },
];

const fmt = (n: number) =>
  n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

const HomeDashboard: React.FC = () => {
  const [tab, setTab] = useState<Tab>('overview');
  const [listingsFilter, setListingsFilter] = useState<'all' | 'comps'>('all');

  const { beds, baths, sqft } = MY_HOME;

  const activeListings = ACTIVE_LISTINGS.filter((h) => h.status === 'active');
  const pendingListings = ACTIVE_LISTINGS.filter((h) => h.status === 'pending');

  const filteredListings =
    listingsFilter === 'comps'
      ? ACTIVE_LISTINGS.filter(
          (h) =>
            h.beds === beds &&
            h.baths === baths &&
            Math.abs(h.sqft - sqft) <= 200
        )
      : ACTIVE_LISTINGS;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top Nav */}
      <header className="bg-white border-b border-slate-100 sticky top-0 z-20 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16 gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                T
              </div>
              <div className="min-w-0">
                <div className="font-bold text-slate-900 text-sm leading-tight truncate">
                  Trilogy at the Vineyards
                </div>
                <div className="text-xs text-slate-400 leading-tight">Brentwood, CA 94513</div>
              </div>
            </div>

            <nav className="flex gap-1 bg-slate-100 rounded-xl p-1">
              {NAV_TABS.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                    tab === t.id
                      ? 'bg-white shadow text-slate-900'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  <span className="hidden sm:inline">{t.icon} </span>
                  {t.label}
                </button>
              ))}
            </nav>

            <div className="text-right hidden sm:block flex-shrink-0">
              <div className="text-xs text-slate-400">Last updated</div>
              <div className="text-xs font-semibold text-slate-700">Mar 8, 2026</div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6">

        {/* ── Overview Tab ── */}
        {tab === 'overview' && (
          <>
            {/* My Home */}
            <MyHomePanel home={MY_HOME} compStats={COMP_STATS} />

            {/* Market Stats */}
            <div>
              <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3">Market Snapshot · All Homes</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                <StatCard
                  label="Active Listings"
                  value={String(MARKET_STATS.totalActiveListing)}
                  subValue={`${pendingListings.length} pending`}
                  trend="neutral"
                  trendLabel="Mar 2026"
                />
                <StatCard
                  label="Avg List Price"
                  value={`$${(MARKET_STATS.avgListPrice / 1000).toFixed(0)}K`}
                  subValue={`Median $${(MARKET_STATS.medianListPrice / 1000).toFixed(0)}K`}
                  trend="up"
                  trendLabel="+2.1% vs 6mo ago"
                />
                <StatCard
                  label="Avg Sale Price"
                  value={`$${(MARKET_STATS.avgSalePrice / 1000).toFixed(0)}K`}
                  subValue={`${(MARKET_STATS.listToSaleRatio * 100).toFixed(1)}% of list`}
                  trend="up"
                  trendLabel="+1.8% vs 6mo ago"
                />
                <StatCard
                  label="Avg $/Sqft"
                  value={`$${MARKET_STATS.avgPricePerSqft}`}
                  trend="up"
                  trendLabel="+3.9% vs 6mo ago"
                />
                <StatCard
                  label="Avg Days on Market"
                  value={`${MARKET_STATS.avgDaysOnMarket}`}
                  subValue={`${MARKET_STATS.monthsOfInventory} mo inventory`}
                  trend="neutral"
                  trendLabel="Balanced market"
                />
              </div>
            </div>

            {/* 2bd/2ba comp stats */}
            <div>
              <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3">2bd / 2ba Comparables · Like Mine</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <StatCard
                  label="My Est. Value"
                  value={fmt(MY_HOME.estimatedValue)}
                  subValue={`$${Math.round(MY_HOME.estimatedValue / MY_HOME.sqft)}/sqft`}
                  highlight
                />
                <StatCard
                  label="Avg Comp Sale"
                  value={fmt(COMP_STATS.avgSalePrice)}
                  subValue={`$${COMP_STATS.avgPricePerSqft}/sqft`}
                  trend="up"
                  trendLabel="Based on 6 comps"
                />
                <StatCard
                  label="Median Comp List"
                  value={fmt(COMP_STATS.medianListPrice)}
                  trend="neutral"
                  trendLabel="Active comps"
                />
                <StatCard
                  label="Avg DOM (Comps)"
                  value={`${COMP_STATS.avgDaysOnMarket} days`}
                  trend="neutral"
                  trendLabel="Time to sell"
                />
              </div>
            </div>

            {/* Chart preview */}
            <PriceTrendChart data={PRICE_TREND} myHomeValue={MY_HOME.estimatedValue} />

            {/* Recent listings preview */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Active Listings</h2>
                <button
                  onClick={() => setTab('listings')}
                  className="text-xs text-emerald-600 font-semibold hover:text-emerald-700"
                >
                  View all →
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {activeListings.slice(0, 3).map((h) => (
                  <ListingCard key={h.id} home={h} myBeds={beds} myBaths={baths} mySqft={sqft} />
                ))}
              </div>
            </div>
          </>
        )}

        {/* ── For Sale Tab ── */}
        {tab === 'listings' && (
          <>
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <h1 className="text-xl font-bold text-slate-900">Homes For Sale</h1>
                <p className="text-sm text-slate-400 mt-0.5">
                  {activeListings.length} active · {pendingListings.length} pending · Trilogy at the Vineyards
                </p>
              </div>
              <div className="flex gap-2 bg-slate-100 rounded-xl p-1">
                {(['all', 'comps'] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => setListingsFilter(f)}
                    className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      listingsFilter === f ? 'bg-white shadow text-slate-900' : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    {f === 'all' ? 'All Listings' : '2bd/2ba Comps'}
                  </button>
                ))}
              </div>
            </div>

            {filteredListings.length === 0 ? (
              <div className="text-center py-16 text-slate-400 text-sm bg-white rounded-2xl border border-slate-100">
                No listings match your filter.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredListings.map((h) => (
                  <ListingCard key={h.id} home={h} myBeds={beds} myBaths={baths} mySqft={sqft} />
                ))}
              </div>
            )}
          </>
        )}

        {/* ── Recent Sales Tab ── */}
        {tab === 'sales' && (
          <>
            <div>
              <h1 className="text-xl font-bold text-slate-900">Recent Sales</h1>
              <p className="text-sm text-slate-400 mt-0.5">Last 6 months · Trilogy at the Vineyards · 94513</p>
            </div>

            {/* Quick comp stats banner */}
            <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 flex flex-wrap gap-6">
              <div>
                <div className="text-xs text-emerald-600 font-semibold uppercase tracking-wider">2bd/2ba Avg Sale</div>
                <div className="text-xl font-bold text-emerald-800">{fmt(COMP_STATS.avgSalePrice)}</div>
              </div>
              <div>
                <div className="text-xs text-emerald-600 font-semibold uppercase tracking-wider">2bd/2ba Avg $/sqft</div>
                <div className="text-xl font-bold text-emerald-800">${COMP_STATS.avgPricePerSqft}</div>
              </div>
              <div>
                <div className="text-xs text-emerald-600 font-semibold uppercase tracking-wider">My Est. Value</div>
                <div className="text-xl font-bold text-emerald-800">{fmt(MY_HOME.estimatedValue)}</div>
              </div>
              <div>
                <div className="text-xs text-emerald-600 font-semibold uppercase tracking-wider">Avg DOM (Comps)</div>
                <div className="text-xl font-bold text-emerald-800">{COMP_STATS.avgDaysOnMarket}d</div>
              </div>
            </div>

            <SalesTable sales={RECENT_SALES} myBeds={beds} myBaths={baths} mySqft={sqft} />
          </>
        )}

        {/* ── Trends Tab ── */}
        {tab === 'trends' && (
          <>
            <div>
              <h1 className="text-xl font-bold text-slate-900">Market Trends</h1>
              <p className="text-sm text-slate-400 mt-0.5">12-month history · Trilogy at the Vineyards</p>
            </div>

            <PriceTrendChart data={PRICE_TREND} myHomeValue={MY_HOME.estimatedValue} />

            {/* YoY summary */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {(() => {
                const first = PRICE_TREND[0];
                const last = PRICE_TREND[PRICE_TREND.length - 1];
                const priceDiff = last.avgPrice - first.avgPrice;
                const pricePct = ((priceDiff / first.avgPrice) * 100).toFixed(1);
                const ppsfDiff = last.avgPricePerSqft - first.avgPricePerSqft;
                const ppsfPct = ((ppsfDiff / first.avgPricePerSqft) * 100).toFixed(1);
                return (
                  <>
                    <StatCard
                      label="Price Change (YoY)"
                      value={`+${pricePct}%`}
                      subValue={`+$${(priceDiff / 1000).toFixed(0)}K avg`}
                      trend="up"
                      trendLabel="Mar 2025 → Feb 2026"
                    />
                    <StatCard
                      label="$/Sqft Change (YoY)"
                      value={`+${ppsfPct}%`}
                      subValue={`+$${ppsfDiff}/sqft`}
                      trend="up"
                      trendLabel="Mar 2025 → Feb 2026"
                    />
                    <StatCard
                      label="Peak Avg Price"
                      value={fmt(Math.max(...PRICE_TREND.map((d) => d.avgPrice)))}
                      subValue="Jul 2025"
                      trend="neutral"
                    />
                    <StatCard
                      label="My Home vs Market"
                      value={`$${Math.round(MY_HOME.estimatedValue / MY_HOME.sqft)}/sqft`}
                      subValue={`Market avg: $${last.avgPricePerSqft}/sqft`}
                      trend={MY_HOME.estimatedValue / MY_HOME.sqft >= last.avgPricePerSqft ? 'up' : 'down'}
                      trendLabel={
                        MY_HOME.estimatedValue / MY_HOME.sqft >= last.avgPricePerSqft
                          ? 'Above market avg'
                          : 'Below market avg'
                      }
                      highlight
                    />
                  </>
                );
              })()}
            </div>

            {/* Monthly table */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100">
                <h2 className="text-base font-bold text-slate-900">Monthly Breakdown</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50">
                      {['Month', 'Avg Price', 'Median Price', '$/Sqft', 'Sales Vol.'].map((h) => (
                        <th key={h} className="px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider text-left whitespace-nowrap">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {[...PRICE_TREND].reverse().map((row, i) => (
                      <tr key={row.month} className={`hover:bg-slate-50 transition-colors ${i === 0 ? 'font-semibold' : ''}`}>
                        <td className="px-4 py-3 text-slate-800">{row.month}</td>
                        <td className="px-4 py-3 text-slate-800">{fmt(row.avgPrice)}</td>
                        <td className="px-4 py-3 text-slate-600">{fmt(row.medianPrice)}</td>
                        <td className="px-4 py-3 text-slate-600">${row.avgPricePerSqft}</td>
                        <td className="px-4 py-3 text-slate-600">{row.salesVolume}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </main>

      <footer className="max-w-6xl mx-auto px-4 sm:px-6 py-8 text-center text-xs text-slate-400 border-t border-slate-100 mt-6">
        Data shown is for Trilogy at the Vineyards, Brentwood CA 94513. Market data is representative and updated monthly.
        For the most accurate valuations, consult a licensed real estate professional.
      </footer>

      <MarketAnalyst />
    </div>
  );
};

export default HomeDashboard;
