import React from 'react';
import { RegionAirQualityData, RegionId } from '../types/airQuality';
import { AlertTriangle, AlertOctagon, ShieldAlert, ArrowRight, X } from 'lucide-react';

interface ActiveAlertBannerProps {
  regions: Record<RegionId, RegionAirQualityData>;
  threshold: number;
  onOpenAdvisory: () => void;
  onDismiss: () => void;
}

export const ActiveAlertBanner: React.FC<ActiveAlertBannerProps> = ({
  regions,
  threshold,
  onOpenAdvisory,
  onDismiss
}) => {
  // Find all regions breaching threshold
  const breachingRegions = (['north', 'south', 'east', 'west', 'central'] as RegionId[])
    .map(r => regions[r])
    .filter(r => r && (r.readings.psi24h >= threshold || r.readings.pm25_1h > 55));

  if (breachingRegions.length === 0) return null;

  const maxPsi = Math.max(...breachingRegions.map(r => r.readings.psi24h));
  const isSevere = maxPsi > 200;

  return (
    <div
      className={`rounded-2xl border p-4 shadow-lg transition-all animate-fade-in ${
        isSevere
          ? 'bg-rose-950/70 border-rose-700/80 text-rose-200'
          : 'bg-amber-950/70 border-amber-600/80 text-amber-200'
      }`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          <div
            className={`p-2 rounded-xl shrink-0 mt-0.5 ${
              isSevere ? 'bg-rose-900/80 text-rose-200' : 'bg-amber-900/80 text-amber-200'
            }`}
          >
            {isSevere ? (
              <AlertOctagon className="w-5 h-5 animate-pulse" />
            ) : (
              <AlertTriangle className="w-5 h-5" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-black/40 border border-white/10">
                {isSevere ? 'Severe Air Quality Alert' : 'Air Quality Warning'}
              </span>
              <span className="text-xs font-semibold text-white">
                {breachingRegions.length} Sectors Breaching Healthy Thresholds (Max PSI: {maxPsi})
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              Air quality in <strong className="text-white">{breachingRegions.map(r => r.name).join(', ')}</strong> has entered the {isSevere ? 'Very Unhealthy' : 'Unhealthy'} range. Reduce strenuous outdoor exertion; vulnerable groups and children should remain indoors.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
          <button
            onClick={onOpenAdvisory}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors whitespace-nowrap ${
              isSevere
                ? 'bg-rose-500 hover:bg-rose-400 text-slate-950'
                : 'bg-amber-500 hover:bg-amber-400 text-slate-950'
            }`}
          >
            <span>Health Advisory</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onDismiss}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-black/20 transition-colors"
            title="Dismiss Banner"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
