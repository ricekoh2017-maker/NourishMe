import React from 'react';
import { RegionAirQualityData } from '../types/airQuality';
import {
  Users,
  Baby,
  HeartPulse,
  ShieldAlert,
  Wind,
  CheckCircle2,
  AlertOctagon,
  Sparkles
} from 'lucide-react';

interface HealthAdvisoryPanelProps {
  currentData: RegionAirQualityData;
}

export const HealthAdvisoryPanel: React.FC<HealthAdvisoryPanelProps> = ({ currentData }) => {
  const { band, readings } = currentData;
  const isHighRisk = readings.psi24h > 100 || readings.pm25_1h > 55;
  const isSevere = readings.psi24h > 200 || readings.pm25_1h > 150;

  return (
    <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6 shadow-sm space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-white">
              Official NEA Health Advisory
            </h3>
            <span className="text-xs text-slate-500">·</span>
            <span className="text-xs text-slate-400">
              For {currentData.name} ({readings.psi24h} PSI)
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Guidance formulated by Ministry of Health (MOH) and National Environment Agency (NEA)
          </p>
        </div>

        {band.maskRecommended ? (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-950/60 border border-red-700/60 text-red-300 text-xs font-semibold">
            <AlertOctagon className="w-4 h-4 text-red-400 shrink-0" />
            <span>N95 Mask Advised Outdoors</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-950/50 border border-emerald-700/50 text-emerald-300 text-xs font-semibold">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>No Mask Required</span>
          </div>
        )}
      </div>

      {/* Advisory 3-Tier Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Tier 1: Healthy Individuals */}
        <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-slate-200">
              <Users className="w-4 h-4 text-cyan-400" />
              <h4 className="text-sm font-semibold">Healthy Persons</h4>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              {band.generalPublicAdvice}
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-400 font-medium">
            Outdoor Exertion: <span className="text-white">{readings.psi24h <= 100 ? 'Normal' : readings.psi24h <= 200 ? 'Reduce Prolonged' : 'Avoid'}</span>
          </div>
        </div>

        {/* Tier 2: Elderly, Pregnant & Children */}
        <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-slate-200">
              <Baby className="w-4 h-4 text-amber-400" />
              <h4 className="text-sm font-semibold">Elderly, Pregnant & Children</h4>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              {band.vulnerableGroupsAdvice}
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-400 font-medium">
            Vulnerability Level: <span className="text-amber-400 font-semibold">{readings.psi24h <= 50 ? 'Low' : readings.psi24h <= 100 ? 'Moderate' : 'High Precaution'}</span>
          </div>
        </div>

        {/* Tier 3: Chronic Respiratory & Cardiac Patients */}
        <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-slate-200">
              <HeartPulse className="w-4 h-4 text-rose-400" />
              <h4 className="text-sm font-semibold">Chronic Lung & Heart Patients</h4>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              {band.chronicPatientsAdvice}
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-400 font-medium">
            Inhalers / Meds: <span className="text-rose-400 font-semibold">{readings.psi24h > 100 ? 'Mandatory On Hand' : 'Standard Routine'}</span>
          </div>
        </div>
      </div>

      {/* Practical Protective Measures Checklist */}
      <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800">
        <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-3">
          Recommended Indoor & Home Protections
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs text-slate-300">
          <div className="flex items-center gap-2">
            <span className={`w-1.5 h-1.5 rounded-full ${isHighRisk ? 'bg-amber-400' : 'bg-slate-600'}`} />
            <span>Keep windows & doors closed if haze detected</span>
          </div>
          <div className="flex items-center gap-2">
            <span className={`w-1.5 h-1.5 rounded-full ${isHighRisk ? 'bg-amber-400' : 'bg-slate-600'}`} />
            <span>Operate portable air cleaner with HEPA filter</span>
          </div>
          <div className="flex items-center gap-2">
            <span className={`w-1.5 h-1.5 rounded-full ${isHighRisk ? 'bg-amber-400' : 'bg-slate-600'}`} />
            <span>Drink plenty of water to soothe throat</span>
          </div>
          <div className="flex items-center gap-2">
            <span className={`w-1.5 h-1.5 rounded-full ${isHighRisk ? 'bg-amber-400' : 'bg-slate-600'}`} />
            <span>Use saline eye drops for haze eye irritation</span>
          </div>
        </div>
      </div>
    </div>
  );
};
