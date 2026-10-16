import React, { useState } from 'react';
import {
  RegionId,
  RegionAirQualityData,
  HotspotSurveillance
} from '../types/airQuality';
import { REGIONS_METADATA } from '../data/singaporeAirConstants';
import { Wind, Flame, Eye, Compass, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';

interface SingaporeMapProps {
  regions: Record<RegionId, RegionAirQualityData>;
  selectedRegion: RegionId;
  onSelectRegion: (region: RegionId) => void;
  activeMetric: 'psi' | 'pm25';
  onMetricChange: (metric: 'psi' | 'pm25') => void;
  hotspots: HotspotSurveillance;
}

export const SingaporeMap: React.FC<SingaporeMapProps> = ({
  regions,
  selectedRegion,
  onSelectRegion,
  activeMetric,
  onMetricChange,
  hotspots
}) => {
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [showWind, setShowWind] = useState<boolean>(true);
  const [showHotspotLayer, setShowHotspotLayer] = useState<boolean>(false);
  const [hoveredRegion, setHoveredRegion] = useState<RegionId | null>(null);

  // Helper to get metric value & color
  const getRegionMetric = (regId: RegionId) => {
    const data = regions[regId];
    if (!data) return { value: 0, color: '#10B981', label: 'Good' };
    if (activeMetric === 'psi') {
      return {
        value: data.readings.psi24h,
        color: data.band.color,
        label: data.band.label
      };
    } else {
      const pmVal = data.readings.pm25_1h;
      let col = '#10B981';
      let lbl = 'Normal';
      if (pmVal > 250) { col = '#8B5CF6'; lbl = 'Very High'; }
      else if (pmVal > 150) { col = '#EF4444'; lbl = 'High'; }
      else if (pmVal > 55) { col = '#F59E0B'; lbl = 'Elevated'; }
      return { value: pmVal, color: col, label: lbl };
    }
  };

  const handleZoomIn = () => setZoomLevel(prev => Math.min(prev + 0.25, 2.0));
  const handleZoomOut = () => setZoomLevel(prev => Math.max(prev - 0.25, 0.8));
  const handleResetZoom = () => setZoomLevel(1);

  // Region geometric paths on an 800x480 coordinate space
  // Designed accurately to reflect Singapore island layout and NEA 5 geographical sectors
  const regionPaths: Record<Exclude<RegionId, 'national'>, {
    path: string;
    labelPos: { x: number; y: number };
    stationPos: { x: number; y: number };
  }> = {
    west: {
      // Covers Tuas, Jurong, Clementi, Bukit Batok, Pioneer, Choa Chu Kang
      path: `M 110 320 
             L 80 345 
             L 50 340 
             L 40 310 
             L 70 270 
             L 110 220 
             L 150 170 
             L 210 140 
             L 270 170 
             L 270 220 
             L 245 285 
             L 190 325 
             L 145 315 Z`,
      labelPos: { x: 175, y: 220 },
      stationPos: { x: 175, y: 250 }
    },
    north: {
      // Covers Woodlands, Sembawang, Yishun, Mandai, Kranji
      path: `M 210 140 
             L 280 90 
             L 370 75 
             L 455 85 
             L 490 120 
             L 440 160 
             L 370 180 
             L 270 170 Z`,
      labelPos: { x: 370, y: 125 },
      stationPos: { x: 370, y: 155 }
    },
    central: {
      // Covers Bishan, Toa Payoh, Ang Mo Kio, Novena, Bukit Timah
      path: `M 270 170 
             L 370 180 
             L 440 160 
             L 470 205 
             L 450 260 
             L 370 280 
             L 270 220 Z`,
      labelPos: { x: 370, y: 220 },
      stationPos: { x: 370, y: 245 }
    },
    east: {
      // Covers Tampines, Bedok, Changi, Pasir Ris, Punggol East
      path: `M 455 85 
             L 520 80 
             L 590 100 
             L 660 140 
             L 740 185 
             L 760 215 
             L 705 245 
             L 615 275 
             L 535 285 
             L 450 260 
             L 470 205 
             L 440 160 
             L 490 120 Z`,
      labelPos: { x: 590, y: 195 },
      stationPos: { x: 590, y: 225 }
    },
    south: {
      // Covers Marina Bay, Tanjong Pagar, Telok Blangah, Pasir Panjang, Downtown Core
      path: `M 245 285 
             L 270 220 
             L 370 280 
             L 450 260 
             L 535 285 
             L 490 330 
             L 430 355 
             L 360 350 
             L 290 325 Z`,
      labelPos: { x: 380, y: 310 },
      stationPos: { x: 380, y: 335 }
    }
  };

  return (
    <div className="relative w-full rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl overflow-hidden flex flex-col">
      {/* Map Header Toolbar */}
      <div className="px-5 py-3.5 border-b border-slate-800/80 bg-slate-950/40 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="text-xs uppercase tracking-wider font-semibold text-slate-400">
            NEA Regional Observation Network
          </span>
          <span className="text-slate-600">·</span>
          <span className="text-xs text-slate-400">
            {selectedRegion === 'national' ? 'Islandwide National' : REGIONS_METADATA[selectedRegion].name} Selected
          </span>
        </div>

        {/* Controls Bar */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Metric Selector */}
          <div className="flex items-center bg-slate-950 p-1 rounded-lg border border-slate-800">
            <button
              onClick={() => onMetricChange('psi')}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-all whitespace-nowrap ${
                activeMetric === 'psi'
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              24-hr PSI
            </button>
            <button
              onClick={() => onMetricChange('pm25')}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-all whitespace-nowrap ${
                activeMetric === 'pm25'
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              1-hr PM2.5 (µg/m³)
            </button>
          </div>

          {/* Toggle Layers */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setShowWind(!showWind)}
              title="Toggle Wind Stream Vectors"
              className={`px-2.5 py-1 text-xs font-medium rounded-lg border transition-all flex items-center gap-1.5 whitespace-nowrap ${
                showWind
                  ? 'bg-cyan-950/50 border-cyan-700/60 text-cyan-300'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <Wind className="w-3.5 h-3.5" />
              <span>Wind {hotspots.windSpeedKmH}km/h</span>
            </button>

            <button
              onClick={() => setShowHotspotLayer(!showHotspotLayer)}
              title="Toggle Regional Hotspot Risk Corridor"
              className={`px-2.5 py-1 text-xs font-medium rounded-lg border transition-all flex items-center gap-1.5 whitespace-nowrap ${
                showHotspotLayer
                  ? 'bg-amber-950/60 border-amber-600/70 text-amber-300'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <Flame className="w-3.5 h-3.5" />
              <span>Hotspot Surveillance ({hotspots.sumatraHotspots})</span>
            </button>
          </div>

          {/* Zoom controls */}
          <div className="flex items-center bg-slate-950 rounded-lg border border-slate-800 p-0.5">
            <button
              onClick={handleZoomIn}
              className="p-1 text-slate-400 hover:text-white transition-colors"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={handleZoomOut}
              className="p-1 text-slate-400 hover:text-white transition-colors"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <button
              onClick={handleResetZoom}
              className="p-1 text-slate-400 hover:text-white transition-colors border-l border-slate-800"
              title="Reset View"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Map Viewport Area */}
      <div className="relative w-full h-[380px] sm:h-[440px] lg:h-[480px] bg-gradient-to-b from-slate-950 via-[#0B132B] to-[#0A1128] overflow-hidden select-none">
        {/* Subtle coordinate grid lines */}
        <div className="absolute inset-0 opacity-15 pointer-events-none bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:24px_24px]" />

        {/* Hotspot & Smoke Plume Overlay Banner if Active */}
        {showHotspotLayer && (
          <div className="absolute top-4 left-4 z-20 max-w-xs bg-slate-950/90 backdrop-blur-md border border-amber-600/50 p-3 rounded-xl shadow-lg">
            <div className="flex items-center gap-2 text-amber-400 text-xs font-semibold mb-1">
              <Flame className="w-4 h-4" />
              <span>MSS Regional Hotspot Surveillance</span>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              Sumatra: <span className="font-mono text-amber-300 font-bold">{hotspots.sumatraHotspots}</span> hotspots · 
              Kalimantan: <span className="font-mono text-amber-300 font-bold">{hotspots.kalimantanHotspots}</span> hotspots.
              Plume trajectory: <span className="text-cyan-300">{hotspots.windDirection}</span>.
            </p>
          </div>
        )}

        {/* Interactive SVG Map */}
        <div
          className="w-full h-full flex items-center justify-center transition-transform duration-300 ease-out"
          style={{ transform: `scale(${zoomLevel})` }}
        >
          <svg
            viewBox="0 0 800 480"
            className="w-full h-full max-h-[480px] drop-shadow-2xl"
            style={{ filter: 'drop-shadow(0 20px 30px rgba(0, 0, 0, 0.7))' }}
          >
            <defs>
              {/* Radial gradient glow for each region */}
              {(['north', 'south', 'east', 'west', 'central'] as RegionId[]).map(regId => {
                const metric = getRegionMetric(regId);
                return (
                  <radialGradient
                    key={`grad-${regId}`}
                    id={`glow-${regId}`}
                    cx="50%"
                    cy="50%"
                    r="50%"
                  >
                    <stop offset="0%" stopColor={metric.color} stopOpacity="0.45" />
                    <stop offset="70%" stopColor={metric.color} stopOpacity="0.18" />
                    <stop offset="100%" stopColor={metric.color} stopOpacity="0.05" />
                  </radialGradient>
                );
              })}

              {/* Water styling pattern */}
              <linearGradient id="straitsGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#08182B" />
                <stop offset="100%" stopColor="#0B2038" />
              </linearGradient>

              {/* Smoke haze pattern if elevated */}
              <linearGradient id="smokePlume" x1="0%" y1="100%" x2="50%" y2="0%">
                <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#F59E0B" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Ambient Straits of Johor (North) & Singapore Strait (South) Water representation */}
            <rect width="800" height="480" fill="transparent" />

            {/* Surrounding Southern Islands / Sentosa */}
            <g id="offshore-islands" className="pointer-events-none">
              {/* Sentosa */}
              <ellipse cx="370" cy="380" rx="35" ry="12" fill="#1E293B" stroke="#334155" strokeWidth="1" />
              <text x="370" y="383" fontSize="8" fill="#64748B" textAnchor="middle" className="font-mono">
                Sentosa
              </text>
              {/* Jurong Island */}
              <ellipse cx="160" cy="365" rx="36" ry="16" fill="#1E293B" stroke="#334155" strokeWidth="1" />
              <text x="160" y="368" fontSize="8" fill="#64748B" textAnchor="middle" className="font-mono">
                Jurong Island
              </text>
              {/* Pulau Ubin */}
              <ellipse cx="615" cy="85" rx="28" ry="10" fill="#1E293B" stroke="#334155" strokeWidth="1" />
              <text x="615" y="88" fontSize="8" fill="#64748B" textAnchor="middle" className="font-mono">
                Pulau Ubin
              </text>
              {/* Pulau Tekong */}
              <ellipse cx="700" cy="95" rx="34" ry="18" fill="#1E293B" stroke="#334155" strokeWidth="1" />
              <text x="700" y="98" fontSize="8" fill="#64748B" textAnchor="middle" className="font-mono">
                Pulau Tekong
              </text>
            </g>

            {/* Optional Smoke Plume visual if hotspots elevated */}
            {showHotspotLayer && (
              <path
                d="M 60 460 Q 200 350 400 240 T 700 80 L 760 160 Q 420 380 180 470 Z"
                fill="url(#smokePlume)"
                className="pointer-events-none transition-opacity duration-500"
              />
            )}

            {/* Singapore Mainland Region Sectors */}
            {(['west', 'north', 'central', 'east', 'south'] as Array<Exclude<RegionId, 'national'>>).map(regId => {
              const geom = regionPaths[regId];
              const metric = getRegionMetric(regId);
              const isSelected = selectedRegion === regId;
              const isHovered = hoveredRegion === regId;

              return (
                <g
                  key={regId}
                  onClick={() => onSelectRegion(regId)}
                  onMouseEnter={() => setHoveredRegion(regId)}
                  onMouseLeave={() => setHoveredRegion(null)}
                  className="cursor-pointer transition-all duration-200"
                >
                  {/* Outer atmospheric aura */}
                  <path
                    d={geom.path}
                    fill={`url(#glow-${regId})`}
                    stroke={metric.color}
                    strokeWidth={isSelected ? '2.5' : isHovered ? '2' : '1'}
                    strokeDasharray={isSelected ? 'none' : 'none'}
                    className="transition-all duration-300"
                  />

                  {/* Surface fill */}
                  <path
                    d={geom.path}
                    fill={metric.color}
                    fillOpacity={isSelected ? 0.35 : isHovered ? 0.28 : 0.16}
                    stroke={isSelected ? '#FFFFFF' : metric.color}
                    strokeWidth={isSelected ? 2 : 1}
                    className="transition-all duration-300"
                  />

                  {/* Sector Title Label */}
                  <text
                    x={geom.labelPos.x}
                    y={geom.labelPos.y - 12}
                    textAnchor="middle"
                    fill={isSelected ? '#FFFFFF' : '#E2E8F0'}
                    fontSize="13"
                    fontWeight="700"
                    className="tracking-wide uppercase pointer-events-none drop-shadow"
                  >
                    {regId}
                  </text>

                  {/* Live Value Badge inside sector */}
                  <g
                    transform={`translate(${geom.stationPos.x}, ${geom.stationPos.y})`}
                    className="pointer-events-none drop-shadow-md"
                  >
                    {/* Badge container */}
                    <rect
                      x="-48"
                      y="-18"
                      width="96"
                      height="34"
                      rx="6"
                      fill="#090D16"
                      fillOpacity="0.9"
                      stroke={metric.color}
                      strokeWidth={isSelected ? 2 : 1.2}
                    />

                    {/* Metric value and unit */}
                    <text
                      x="0"
                      y="-2"
                      textAnchor="middle"
                      fill="#FFFFFF"
                      fontSize="14"
                      fontWeight="800"
                      className="font-mono tabular-nums"
                    >
                      {metric.value}
                      <tspan fontSize="9" fontWeight="500" fill="#94A3B8" dx="3">
                        {activeMetric === 'psi' ? 'PSI' : 'µg/m³'}
                      </tspan>
                    </text>

                    {/* Band status subtext */}
                    <text
                      x="0"
                      y="11"
                      textAnchor="middle"
                      fill={metric.color}
                      fontSize="9"
                      fontWeight="700"
                      className="uppercase tracking-wider"
                    >
                      {metric.label}
                    </text>
                  </g>
                </g>
              );
            })}

            {/* Wind Vector Arrows across Singapore */}
            {showWind && (
              <g id="wind-vectors" className="pointer-events-none opacity-80">
                {[
                  { x: 180, y: 390 },
                  { x: 260, y: 360 },
                  { x: 380, y: 395 },
                  { x: 480, y: 370 },
                  { x: 320, y: 290 },
                  { x: 460, y: 280 },
                  { x: 570, y: 270 },
                  { x: 390, y: 190 },
                  { x: 520, y: 170 }
                ].map((pos, idx) => (
                  <g
                    key={`wind-${idx}`}
                    transform={`translate(${pos.x}, ${pos.y}) rotate(${hotspots.windAngleDegrees - 180})`}
                  >
                    <line
                      x1="0"
                      y1="-14"
                      x2="0"
                      y2="14"
                      stroke="#38BDF8"
                      strokeWidth="1.6"
                      strokeDasharray="3 3"
                    />
                    <polygon points="0,-16 -4,-9 4,-9" fill="#38BDF8" />
                  </g>
                ))}
              </g>
            )}
          </svg>
        </div>

        {/* Floating Quick Legend in Bottom Left */}
        <div className="absolute bottom-3 left-3 z-20 bg-slate-950/85 backdrop-blur-md border border-slate-800/80 px-3.5 py-2 rounded-xl flex items-center gap-3 text-[11px]">
          <span className="font-semibold text-slate-400">NEA Bands:</span>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500 inline-block" />
            <span className="text-slate-300">0-50 Good</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-sky-500 inline-block" />
            <span className="text-slate-300">51-100 Mod</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-amber-500 inline-block" />
            <span className="text-slate-300">101-200 Unhealthy</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-red-500 inline-block" />
            <span className="text-slate-300">201-300 V.Unhealthy</span>
          </div>
        </div>

        {/* Click Instruction in Bottom Right */}
        <div className="absolute bottom-3 right-3 z-20 text-[11px] text-slate-400 bg-slate-950/85 backdrop-blur-md border border-slate-800/80 px-3 py-1.5 rounded-xl hidden sm:flex items-center gap-1.5">
          <Eye className="w-3.5 h-3.5 text-cyan-400" />
          <span>Click any region on map to inspect detailed readings</span>
        </div>
      </div>
    </div>
  );
};
