import React from 'react';
import { ScenarioPreset } from '../types/airQuality';
import { RefreshCw, Radio, Sparkles, AlertOctagon, CheckCircle2, Zap } from 'lucide-react';

interface ScenarioBarProps {
  currentPreset: ScenarioPreset;
  onSelectPreset: (preset: ScenarioPreset) => void;
  onRefresh: () => void;
  isLoading: boolean;
  dataSource: 'live_api' | 'simulated';
  timestamp: string;
  onTriggerInstantSpike: () => void;
}

export const ScenarioBar: React.FC<ScenarioBarProps> = ({
  currentPreset,
  onSelectPreset,
  onRefresh,
  isLoading,
  dataSource,
  timestamp,
  onTriggerInstantSpike
}) => {
  return (
    <div className="bg-slate-900/80 backdrop-blur-md rounded-2xl border border-slate-800 p-3 sm:px-4 sm:py-3 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-3">
      {/* Source Status & Refresh */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span
              className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                dataSource === 'live_api' ? 'bg-emerald-400' : 'bg-cyan-400'
              }`}
            />
            <span
              className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                dataSource === 'live_api' ? 'bg-emerald-500' : 'bg-cyan-500'
              }`}
            />
          </span>

          <span className="text-xs font-semibold text-slate-200">
            {dataSource === 'live_api' ? 'Live Singapore NEA API' : 'Scenario Testing Mode'}
          </span>
        </div>

        <span className="text-slate-700">·</span>

        <span className="text-xs text-slate-400 font-mono">
          Updated: {timestamp}
        </span>

        <button
          onClick={onRefresh}
          disabled={isLoading}
          className="p-1 text-slate-400 hover:text-white rounded-md hover:bg-slate-800 transition-colors disabled:opacity-50"
          title="Refresh Air Quality Data"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-cyan-400' : ''}`} />
        </button>
      </div>

      {/* Preset Controls */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
        <span className="text-[11px] font-semibold text-slate-400 whitespace-nowrap hidden lg:inline mr-1">
          Haze Simulator:
        </span>

        <button
          onClick={() => onSelectPreset('live')}
          className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-all whitespace-nowrap flex items-center gap-1.5 ${
            currentPreset === 'live'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
          }`}
          title="Fetch real-time readings from Singapore data.gov.sg"
        >
          <Radio className="w-3 h-3" />
          <span>Live NEA API</span>
        </button>

        <button
          onClick={() => onSelectPreset('good')}
          className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-all whitespace-nowrap flex items-center gap-1.5 ${
            currentPreset === 'good'
              ? 'bg-slate-800 text-emerald-400 border border-emerald-500/40 shadow-sm'
              : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
          }`}
        >
          <span>Good (PSI 31)</span>
        </button>

        <button
          onClick={() => onSelectPreset('unhealthy_haze')}
          className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-all whitespace-nowrap flex items-center gap-1.5 ${
            currentPreset === 'unhealthy_haze'
              ? 'bg-amber-950/80 text-amber-300 border border-amber-500 shadow-sm'
              : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
          }`}
          title="Simulate Haze Outbreak crossing Unhealthy threshold (PSI 122)"
        >
          <AlertOctagon className="w-3 h-3 text-amber-400" />
          <span>Haze Alert (PSI 122)</span>
        </button>

        <button
          onClick={() => onSelectPreset('severe_emergency')}
          className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-all whitespace-nowrap flex items-center gap-1.5 ${
            currentPreset === 'severe_emergency'
              ? 'bg-red-950/80 text-red-300 border border-red-500 shadow-sm'
              : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
          }`}
          title="Simulate 2015 Severe Emergency Haze (PSI 225)"
        >
          <AlertOctagon className="w-3 h-3 text-red-400" />
          <span>Severe (PSI 225)</span>
        </button>

        <button
          onClick={onTriggerInstantSpike}
          className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-cyan-950/60 hover:bg-cyan-900 border border-cyan-600/60 text-cyan-300 transition-all whitespace-nowrap flex items-center gap-1"
          title="Trigger an immediate alert breach to test sound and push notification"
        >
          <Zap className="w-3 h-3 text-cyan-400" />
          <span>Test Alert</span>
        </button>
      </div>
    </div>
  );
};
