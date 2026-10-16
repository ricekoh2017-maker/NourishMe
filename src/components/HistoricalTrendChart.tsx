import React, { useState } from 'react';
import { HourlyHistoryPoint, RegionId } from '../types/airQuality';
import { REGIONS_METADATA } from '../data/singaporeAirConstants';
import { TrendingUp, Clock, Calendar } from 'lucide-react';

interface HistoricalTrendChartProps {
  history: HourlyHistoryPoint[];
  selectedRegion: RegionId;
}

export const HistoricalTrendChart: React.FC<HistoricalTrendChartProps> = ({
  history,
  selectedRegion
}) => {
  const [metricView, setMetricView] = useState<'psi' | 'pm25'>('psi');
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  if (!history || history.length === 0) return null;

  // Chart coordinate space
  const chartWidth = 760;
  const chartHeight = 220;
  const paddingLeft = 45;
  const paddingRight = 25;
  const paddingTop = 25;
  const paddingBottom = 35;

  const innerWidth = chartWidth - paddingLeft - paddingRight;
  const innerHeight = chartHeight - paddingTop - paddingBottom;

  // Extract series values
  const seriesValues = history.map(pt => {
    if (selectedRegion === 'national') {
      return metricView === 'psi' ? pt.nationalPsi : pt.nationalPm25;
    }
    const regPt = pt.regions[selectedRegion];
    return metricView === 'psi' ? regPt.psi : regPt.pm25;
  });

  const maxValue = Math.max(
    metricView === 'psi' ? 150 : 80,
    Math.ceil(Math.max(...seriesValues) * 1.25)
  );

  const getX = (idx: number) => paddingLeft + (idx / (history.length - 1)) * innerWidth;
  const getY = (val: number) => paddingTop + innerHeight - (val / maxValue) * innerHeight;

  // Generate SVG path string
  const points = seriesValues.map((val, idx) => `${getX(idx)},${getY(val)}`);
  const pathD = `M ${points.join(' L ')}`;
  const areaD = `M ${points.join(' L ')} L ${getX(history.length - 1)},${paddingTop + innerHeight} L ${paddingLeft},${paddingTop + innerHeight} Z`;

  // Thresholds to render
  const thresholds = metricView === 'psi'
    ? [
        { val: 50, label: '50 Good', color: '#10B981' },
        { val: 100, label: '100 Unhealthy', color: '#F59E0B' },
        { val: 200, label: '200 V.Unhealthy', color: '#EF4444' }
      ]
    : [
        { val: 55, label: '55 Normal', color: '#10B981' },
        { val: 150, label: '150 High', color: '#F59E0B' }
      ];

  const hoveredPoint = hoverIndex !== null ? history[hoverIndex] : null;
  const hoveredVal = hoverIndex !== null ? seriesValues[hoverIndex] : null;

  return (
    <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-5 shadow-sm space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-white">
              24-Hour Historical Hourly Trend
            </h3>
            <span className="text-xs text-slate-500">·</span>
            <span className="text-xs text-slate-400">
              {REGIONS_METADATA[selectedRegion].name}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Air quality trajectory over the past 24 hours with NEA critical threshold boundaries
          </p>
        </div>

        {/* Metric Switcher */}
        <div className="flex items-center bg-slate-950 p-1 rounded-lg border border-slate-800 self-start sm:self-auto">
          <button
            onClick={() => setMetricView('psi')}
            className={`px-3 py-1 text-xs font-semibold rounded-md transition-all whitespace-nowrap ${
              metricView === 'psi'
                ? 'bg-slate-800 text-cyan-400 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            24-hr PSI Trajectory
          </button>
          <button
            onClick={() => setMetricView('pm25')}
            className={`px-3 py-1 text-xs font-semibold rounded-md transition-all whitespace-nowrap ${
              metricView === 'pm25'
                ? 'bg-slate-800 text-cyan-400 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            1-hr PM2.5 Trajectory
          </button>
        </div>
      </div>

      {/* SVG Chart Container */}
      <div className="relative w-full overflow-x-auto">
        <svg
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          className="w-full h-56 select-none"
        >
          <defs>
            <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#06B6D4" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#06B6D4" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Background Grid Lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((pct, idx) => {
            const y = paddingTop + innerHeight * (1 - pct);
            const val = Math.round(maxValue * pct);
            return (
              <g key={`grid-${idx}`}>
                <line
                  x1={paddingLeft}
                  y1={y}
                  x2={chartWidth - paddingRight}
                  y2={y}
                  stroke="#1E293B"
                  strokeWidth="1"
                  strokeDasharray="4 4"
                />
                <text
                  x={paddingLeft - 8}
                  y={y + 4}
                  fill="#64748B"
                  fontSize="10"
                  textAnchor="end"
                  className="font-mono tabular-nums"
                >
                  {val}
                </text>
              </g>
            );
          })}

          {/* Threshold Lines */}
          {thresholds.map((th, idx) => {
            if (th.val > maxValue) return null;
            const y = getY(th.val);
            return (
              <g key={`th-${idx}`}>
                <line
                  x1={paddingLeft}
                  y1={y}
                  x2={chartWidth - paddingRight}
                  y2={y}
                  stroke={th.color}
                  strokeWidth="1.2"
                  strokeDasharray="2 2"
                  opacity="0.8"
                />
                <text
                  x={chartWidth - paddingRight - 4}
                  y={y - 4}
                  fill={th.color}
                  fontSize="9"
                  fontWeight="600"
                  textAnchor="end"
                  className="font-mono"
                >
                  {th.label}
                </text>
              </g>
            );
          })}

          {/* Area fill */}
          <path d={areaD} fill="url(#areaGradient)" />

          {/* Main trend line */}
          <path
            d={pathD}
            fill="none"
            stroke="#22D3EE"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Interactive hover points & hit areas */}
          {seriesValues.map((val, idx) => {
            const cx = getX(idx);
            const cy = getY(val);
            const isHovered = hoverIndex === idx;

            return (
              <g
                key={`point-${idx}`}
                onMouseEnter={() => setHoverIndex(idx)}
                onMouseLeave={() => setHoverIndex(null)}
                className="cursor-pointer"
              >
                {/* Invisible larger hit target */}
                <circle cx={cx} cy={cy} r="10" fill="transparent" />

                {/* Point circle */}
                <circle
                  cx={cx}
                  cy={cy}
                  r={isHovered ? 5.5 : 2.5}
                  fill={isHovered ? '#FFFFFF' : '#0891B2'}
                  stroke="#22D3EE"
                  strokeWidth={isHovered ? 2.5 : 1}
                  className="transition-all duration-150"
                />
              </g>
            );
          })}

          {/* Time axis labels */}
          {history.map((pt, idx) => {
            // Label every 3 hours for clean density
            if (idx % 3 !== 0 && idx !== history.length - 1) return null;
            const x = getX(idx);
            return (
              <text
                key={`label-${idx}`}
                x={x}
                y={chartHeight - 10}
                fill="#64748B"
                fontSize="10"
                textAnchor="middle"
                className="font-mono tabular-nums"
              >
                {pt.time}
              </text>
            );
          })}

          {/* Active tooltip on hover */}
          {hoverIndex !== null && hoveredPoint && hoveredVal !== null && (
            <g transform={`translate(${Math.min(getX(hoverIndex), chartWidth - 110)}, ${Math.max(getY(hoveredVal) - 40, 20)})`}>
              <rect
                x="-45"
                y="-18"
                width="90"
                height="32"
                rx="6"
                fill="#0F172A"
                stroke="#38BDF8"
                strokeWidth="1.2"
                className="drop-shadow-lg"
              />
              <text
                x="0"
                y="-3"
                textAnchor="middle"
                fill="#94A3B8"
                fontSize="9"
                className="font-mono"
              >
                {hoveredPoint.time} SGT
              </text>
              <text
                x="0"
                y="9"
                textAnchor="middle"
                fill="#FFFFFF"
                fontSize="12"
                fontWeight="800"
                className="font-mono"
              >
                {hoveredVal} {metricView === 'psi' ? 'PSI' : 'µg/m³'}
              </text>
            </g>
          )}
        </svg>
      </div>
    </div>
  );
};
