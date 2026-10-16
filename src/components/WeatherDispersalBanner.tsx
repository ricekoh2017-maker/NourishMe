import React, { useState } from 'react';
import { DatamallWeatherSummary } from '../types/airQuality';
import { CloudRain, Sun, CloudDrizzle, ChevronDown, ChevronUp, Wind } from 'lucide-react';

interface WeatherDispersalBannerProps {
  summary?: DatamallWeatherSummary;
}

export const WeatherDispersalBanner: React.FC<WeatherDispersalBannerProps> = ({ summary }) => {
  const [expanded, setExpanded] = useState<boolean>(false);

  if (!summary || !summary.forecasts || summary.forecasts.length === 0) return null;

  const topTowns = [
    'Ang Mo Kio', 'Bedok', 'Bishan', 'Bukit Batok', 'Changi',
    'City', 'Clementi', 'Jurong East', 'Pasir Ris', 'Sentosa',
    'Tampines', 'Woodlands', 'Yishun'
  ];

  const highlightedForecasts = summary.forecasts.filter(f => topTowns.includes(f.area));
  const displayForecasts = expanded ? summary.forecasts : (highlightedForecasts.length > 0 ? highlightedForecasts : summary.forecasts.slice(0, 12));

  return (
    <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-5 shadow-sm space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className={`p-2.5 rounded-xl shrink-0 ${
            summary.rainWashoutExpected
              ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-700/60'
              : 'bg-slate-800 text-slate-300 border border-slate-700/60'
          }`}>
            {summary.rainWashoutExpected ? (
              <CloudRain className="w-5 h-5 text-cyan-400" />
            ) : (
              <Sun className="w-5 h-5 text-amber-400" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm font-bold text-white">
                NEA 2-Hour Weather & Haze Washout Forecast
              </h3>
              <span className="text-xs text-slate-500">·</span>
              <span className="text-xs text-cyan-400 font-medium">
                {summary.validPeriodText}
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              {summary.rainWashoutSummary}
            </p>
          </div>
        </div>

        <button
          onClick={() => setExpanded(!expanded)}
          className="text-xs text-slate-400 hover:text-white flex items-center gap-1 self-start sm:self-center shrink-0 hover:underline"
        >
          <span>{expanded ? 'Show Less' : `View All ${summary.forecasts.length} Sectors`}</span>
          {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Grid of Areas */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 pt-1 border-t border-slate-800/80">
        {displayForecasts.map((f, idx) => {
          const isRain = /rain|shower|thunder/i.test(f.forecast);
          return (
            <div
              key={idx}
              className={`p-2 rounded-lg border text-xs flex flex-col justify-between ${
                isRain
                  ? 'bg-cyan-950/40 border-cyan-800/60 text-cyan-200'
                  : 'bg-slate-950/60 border-slate-800/80 text-slate-300'
              }`}
            >
              <span className="font-semibold truncate text-[11px] text-slate-200">
                {f.area}
              </span>
              <div className="flex items-center gap-1.5 mt-1 text-[11px]">
                {isRain ? (
                  <CloudDrizzle className="w-3 h-3 text-cyan-400 shrink-0" />
                ) : (
                  <Sun className="w-3 h-3 text-amber-400/80 shrink-0" />
                )}
                <span className="truncate">{f.forecast}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
