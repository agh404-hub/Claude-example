import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import type { AGPDataPoint } from '../types';

interface AGPChartProps {
  data: AGPDataPoint[];
}

const AGPChart: React.FC<AGPChartProps> = ({ data }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    console.log('AGPChart useEffect triggered', {
      hasSvgRef: !!svgRef.current,
      hasContainerRef: !!containerRef.current,
      dataLength: data.length,
      sampleData: data.slice(0, 3)
    });

    if (!svgRef.current || !containerRef.current || data.length === 0) {
      console.log('AGPChart early return - missing refs or empty data');
      return;
    }

    // Clear previous chart
    d3.select(svgRef.current).selectAll('*').remove();

    // Dimensions and margins
    const containerWidth = containerRef.current.offsetWidth;
    console.log('Container width:', containerWidth);
    const margin = { top: 20, right: 30, bottom: 50, left: 60 };
    const width = containerWidth - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    // Create SVG
    const svg = d3
      .select(svgRef.current)
      .attr('width', containerWidth)
      .attr('height', 400);

    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Scales
    const xScale = d3
      .scaleLinear()
      .domain([0, 1439]) // minutes in a day
      .range([0, width]);

    const yScale = d3
      .scaleLinear()
      .domain([40, 400])
      .range([height, 0]);

    // Format time for x-axis
    const formatTime = (minutes: number): string => {
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      const period = hours >= 12 ? 'PM' : 'AM';
      const displayHour = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
      return `${displayHour}:${mins.toString().padStart(2, '0')} ${period}`;
    };

    // X-axis
    const xAxis = d3
      .axisBottom(xScale)
      .tickValues([0, 360, 720, 1080, 1439])
      .tickFormat((d) => formatTime(d as number));

    g.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(xAxis)
      .style('font-size', '12px')
      .selectAll('text')
      .style('text-anchor', 'middle');

    // Y-axis
    const yAxis = d3
      .axisLeft(yScale)
      .tickValues([40, 70, 100, 140, 180, 250, 300, 400])
      .tickFormat((d) => `${d}`);

    g.append('g')
      .call(yAxis)
      .style('font-size', '12px');

    // Grid lines
    g.append('g')
      .attr('class', 'grid')
      .selectAll('line')
      .data(yScale.ticks(8))
      .enter()
      .append('line')
      .attr('x1', 0)
      .attr('x2', width)
      .attr('y1', (d) => yScale(d))
      .attr('y2', (d) => yScale(d))
      .attr('stroke', '#e5e7eb')
      .attr('stroke-width', 1)
      .attr('stroke-dasharray', '2,2');

    // Target range zone (70-180 mg/dL)
    g.append('rect')
      .attr('x', 0)
      .attr('y', yScale(180))
      .attr('width', width)
      .attr('height', yScale(70) - yScale(180))
      .attr('fill', '#10B981')
      .attr('opacity', 0.1);

    // Area generators
    const area10_90 = d3
      .area<AGPDataPoint>()
      .x((d) => xScale(d.timeOfDay))
      .y0((d) => yScale(d.p10))
      .y1((d) => yScale(d.p90))
      .curve(d3.curveMonotoneX);

    const area25_75 = d3
      .area<AGPDataPoint>()
      .x((d) => xScale(d.timeOfDay))
      .y0((d) => yScale(d.p25))
      .y1((d) => yScale(d.p75))
      .curve(d3.curveMonotoneX);

    // Draw 10-90 percentile area (lighter)
    g.append('path')
      .datum(data)
      .attr('fill', '#0D9488')
      .attr('opacity', 0.2)
      .attr('d', area10_90);

    // Draw 25-75 percentile area (darker)
    g.append('path')
      .datum(data)
      .attr('fill', '#0D9488')
      .attr('opacity', 0.4)
      .attr('d', area25_75);

    // Median line
    const medianLine = d3
      .line<AGPDataPoint>()
      .x((d) => xScale(d.timeOfDay))
      .y((d) => yScale(d.median))
      .curve(d3.curveMonotoneX);

    g.append('path')
      .datum(data)
      .attr('fill', 'none')
      .attr('stroke', '#0D9488')
      .attr('stroke-width', 3)
      .attr('d', medianLine);

    // Labels
    g.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', 0 - margin.left)
      .attr('x', 0 - height / 2)
      .attr('dy', '1em')
      .style('text-anchor', 'middle')
      .style('font-size', '14px')
      .style('font-weight', '500')
      .style('fill', '#4b5563')
      .text('Glucose (mg/dL)');

    g.append('text')
      .attr('x', width / 2)
      .attr('y', height + margin.bottom - 5)
      .style('text-anchor', 'middle')
      .style('font-size', '14px')
      .style('font-weight', '500')
      .style('fill', '#4b5563')
      .text('Time of Day');

    // Tooltip
    const tooltip = d3
      .select(containerRef.current)
      .append('div')
      .style('position', 'absolute')
      .style('visibility', 'hidden')
      .style('background-color', 'rgba(0, 0, 0, 0.8)')
      .style('color', 'white')
      .style('padding', '8px 12px')
      .style('border-radius', '6px')
      .style('font-size', '12px')
      .style('pointer-events', 'none')
      .style('z-index', '10');

    // Interactive overlay
    const bisect = d3.bisector((d: AGPDataPoint) => d.timeOfDay).left;

    const overlay = g
      .append('rect')
      .attr('width', width)
      .attr('height', height)
      .attr('fill', 'none')
      .attr('pointer-events', 'all');

    const focus = g.append('g').style('display', 'none');

    focus
      .append('line')
      .attr('class', 'x-hover-line')
      .attr('y1', 0)
      .attr('y2', height)
      .attr('stroke', '#6b7280')
      .attr('stroke-width', 1)
      .attr('stroke-dasharray', '3,3');

    overlay
      .on('mouseover', () => {
        focus.style('display', null);
        tooltip.style('visibility', 'visible');
      })
      .on('mouseout', () => {
        focus.style('display', 'none');
        tooltip.style('visibility', 'hidden');
      })
      .on('mousemove', function (event) {
        const [xPos] = d3.pointer(event);
        const x0 = xScale.invert(xPos);
        const i = bisect(data, x0, 1);
        const d0 = data[i - 1];
        const d1 = data[i];

        if (!d0 || !d1) return;

        const d = x0 - d0.timeOfDay > d1.timeOfDay - x0 ? d1 : d0;

        focus.select('.x-hover-line').attr('x1', xScale(d.timeOfDay)).attr('x2', xScale(d.timeOfDay));

        tooltip
          .html(
            `
            <div style="font-weight: 600; margin-bottom: 4px;">${formatTime(d.timeOfDay)}</div>
            <div style="display: flex; justify-content: space-between; gap: 12px;">
              <span>Median:</span>
              <span style="font-weight: 600;">${Math.round(d.median)} mg/dL</span>
            </div>
            <div style="display: flex; justify-content: space-between; gap: 12px;">
              <span>25-75%:</span>
              <span style="font-weight: 600;">${Math.round(d.p25)}-${Math.round(d.p75)} mg/dL</span>
            </div>
            <div style="display: flex; justify-content: space-between; gap: 12px;">
              <span>10-90%:</span>
              <span style="font-weight: 600;">${Math.round(d.p10)}-${Math.round(d.p90)} mg/dL</span>
            </div>
          `
          )
          .style('left', `${event.pageX - containerRef.current!.offsetLeft + 10}px`)
          .style('top', `${event.pageY - containerRef.current!.offsetTop - 50}px`);
      });

    // Cleanup tooltip on unmount
    return () => {
      tooltip.remove();
    };
  }, [data]);

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Ambulatory Glucose Profile (AGP)</h3>
        <p className="text-sm text-gray-600 mt-1">Last 7 days - Glucose patterns by time of day</p>
      </div>

      <div className="mb-4 flex items-center gap-6 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-8 h-0.5 bg-teal"></div>
          <span className="text-gray-600">Median</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-8 h-3 bg-teal opacity-40"></div>
          <span className="text-gray-600">25th-75th Percentile</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-8 h-3 bg-teal opacity-20"></div>
          <span className="text-gray-600">10th-90th Percentile</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-8 h-3 bg-safe opacity-20 border border-safe"></div>
          <span className="text-gray-600">Target Range (70-180)</span>
        </div>
      </div>

      <div ref={containerRef} className="relative w-full min-h-[400px]">
        <svg ref={svgRef}></svg>
      </div>
    </div>
  );
};

export default AGPChart;
