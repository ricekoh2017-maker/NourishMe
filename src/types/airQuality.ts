export type RegionId = 'north' | 'south' | 'east' | 'west' | 'central' | 'national';

export type AirQualityBandId = 'good' | 'moderate' | 'unhealthy' | 'very_unhealthy' | 'hazardous';

export interface AirQualityBand {
  id: AirQualityBandId;
  label: string;
  min: number;
  max: number;
  color: string;
  bgColor: string;
  borderColor: string;
  textColor: string;
  badgeClass: string;
  generalPublicAdvice: string;
  vulnerableGroupsAdvice: string;
  chronicPatientsAdvice: string;
  maskRecommended: boolean;
}

export interface RegionMetadata {
  id: RegionId;
  name: string;
  fullDisplayName: string;
  landmarks: string[];
  lat: number;
  lng: number;
  mapCoords: { x: number; y: number };
}

export interface PollutantReadings {
  psi24h: number;
  pm25_1h: number;
  pm25_24h: number;
  pm10_24h: number;
  o3_8h: number;
  no2_1h: number;
  so2_24h: number;
  co_8h: number;
}

export interface RegionAirQualityData {
  region: RegionId;
  name: string;
  readings: PollutantReadings;
  band: AirQualityBand;
  pm25Band: 'normal' | 'elevated' | 'high' | 'very_high';
  trend: 'improving' | 'stable' | 'deteriorating';
  delta24h: number;
}

export interface HourlyHistoryPoint {
  time: string; // e.g. "14:00"
  timestamp: string;
  nationalPsi: number;
  nationalPm25: number;
  regions: Record<RegionId, { psi: number; pm25: number }>;
}

export interface HotspotSurveillance {
  sumatraHotspots: number;
  kalimantanHotspots: number;
  regionalRiskLevel: 'Low' | 'Guarded' | 'Elevated' | 'Severe';
  windDirection: string;
  windAngleDegrees: number;
  windSpeedKmH: number;
  satelliteObservationTime: string;
  monsoonPeriod: string;
}

export interface AlertConfig {
  enabled: boolean;
  psiThreshold: number; // e.g. 100 for Unhealthy
  pm25Threshold: number; // e.g. 55 for Elevated
  targetRegion: RegionId | 'all';
  soundEnabled: boolean;
  browserPushEnabled: boolean;
  frequencyMinutes: number;
}

export interface PushNotificationRecord {
  id: string;
  timestamp: string;
  title: string;
  body: string;
  severity: 'moderate' | 'unhealthy' | 'critical';
  region: RegionId;
  metric: 'PSI' | 'PM2.5';
  currentValue: number;
  threshold: number;
  read: boolean;
  sentViaBrowser: boolean;
}

export interface ActivityLocation {
  id: string;
  name: string;
  zone: string;
  region: RegionId;
  tags: string[];
  suitability: 'great' | 'fair' | 'caution' | 'avoid';
  recommendation: string;
}

export interface AreaWeatherForecast {
  area: string;
  forecast: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

export interface DatamallWeatherSummary {
  validPeriodText: string;
  rainWashoutExpected: boolean;
  rainWashoutSummary: string;
  forecasts: AreaWeatherForecast[];
}

export type ScenarioPreset = 'live' | 'good' | 'moderate' | 'unhealthy_haze' | 'severe_emergency' | 'rapid_spike';

