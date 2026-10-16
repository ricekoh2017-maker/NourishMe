import React, { useState } from 'react';
import { RegionAirQualityData, RegionId } from '../types/airQuality';
import { REGIONS_METADATA } from '../data/singaporeAirConstants';
import { Info, ArrowUpDown, ShieldCheck, AlertCircle } from 'lucide-react';

interface PollutantsBreakdownProps {
  regions: Record<RegionId, RegionAirQualityData>;
  selectedRegion: RegionId;
  onSelectRegion: (reg: RegionId) => void;
}

export const PollutantsBreakdown: React.FC<PollutantsBreakdownProps> = ({
  regions,
  selectedRegion,
  onSelectRegion
}) => {
  const [sortField, setSortField] = useState<'name' | 'psi' | 'pm25_1h' | 'pm10'>('psi');
  const [sortAsc, setSortAsc] = useState<boolean>(false);

  const regionList = Object.values(regions);

  const sortedRegions = [...regionList].sort((a, b) => {
    let valA = 0;
    let valB = 0;
    if (sortField === 'name') {
      return sortAsc ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name);
    } else if (sortField === 'psi') {
      valA = a.readings.psi24h;
      valB = b.readings.psi24h;
    } else if (sortField === 'pm25_1h') {
      valA = a.readings.pm25_1h;
      valB = b.readings.pm25_1h;
    } else if (sortField === 'pm10') {
      valA = a.readings.pm10_24h;
      valB = b.readings.pm10_24h;
    }
    return sortAsc ? valA - valB : valB - valA;
  });

  const handleSort = (field: 'name' | 'psi' | 'pm25_1h' | 'pm10') => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  const selectedData = regions[selectedRegion] || regions.national;

  // Pollutant definition reference
  const pollutantCards = [
    {
      code: '24-hr PSI',
      name: 'Pollutant Standards Index',
      value: selectedData.readings.psi24h,
      unit: 'Index',
      normalBenchmark: '0–50 Good, 51–100 Moderate',
      description: 'Composite index computed from 6 key air pollutants according to Singapore standards.'
    },
    {
      code: '1-hr PM2.5',
      name: 'Fine Particulate Matter (≤2.5 µm)',
      value: selectedData.readings.pm25_1h,
      unit: 'µg/m³',
      normalBenchmark: '0–55 Normal Band I',
      description: 'Microscopic particles that penetrate deep into lung airways; key real-time indicator for sports.'
    },
    {
      code: '24-hr PM2.5',
      name: '24-Hour Rolling PM2.5',
      value: selectedData.readings.pm25_24h,
      unit: 'µg/m³',
      normalBenchmark: '< 37.5 µg/m³ (WHO / NEA target)',
      description: '24-hour weighted average used to assess cumulative daily exposure.'
    },
    {
      code: '24-hr PM10',
      name: 'Coarse Particulates (≤10 µm)',
      value: selectedData.readings.pm10_24h,
      unit: 'µg/m³',
      normalBenchmark: '< 50 µg/m³',
      description: 'Inhalable dust, construction debris, road dust, and smoke particles.'
    },
    {
      code: '8-hr O3',
      name: 'Ozone',
      value: selectedData.readings.o3_8h,
      unit: 'µg/m³',
      normalBenchmark: '< 100 µg/m³',
      description: 'Secondary photochemical smog formed by sunlight reacting with vehicle emissions.'
    },
    {
      code: '1-hr NO2',
      name: 'Nitrogen Dioxide',
      value: selectedData.readings.no2_1h,
      unit: 'µg/m³',
      normalBenchmark: '< 200 µg/m³',
      description: 'Emitted from motor vehicle exhausts and industrial combustion facilities.'
    },
    {
      code: '24-hr SO2',
      name: 'Sulphur Dioxide',
      value: selectedData.readings.so2_24h,
      unit: 'µg/m³',
      normalBenchmark: '< 50 µg/m³',
      description: 'Emitted from fuel oil combustion in ships, refineries, and power stations.'
    },
    {
      code: '8-hr CO',
      name: 'Carbon Monoxide',
      value: selectedData.readings.co_8h,
      unit: 'mg/m³',
      normalBenchmark: '< 9.0 mg/m³',
      description: 'Odorless toxic gas from incomplete engine combustion in dense road traffic.'
    }
  ];

  return (
    <div className="space-y-6">
      {/* 8 Pollutants Grid for Selected Region */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-white">
              Pollutant Multi-Parameter Spectrum
            </h3>
            <p className="text-xs text-slate-400">
              Selected: {selectedData.name} · All measurements verified against NEA environmental standards
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {pollutantCards.map((p, idx) => (
            <div
              key={idx}
              className="bg-slate-900/90 rounded-2xl border border-slate-800 p-4 shadow-sm flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-xs font-bold text-cyan-400">
                    {p.code}
                  </span>
                  <span className="text-[11px] text-slate-400">{p.unit}</span>
                </div>
                <h4 className="text-xs text-slate-300 font-medium mt-1 truncate">
                  {p.name}
                </h4>
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="text-2xl font-bold font-mono tabular-nums text-white">
                    {p.value}
                  </span>
                  <span className="text-xs text-slate-400 font-sans">{p.unit}</span>
                </div>
              </div>

              <div className="mt-3 pt-2.5 border-t border-slate-800/80">
                <p className="text-[11px] text-slate-400 leading-tight">
                  {p.description}
                </p>
                <div className="mt-2 text-[10px] text-slate-500 font-mono">
                  Std: {p.normalBenchmark}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Cross-Regional Comparison Matrix Table */}
      <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-5 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-white">
            Islandwide Regional Telemetry Matrix
          </h3>
          <span className="text-xs text-slate-400">
            Click table headers to sort
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
                <th
                  onClick={() => handleSort('name')}
                  className="py-3 px-3 cursor-pointer hover:text-white"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Sector</span>
                    <ArrowUpDown className="w-3.5 h-3.5" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('psi')}
                  className="py-3 px-3 text-right cursor-pointer hover:text-white"
                >
                  <div className="flex items-center justify-end gap-1.5">
                    <span>24-hr PSI</span>
                    <ArrowUpDown className="w-3.5 h-3.5" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('pm25_1h')}
                  className="py-3 px-3 text-right cursor-pointer hover:text-white"
                >
                  <div className="flex items-center justify-end gap-1.5">
                    <span>1-hr PM2.5</span>
                    <ArrowUpDown className="w-3.5 h-3.5" />
                  </div>
                </th>
                <th className="py-3 px-3 text-right">24-hr PM2.5</th>
                <th
                  onClick={() => handleSort('pm10')}
                  className="py-3 px-3 text-right cursor-pointer hover:text-white"
                >
                  <div className="flex items-center justify-end gap-1.5">
                    <span>PM10</span>
                    <ArrowUpDown className="w-3.5 h-3.5" />
                  </div>
                </th>
                <th className="py-3 px-3 text-right">O3 (8h)</th>
                <th className="py-3 px-3 text-right">NO2 (1h)</th>
                <th className="py-3 px-3 text-right">SO2 (24h)</th>
                <th className="py-3 px-3 text-right">CO (8h)</th>
                <th className="py-3 px-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono tabular-nums">
              {sortedRegions.map(reg => {
                const isSelected = selectedRegion === reg.region;
                return (
                  <tr
                    key={reg.region}
                    onClick={() => onSelectRegion(reg.region)}
                    className={`cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-slate-800/80 text-white font-semibold'
                        : 'hover:bg-slate-850/60 text-slate-300'
                    }`}
                  >
                    <td className="py-3 px-3 font-sans font-medium flex items-center gap-2">
                      <span
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ backgroundColor: reg.band.color }}
                      />
                      <span>{reg.name}</span>
                    </td>
                    <td className="py-3 px-3 text-right font-bold text-white">
                      {reg.readings.psi24h}
                    </td>
                    <td className="py-3 px-3 text-right text-cyan-300">
                      {reg.readings.pm25_1h}
                    </td>
                    <td className="py-3 px-3 text-right text-slate-400">
                      {reg.readings.pm25_24h}
                    </td>
                    <td className="py-3 px-3 text-right text-slate-400">
                      {reg.readings.pm10_24h}
                    </td>
                    <td className="py-3 px-3 text-right text-slate-400">
                      {reg.readings.o3_8h}
                    </td>
                    <td className="py-3 px-3 text-right text-slate-400">
                      {reg.readings.no2_1h}
                    </td>
                    <td className="py-3 px-3 text-right text-slate-400">
                      {reg.readings.so2_24h}
                    </td>
                    <td className="py-3 px-3 text-right text-slate-400">
                      {reg.readings.co_8h}
                    </td>
                    <td className="py-3 px-3 text-center font-sans">
                      <span
                        className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border inline-block"
                        style={{
                          color: reg.band.color,
                          backgroundColor: reg.band.bgColor,
                          borderColor: reg.band.borderColor
                        }}
                      >
                        {reg.band.label}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
