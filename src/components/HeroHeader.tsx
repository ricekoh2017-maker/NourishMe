import React from 'react';
import { RegionAirQualityData, HotspotSurveillance } from '../types/airQuality';
import { Wind, Flame, ShieldAlert, CheckCircle2, ChevronRight } from 'lucide-react';

interface HeroHeaderProps {
  nationalData: RegionAirQualityData;
  hotspots: HotspotSurveillance;
  onOpenMap: () => void;
  onConfigureAlerts: () => void;
}

export const HeroHeader: React.FC<HeroHeaderProps> = ({
  nationalData,
  hotspots,
  onOpenMap,
  onConfigureAlerts
}) => {
  const isHealthy = nationalData.readings.psi24h <= 100;

  return (
    <div className="relative rounded-3xl overflow-hidden border border-slate-800 bg-slate-900 shadow-xl">
      {/* Background image with contrast scrim */}
      <div className="absolute inset-0 z-0">
        <img
          src="/src/assets/images/singapore_skyline_haze_1792120392068.jpg"
          alt="Singapore Marina Bay Skyline"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-center filter brightness-[0.4] saturate-[0.85]"
          onError={e => {
            // CSS fallback if image fails
            (e.target as HTMLElement).style.display = 'none';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/75 to-slate-950/30" />
      </div>

      {/* Hero Content */}
      <div className="relative z-10 px-6 py-8 sm:px-8 sm:py-10 max-w-4xl space-y-4">
        {/* Unboxed Metadata line with separators */}
        <div className="flex items-center gap-2 text-xs text-slate-300 font-medium">
          <span className="text-cyan-400 font-semibold">Republic of Singapore</span>
          <span aria-hidden="true" className="text-slate-600">·</span>
          <span>National Environment Agency (NEA) Data Feed</span>
          <span aria-hidden="true" className="text-slate-600">·</span>
          <span>Meteorological Service Singapore (MSS)</span>
        </div>

        {/* Display Headline with balanced text wrap */}
        <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight [text-wrap:balance]">
          Live Singapore PSI & Haze Early Warning System
        </h1>

        <p className="text-sm sm:text-base text-slate-300 max-w-2xl leading-relaxed">
          Monitor official 24-hr PSI and real-time 1-hr PM2.5 levels across all 5 sectors.
          Set automated push notifications and audio alerts when air quality crosses into unhealthy thresholds.
        </p>

        {/* Action CTAs */}
        <div className="pt-2 flex items-center gap-3 flex-wrap">
          <button
            onClick={onOpenMap}
            className="px-4 py-2.5 bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold text-xs rounded-xl transition-all shadow-md shadow-cyan-950 flex items-center gap-2"
          >
            <span>Explore Interactive Vector Map</span>
            <ChevronRight className="w-4 h-4" />
          </button>

          <button
            onClick={onConfigureAlerts}
            className="px-4 py-2.5 bg-slate-900/80 hover:bg-slate-800 text-slate-200 border border-slate-700/80 font-semibold text-xs rounded-xl transition-all flex items-center gap-2"
          >
            <ShieldAlert className="w-4 h-4 text-cyan-400" />
            <span>Set Push Thresholds</span>
          </button>
        </div>
      </div>
    </div>
  );
};
