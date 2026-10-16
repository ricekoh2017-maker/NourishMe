import React, { useState } from 'react';
import { RegionAirQualityData, RegionId } from '../types/airQuality';
import { ACTIVITY_LOCATIONS } from '../data/singaporeAirConstants';
import {
  Compass,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Clock,
  Sparkles,
  MapPin,
  Footprints,
  Bike,
  Waves
} from 'lucide-react';

interface OutdoorActivityPlannerProps {
  regions: Record<RegionId, RegionAirQualityData>;
  onSelectRegion: (reg: RegionId) => void;
}

export const OutdoorActivityPlanner: React.FC<OutdoorActivityPlannerProps> = ({
  regions,
  onSelectRegion
}) => {
  const [selectedTag, setSelectedTag] = useState<string>('all');

  const tags = ['all', 'Running', 'Cycling', 'Hiking', 'Swimming', 'Family Walks'];

  const getVenueStatus = (regionId: RegionId) => {
    const regData = regions[regionId] || regions.national;
    const psi = regData.readings.psi24h;
    const pm25 = regData.readings.pm25_1h;

    if (psi > 200 || pm25 > 150) {
      return {
        badge: 'Avoid Outdoor Sports',
        color: '#EF4444',
        border: 'border-red-700/60',
        bg: 'bg-red-950/60',
        text: 'text-red-300',
        advice: 'Air quality is Unhealthy. Move high-intensity endurance training indoors to air-conditioned gyms.'
      };
    } else if (psi > 100 || pm25 > 55) {
      return {
        badge: 'Caution / Moderate Exertion',
        color: '#F59E0B',
        border: 'border-amber-700/60',
        bg: 'bg-amber-950/60',
        text: 'text-amber-300',
        advice: 'Elevated particulate levels. Reduce prolonged tempo runs or HIIT; stay well hydrated.'
      };
    } else {
      return {
        badge: 'Optimal Air Quality',
        color: '#10B981',
        border: 'border-emerald-700/60',
        bg: 'bg-emerald-950/60',
        text: 'text-emerald-300',
        advice: 'Clean air conditions. Safe for long-distance running, road cycling, open-water swimming, and family recreation.'
      };
    }
  };

  const filteredLocations = ACTIVITY_LOCATIONS.filter(loc => {
    if (selectedTag === 'all') return true;
    return loc.tags.some(t => t.toLowerCase().includes(selectedTag.toLowerCase()));
  });

  return (
    <div className="space-y-6">
      {/* Header & Tag Filter */}
      <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-white">
              Singapore Outdoor Exercise & Recreation Advisor
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Real-time suitability based on regional 1-hr PM2.5 and 24-hr PSI levels
            </p>
          </div>

          {/* Activity Filter Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {tags.map(tag => (
              <button
                key={tag}
                onClick={() => setSelectedTag(tag)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg capitalize transition-all whitespace-nowrap ${
                  selectedTag === tag
                    ? 'bg-cyan-500 text-slate-950 shadow-sm'
                    : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Venues Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredLocations.map(venue => {
          const regData = regions[venue.region];
          const status = getVenueStatus(venue.region);

          return (
            <div
              key={venue.id}
              onClick={() => onSelectRegion(venue.region)}
              className="bg-slate-900/90 rounded-2xl border border-slate-800 p-5 shadow-sm hover:border-slate-700 transition-all cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400">
                      {venue.zone} · {venue.region.toUpperCase()}
                    </span>
                    <h4 className="text-base font-bold text-white mt-0.5">
                      {venue.name}
                    </h4>
                  </div>
                  <div
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border whitespace-nowrap ${status.border} ${status.bg} ${status.text}`}
                  >
                    {status.badge}
                  </div>
                </div>

                {/* Regional Air Numbers */}
                <div className="mt-3 py-2 px-3 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between text-xs font-mono tabular-nums">
                  <div className="text-slate-300">
                    PSI: <span className="font-bold text-white">{regData.readings.psi24h}</span>
                  </div>
                  <div className="text-slate-300">
                    1-hr PM2.5: <span className="font-bold text-cyan-300">{regData.readings.pm25_1h} µg/m³</span>
                  </div>
                </div>

                {/* Specific Venue Advice */}
                <p className="mt-3 text-xs text-slate-300 leading-relaxed">
                  {status.advice}
                </p>
              </div>

              {/* Tags & Action Link */}
              <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-1.5 flex-wrap">
                  {venue.tags.slice(0, 3).map((t, idx) => (
                    <span
                      key={idx}
                      className="text-[10px] text-slate-400"
                    >
                      {t}{idx < 2 && idx < venue.tags.length - 1 ? ' ·' : ''}
                    </span>
                  ))}
                </div>
                <span className="text-[11px] text-cyan-400 font-medium hover:underline">
                  View Sector Map →
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Hourly Timing Projection Strategy */}
      <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-5 shadow-sm">
        <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
          <Clock className="w-3.5 h-3.5 text-cyan-400" />
          <span>Singapore Haze Diurnal Cycle & Running Time Windows</span>
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-300">
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
            <span className="font-bold text-emerald-400 block mb-1">05:30 – 08:30 (Dawn Window)</span>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Typically lowest wind dispersal from regional peat fires; best time for outdoor runs before solar heating drives convective haze down.
            </p>
          </div>
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
            <span className="font-bold text-amber-400 block mb-1">11:00 – 16:00 (Peak Ozone & Sun)</span>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Photochemical ozone and thermal updrafts usually peak. Minimize long outdoor workouts under direct tropical sun.
            </p>
          </div>
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
            <span className="font-bold text-cyan-400 block mb-1">19:30 – 22:30 (Night Window)</span>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Check 1-hr PM2.5 readings prior to evening running around Marina Bay or Bedok Reservoir.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
