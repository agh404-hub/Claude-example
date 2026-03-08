import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import type { PriceTrendPoint } from '../../types/homes';

interface Props {
  data: PriceTrendPoint[];
  myHomeValue: number;
}

type View = 'avgPrice' | 'avgPricePerSqft' | 'salesVolume';

const VIEW_CONFIG: Record<View, { label: string; color: string; fmt: (n: number) => string }> = {
  avgPrice: {
    label: 'Avg Sale Price',
    color: '#10b981',
    fmt: (n) => `$${(n / 1000).toFixed(0)}K`,
  },
  avgPricePerSqft: {
    label: 'Avg $/Sqft',
    color: '#6366f1',
    fmt: (n) => `$${n}`,
  },
  salesVolume: {
    label: 'Sales Volume',
    color: '#f59e0b',
    fmt: (n) => `${n}`,
  },
};

const PriceTrendChart: React.FC<Props> = ({ data, myHomeValue }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [view, setView] = useState<View>('avgPrice');
  const [tooltip, setTooltip] = useState<{ x: number; y: number; point: PriceTrendPoint } | null>(null);

  useEffect(() => {
    if (!svgRef.current || !wrapperRef.current || data.length === 0) return;

    const wrapper = wrapperRef.current;
    const { width } = wrapper.getBoundingClientRect();
    const height = 220;
    const margin = { top: 20, right: 20, bottom: 40, left: 56 };
    const innerW = width - margin.left - margin.right;
    const innerH = height - margin.top - margin.bottom;

    const cfg = VIEW_CONFIG[view];
    const values = data.map((d) => d[view] as number);
    const minVal = Math.min(...values) * 0.97;
    const maxVal = Math.max(...values) * 1.03;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();
    svg.attr('width', width).attr('height', height);

    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

    const xScale = d3
      .scalePoint()
      .domain(data.map((d) => d.month))
      .range([0, innerW])
      .padding(0.2);

    const yScale = d3.scaleLinear().domain([minVal, maxVal]).range([innerH, 0]);

    // Grid lines
    g.append('g')
      .selectAll('line')
      .data(yScale.ticks(4))
      .join('line')
      .attr('x1', 0)
      .attr('x2', innerW)
      .attr('y1', (d) => yScale(d))
      .attr('y2', (d) => yScale(d))
      .attr('stroke', '#f1f5f9')
      .attr('stroke-width', 1);

    // My home value reference line (only for price view)
    if (view === 'avgPrice') {
      const refY = yScale(myHomeValue);
      if (refY >= 0 && refY <= innerH) {
        g.append('line')
          .attr('x1', 0).attr('x2', innerW)
          .attr('y1', refY).attr('y2', refY)
          .attr('stroke', '#10b981')
          .attr('stroke-width', 1.5)
          .attr('stroke-dasharray', '4,3')
          .attr('opacity', 0.6);
        g.append('text')
          .attr('x', innerW - 2)
          .attr('y', refY - 5)
          .attr('text-anchor', 'end')
          .attr('font-size', '10px')
          .attr('fill', '#059669')
          .attr('font-weight', '600')
          .text('My Est. Value');
      }
    }

    // Area gradient
    const gradientId = `area-gradient-${view}`;
    const defs = svg.append('defs');
    const gradient = defs.append('linearGradient')
      .attr('id', gradientId)
      .attr('x1', '0%').attr('y1', '0%')
      .attr('x2', '0%').attr('y2', '100%');
    gradient.append('stop').attr('offset', '0%').attr('stop-color', cfg.color).attr('stop-opacity', 0.18);
    gradient.append('stop').attr('offset', '100%').attr('stop-color', cfg.color).attr('stop-opacity', 0);

    const area = d3.area<PriceTrendPoint>()
      .x((d) => xScale(d.month)!)
      .y0(innerH)
      .y1((d) => yScale(d[view] as number))
      .curve(d3.curveCatmullRom.alpha(0.5));

    g.append('path')
      .datum(data)
      .attr('fill', `url(#${gradientId})`)
      .attr('d', area);

    // Line
    const line = d3.line<PriceTrendPoint>()
      .x((d) => xScale(d.month)!)
      .y((d) => yScale(d[view] as number))
      .curve(d3.curveCatmullRom.alpha(0.5));

    g.append('path')
      .datum(data)
      .attr('fill', 'none')
      .attr('stroke', cfg.color)
      .attr('stroke-width', 2.5)
      .attr('d', line);

    // X axis
    g.append('g')
      .attr('transform', `translate(0,${innerH})`)
      .call(
        d3.axisBottom(xScale)
          .tickSize(0)
          .tickFormat((d, i) => (i % 2 === 0 ? d : ''))
      )
      .call((axis) => {
        axis.select('.domain').remove();
        axis.selectAll('text')
          .attr('dy', '1.2em')
          .attr('font-size', '10px')
          .attr('fill', '#94a3b8');
      });

    // Y axis
    g.append('g')
      .call(
        d3.axisLeft(yScale)
          .ticks(4)
          .tickSize(0)
          .tickFormat((d) => cfg.fmt(d as number))
      )
      .call((axis) => {
        axis.select('.domain').remove();
        axis.selectAll('text')
          .attr('dx', '-0.5em')
          .attr('font-size', '10px')
          .attr('fill', '#94a3b8');
      });

    // Interactive dots + hover overlay
    const dots = g.selectAll('circle.dot')
      .data(data)
      .join('circle')
      .attr('class', 'dot')
      .attr('cx', (d) => xScale(d.month)!)
      .attr('cy', (d) => yScale(d[view] as number))
      .attr('r', 4)
      .attr('fill', 'white')
      .attr('stroke', cfg.color)
      .attr('stroke-width', 2)
      .style('cursor', 'pointer');

    dots.on('mouseover', function (event, d) {
      d3.select(this).attr('r', 6).attr('fill', cfg.color);
      const wrapRect = wrapperRef.current!.getBoundingClientRect();
      setTooltip({
        x: event.clientX - wrapRect.left,
        y: event.clientY - wrapRect.top,
        point: d,
      });
    });

    dots.on('mouseout', function () {
      d3.select(this).attr('r', 4).attr('fill', 'white');
      setTooltip(null);
    });

  }, [data, view, myHomeValue]);

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
      <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
        <div>
          <h2 className="text-base font-bold text-slate-900">Price Trends</h2>
          <p className="text-xs text-slate-400 mt-0.5">Trilogy at the Vineyards · 12-month history</p>
        </div>
        <div className="flex gap-1 bg-slate-100 rounded-xl p-1">
          {(Object.entries(VIEW_CONFIG) as [View, typeof VIEW_CONFIG[View]][]).map(([key, val]) => (
            <button
              key={key}
              onClick={() => setView(key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                view === key
                  ? 'bg-white shadow text-slate-900'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {val.label}
            </button>
          ))}
        </div>
      </div>

      <div ref={wrapperRef} className="relative w-full">
        <svg ref={svgRef} className="w-full" />
        {tooltip && (
          <div
            className="absolute z-10 bg-slate-900 text-white text-xs rounded-xl px-3 py-2 shadow-xl pointer-events-none"
            style={{ left: tooltip.x + 12, top: tooltip.y - 48 }}
          >
            <div className="font-bold mb-1">{tooltip.point.month}</div>
            <div className="text-slate-300">
              Avg Price: <span className="text-white font-semibold">${(tooltip.point.avgPrice / 1000).toFixed(0)}K</span>
            </div>
            <div className="text-slate-300">
              $/Sqft: <span className="text-white font-semibold">${tooltip.point.avgPricePerSqft}</span>
            </div>
            <div className="text-slate-300">
              Sales: <span className="text-white font-semibold">{tooltip.point.salesVolume}</span>
            </div>
          </div>
        )}
        {view === 'avgPrice' && (
          <div className="mt-2 flex items-center gap-2 text-xs text-slate-400">
            <div className="w-6 border-t border-dashed border-emerald-400" />
            <span>My estimated home value</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default PriceTrendChart;
