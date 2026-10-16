import React from 'react';
import {
  RegionId,
  RegionAirQualityData,
  HotspotSurveillance
} from '../types/airQuality';
import { REGIONS_METADATA } from '../data/singaporeAirConstants';
import {
  Activity,
  Wind,
  Flame,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  MapPin,
  TrendingUp
} from 'lucide-react';

interface MetricCardsProps {
  regions: Record<RegionId, RegionAirQualityData>;
  selectedRegion: RegionId;
  onSelectRegion: (reg: RegionId) => void;
  hotspots: HotspotSurveillance;
  activeMetric: 'psi' | 'pm25';
}

export const MetricCards: React.FC<MetricCardsProps> = ({
  regions,
  selectedRegion,
  onSelectRegion,
  hotspots,
  activeMetric
}) => {
  const current = regions[selectedRegion] || regions.national;
  const national = regions.national;

  // Find region with maximum PSI
  const maxRegion = Object.entries(regions).reduce<{ id: RegionId; psi: number }>(
    (acc, [id, data]) => {
      if (id !== 'national' && data.readings.psi24h > acc.psi) {
        return { id: id as RegionId, psi: data.readings.psi24h };
      }
      return acc;
    },
    { id: 'west', psi: 0 }
  );

  const regionKeys: RegionId[] = ['national', 'north', 'south', 'east', 'west', 'central'];

  return (
    <div className="space-y-4">
      {/* Region Segmented Selector */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-1.5 p-1 bg-slate-900 rounded-xl border border-slate-800 overflow-x-auto max-w-full">
          {regionKeys.map(regKey => {
            const isSelected = selectedRegion === regKey;
            const regData = regions[regKey];
            const badgeValue = regData?.readings.psi24h ?? 0;
            const bandColor = regData?.band.color ?? '#10B981';

            return (
              <button
                key={regKey}
                onClick={() => onSelectRegion(regKey)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-2 whitespace-nowrap ${
                  isSelected
                    ? 'bg-slate-800 text-white shadow-sm ring-1 ring-slate-700'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'
                }`}
              >
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: bandColor }}
                />
                <span className="capitalize">{regKey === 'national' ? 'Islandwide' : regKey}</span>
                <span className="font-mono tabular-nums text-[11px] text-slate-300">
                  {badgeValue}
                </span>
              </button>
            );
          })}
        </div>

        <div className="text-xs text-slate-400 flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-slate-500" />
          <span>{REGIONS_METADATA[selectedRegion].fullDisplayName}</span>
        </div>
      </div>

      {/* 4 Primary Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: 24-hr PSI */}
        <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-5 shadow-sm relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                24-Hour PSI Index
              </p>
              <h2 className="text-3xl font-bold font-mono tabular-nums text-white mt-1">
                {current.readings.psi24h}
              </h2>
            </div>
            <div
              className="px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider border"
              style={{
                color: current.band.color,
                backgroundColor: current.band.bgColor,
                borderColor: current.band.borderColor
              }}
            >
              {current.band.label}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <span className="truncate">Range: {current.band.min}–{current.band.max}</span>
            <span className="flex items-center gap-1 text-slate-300">
              {current.trend === 'deteriorating' ? (
                <>
                  <ArrowUpRight className="w-3.5 h-3.5 text-amber-400" />
                  <span className="text-amber-400">Rising</span>
                </>
              ) : current.trend === 'improving' ? (
                <>
                  <ArrowDownRight className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Falling</span>
                </>
              ) : (
                <>
                  <Minus className="w-3.5 h-3.5 text-slate-400" />
                  <span>Steady</span>
                </>
              )}
            </span>
          </div>
        </div>

        {/* Card 2: 1-hr PM2.5 */}
        <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-5 shadow-sm flex flex-col justify-between">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                1-Hour PM2.5 (Fine Particulates)
              </p>
              <h2 className="text-3xl font-bold font-mono tabular-nums text-white mt-1">
                {current.readings.pm25_1h}
                <span className="text-sm font-normal text-slate-400 ml-1.5 font-sans">
                  µg/m³
                </span>
              </h2>
            </div>
            <div
              className={`px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider border ${
                current.readings.pm25_1h <= 55
                  ? 'text-emerald-400 bg-emerald-950/60 border-emerald-700/60'
                  : current.readings.pm25_1h <= 150
                  ? 'text-amber-400 bg-amber-950/60 border-amber-700/60'
                  : 'text-red-400 bg-red-950/60 border-red-700/60'
              }`}
            >
              {current.readings.pm25_1h <= 55
                ? 'Band I Normal'
                : current.readings.pm25_1h <= 150
                ? 'Band II Elevated'
                : 'Band III High'}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <span>24h Avg: {current.readings.pm25_24h} µg/m³</span>
            <span className="text-cyan-400 font-medium">Real-time Activity Metric</span>
          </div>
        </div>

        {/* Card 3: Highest Sector Alert */}
        <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-5 shadow-sm flex flex-col justify-between">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Regional Peak Sector
              </p>
              <h2 className="text-2xl font-bold text-white mt-1 capitalize">
                {maxRegion.id} Region
              </h2>
            </div>
            <div className="p-2 rounded-lg bg-slate-800 text-amber-400 border border-slate-700">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
            <span className="text-slate-400">PSI Reading:</span>
            <span className="font-mono font-bold text-white text-sm">
              {maxRegion.psi} PSI
            </span>
          </div>
        </div>

        {/* Card 4: Regional Haze & Wind Surveillance */}
        <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-5 shadow-sm flex flex-col justify-between">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Haze & Hotspot Telemetry
              </p>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-bold font-mono text-white">
                  {hotspots.sumatraHotspots}
                </span>
                <span className="text-xs text-slate-400">Sumatra hotspots</span>
              </div>
            </div>
            <div
              className={`px-2 py-1 rounded-md text-xs font-bold uppercase tracking-wider border ${
                hotspots.regionalRiskLevel === 'Severe'
                  ? 'text-red-400 bg-red-950/60 border-red-700/60'
                  : hotspots.regionalRiskLevel === 'Elevated'
                  ? 'text-amber-400 bg-amber-950/60 border-amber-700/60'
                  : 'text-emerald-400 bg-emerald-950/60 border-emerald-700/60'
              }`}
            >
              {hotspots.regionalRiskLevel} Risk
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <span className="truncate">Wind: {hotspots.windDirection.split(' ')[0]}</span>
            <span className="font-mono text-slate-300">{hotspots.windSpeedKmH} km/h</span>
          </div>
        </div>
      </div>
    </div>
  );
};
