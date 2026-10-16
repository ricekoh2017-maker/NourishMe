import {
  RegionId,
  RegionAirQualityData,
  HourlyHistoryPoint,
  AlertConfig,
  PushNotificationRecord,
  ScenarioPreset,
  HotspotSurveillance,
  DatamallWeatherSummary
} from '../types/airQuality';
import {
  getPsiBand,
  getPm25Band,
  REGIONS_METADATA,
  INITIAL_HOTSPOT_SURVEILLANCE
} from '../data/singaporeAirConstants';
import { playNotificationChime } from './notificationAudio';

export interface DataFetchResult {
  regions: Record<RegionId, RegionAirQualityData>;
  national: RegionAirQualityData;
  timestamp: string;
  source: 'live_api' | 'simulated';
  hotspots: HotspotSurveillance;
  history: HourlyHistoryPoint[];
  weatherSummary?: DatamallWeatherSummary;
}

const REGION_KEYS: RegionId[] = ['north', 'south', 'east', 'west', 'central', 'national'];

export const DEFAULT_ALERT_CONFIG: AlertConfig = {
  enabled: true,
  psiThreshold: 100, // Trigger when PSI enters 'Unhealthy'
  pm25Threshold: 55, // Trigger when 1-hr PM2.5 enters 'Elevated'
  targetRegion: 'all',
  soundEnabled: true,
  browserPushEnabled: false,
  frequencyMinutes: 30
};

// Generate realistic 24-hour history based on current readings
export const generate24hHistory = (currentRegions: Record<RegionId, RegionAirQualityData>): HourlyHistoryPoint[] => {
  const points: HourlyHistoryPoint[] = [];
  const now = new Date();

  for (let i = 23; i >= 0; i--) {
    const timeDate = new Date(now.getTime() - i * 60 * 60 * 1000);
    const hourStr = timeDate.toLocaleTimeString('en-SG', { hour: '2-digit', minute: '2-digit', hour12: false });
    
    // diurnal curve: haze and particulates typically peak late morning / mid-afternoon
    const hour = timeDate.getHours();
    const diurnalFactor = 0.82 + 0.35 * Math.sin(((hour - 6) / 24) * 2 * Math.PI);
    const noise = (Math.sin(i * 1.7) * 0.08);
    const multiplier = Math.max(0.65, Math.min(1.35, diurnalFactor + noise));

    const regionMap = {} as Record<RegionId, { psi: number; pm25: number }>;
    REGION_KEYS.forEach(reg => {
      const basePsi = currentRegions[reg]?.readings.psi24h || 42;
      const basePm25 = currentRegions[reg]?.readings.pm25_1h || 16;
      regionMap[reg] = {
        psi: Math.max(15, Math.round(basePsi * multiplier)),
        pm25: Math.max(5, Math.round(basePm25 * multiplier))
      };
    });

    points.push({
      time: hourStr,
      timestamp: timeDate.toISOString(),
      nationalPsi: regionMap.national.psi,
      nationalPm25: regionMap.national.pm25,
      regions: regionMap
    });
  }

  return points;
};

// Default fallback baseline data
export const createPresetData = (preset: ScenarioPreset): DataFetchResult => {
  const now = new Date();
  const timestampStr = now.toLocaleTimeString('en-SG', { hour: '2-digit', minute: '2-digit' }) + ' SGT';

  let baseValues: Record<RegionId, { psi: number; pm25_1h: number; pm25_24h: number; pm10: number; o3: number; no2: number; so2: number; co: number }>;
  let hotspotData: HotspotSurveillance = { ...INITIAL_HOTSPOT_SURVEILLANCE };

  switch (preset) {
    case 'good':
      baseValues = {
        north: { psi: 32, pm25_1h: 12, pm25_24h: 11, pm10: 18, o3: 16, no2: 12, so2: 4, co: 0.3 },
        south: { psi: 30, pm25_1h: 10, pm25_24h: 10, pm10: 16, o3: 20, no2: 15, so2: 5, co: 0.3 },
        east: { psi: 28, pm25_1h: 9, pm25_24h: 9, pm10: 15, o3: 18, no2: 10, so2: 3, co: 0.2 },
        west: { psi: 35, pm25_1h: 14, pm25_24h: 12, pm10: 21, o3: 22, no2: 18, so2: 6, co: 0.4 },
        central: { psi: 31, pm25_1h: 11, pm25_24h: 11, pm10: 17, o3: 19, no2: 14, so2: 4, co: 0.3 },
        national: { psi: 31, pm25_1h: 11, pm25_24h: 11, pm10: 17, o3: 19, no2: 14, so2: 4, co: 0.3 }
      };
      hotspotData.sumatraHotspots = 6;
      hotspotData.kalimantanHotspots = 11;
      hotspotData.regionalRiskLevel = 'Low';
      break;

    case 'unhealthy_haze':
      baseValues = {
        north: { psi: 98, pm25_1h: 62, pm25_24h: 58, pm10: 78, o3: 45, no2: 28, so2: 16, co: 1.1 },
        south: { psi: 128, pm25_1h: 88, pm25_24h: 82, pm10: 105, o3: 54, no2: 35, so2: 24, co: 1.6 },
        east: { psi: 108, pm25_1h: 68, pm25_24h: 65, pm10: 88, o3: 48, no2: 30, so2: 18, co: 1.3 },
        west: { psi: 142, pm25_1h: 96, pm25_24h: 92, pm10: 118, o3: 60, no2: 42, so2: 29, co: 1.9 },
        central: { psi: 118, pm25_1h: 76, pm25_24h: 72, pm10: 95, o3: 51, no2: 33, so2: 21, co: 1.4 },
        national: { psi: 122, pm25_1h: 78, pm25_24h: 74, pm10: 96, o3: 52, no2: 34, so2: 22, co: 1.5 }
      };
      hotspotData.sumatraHotspots = 187;
      hotspotData.kalimantanHotspots = 312;
      hotspotData.regionalRiskLevel = 'Elevated';
      hotspotData.windDirection = 'SSW (South-Southwest bringing smoke plume)';
      hotspotData.windSpeedKmH = 22;
      break;

    case 'severe_emergency':
      baseValues = {
        north: { psi: 186, pm25_1h: 124, pm25_24h: 118, pm10: 154, o3: 72, no2: 48, so2: 38, co: 2.4 },
        south: { psi: 236, pm25_1h: 182, pm25_24h: 175, pm10: 210, o3: 88, no2: 58, so2: 52, co: 3.2 },
        east: { psi: 202, pm25_1h: 142, pm25_24h: 136, pm10: 172, o3: 78, no2: 50, so2: 42, co: 2.6 },
        west: { psi: 258, pm25_1h: 212, pm25_24h: 198, pm10: 238, o3: 94, no2: 66, so2: 64, co: 3.8 },
        central: { psi: 220, pm25_1h: 168, pm25_24h: 160, pm10: 192, o3: 82, no2: 54, so2: 48, co: 2.9 },
        national: { psi: 225, pm25_1h: 166, pm25_24h: 158, pm10: 193, o3: 83, no2: 55, so2: 49, co: 3.0 }
      };
      hotspotData.sumatraHotspots = 460;
      hotspotData.kalimantanHotspots = 820;
      hotspotData.regionalRiskLevel = 'Severe';
      hotspotData.windDirection = 'SW (Dense smoke plume crossing Malacca Strait)';
      hotspotData.windSpeedKmH = 28;
      break;

    case 'rapid_spike':
      baseValues = {
        north: { psi: 82, pm25_1h: 48, pm25_24h: 45, pm10: 64, o3: 38, no2: 24, so2: 12, co: 0.8 },
        south: { psi: 132, pm25_1h: 92, pm25_24h: 78, pm10: 108, o3: 56, no2: 38, so2: 26, co: 1.7 },
        east: { psi: 94, pm25_1h: 58, pm25_24h: 52, pm10: 74, o3: 42, no2: 26, so2: 15, co: 1.0 },
        west: { psi: 155, pm25_1h: 118, pm25_24h: 96, pm10: 128, o3: 65, no2: 46, so2: 34, co: 2.1 },
        central: { psi: 112, pm25_1h: 74, pm25_24h: 66, pm10: 89, o3: 48, no2: 32, so2: 20, co: 1.3 },
        national: { psi: 115, pm25_1h: 78, pm25_24h: 67, pm10: 93, o3: 50, no2: 33, so2: 21, co: 1.4 }
      };
      hotspotData.sumatraHotspots = 210;
      hotspotData.regionalRiskLevel = 'Elevated';
      break;

    case 'moderate':
    default:
      baseValues = {
        north: { psi: 58, pm25_1h: 28, pm25_24h: 26, pm10: 38, o3: 28, no2: 22, so2: 9, co: 0.6 },
        south: { psi: 68, pm25_1h: 36, pm25_24h: 32, pm10: 46, o3: 34, no2: 28, so2: 12, co: 0.8 },
        east: { psi: 54, pm25_1h: 24, pm25_24h: 22, pm10: 34, o3: 26, no2: 18, so2: 8, co: 0.5 },
        west: { psi: 74, pm25_1h: 42, pm25_24h: 38, pm10: 52, o3: 38, no2: 32, so2: 14, co: 0.9 },
        central: { psi: 62, pm25_1h: 32, pm25_24h: 29, pm10: 42, o3: 30, no2: 24, so2: 10, co: 0.7 },
        national: { psi: 63, pm25_1h: 32, pm25_24h: 29, pm10: 42, o3: 31, no2: 25, so2: 11, co: 0.7 }
      };
      hotspotData.sumatraHotspots = 28;
      hotspotData.kalimantanHotspots = 42;
      hotspotData.regionalRiskLevel = 'Guarded';
      break;
  }

  const regionsObj = {} as Record<RegionId, RegionAirQualityData>;

  REGION_KEYS.forEach(reg => {
    const vals = baseValues[reg];
    const psiBand = getPsiBand(vals.psi);
    const pm25B = getPm25Band(vals.pm25_1h);
    regionsObj[reg] = {
      region: reg,
      name: REGIONS_METADATA[reg].name,
      readings: {
        psi24h: vals.psi,
        pm25_1h: vals.pm25_1h,
        pm25_24h: vals.pm25_24h,
        pm10_24h: vals.pm10,
        o3_8h: vals.o3,
        no2_1h: vals.no2,
        so2_24h: vals.so2,
        co_8h: vals.co
      },
      band: psiBand,
      pm25Band: pm25B.id,
      trend: vals.psi > 100 ? 'deteriorating' : vals.psi < 50 ? 'improving' : 'stable',
      delta24h: vals.psi > 100 ? +14 : vals.psi < 50 ? -6 : +2
    };
  });

  const history = generate24hHistory(regionsObj);

  return {
    regions: regionsObj,
    national: regionsObj.national,
    timestamp: timestampStr,
    source: 'simulated',
    hotspots: hotspotData,
    history
  };
};

/**
 * Fetches live PSI and 2-hr weather forecast data from the /api/hazePSI serverless endpoint,
 * with fallback to the direct NEA open data API: https://api.data.gov.sg/v1/environment/psi
 */
export const fetchLivePsiData = async (): Promise<DataFetchResult> => {
  // First try the local serverless endpoint which merges PSI and 2-hr forecast from NEA Datamall
  try {
    const serverlessRes = await fetch('/api/hazePSI', {
      method: 'GET',
      headers: { 'Accept': 'application/json' }
    });

    if (serverlessRes.ok) {
      const serverlessJson = await serverlessRes.json();
      if (serverlessJson?.regions) {
        const regionsObj = {} as Record<RegionId, RegionAirQualityData>;

        REGION_KEYS.forEach(reg => {
          const raw = serverlessJson.regions[reg];
          const psi24h = raw?.psi24h ?? 45;
          const pm25_1h = raw?.pm25_1h ?? 16;
          const psiBand = getPsiBand(psi24h);
          const pm25B = getPm25Band(pm25_1h);

          regionsObj[reg] = {
            region: reg,
            name: REGIONS_METADATA[reg].name,
            readings: {
              psi24h,
              pm25_1h,
              pm25_24h: raw?.pm25_24h ?? 14,
              pm10_24h: raw?.pm10_24h ?? 22,
              o3_8h: raw?.o3_8h ?? 18,
              no2_1h: raw?.no2_1h ?? 16,
              so2_24h: raw?.so2_24h ?? 6,
              co_8h: raw?.co_8h ?? 0.4
            },
            band: psiBand,
            pm25Band: pm25B.id,
            trend: psi24h > 100 ? 'deteriorating' : 'stable',
            delta24h: 0
          };
        });

        const history = generate24hHistory(regionsObj);
        const lastUpdated = serverlessJson.lastUpdated;
        const formattedTime = lastUpdated
          ? new Date(lastUpdated).toLocaleTimeString('en-SG', { hour: '2-digit', minute: '2-digit', hour12: false }) + ' SGT'
          : 'Just now';

        return {
          regions: regionsObj,
          national: regionsObj.national || regionsObj.central,
          timestamp: formattedTime,
          source: 'live_api',
          hotspots: INITIAL_HOTSPOT_SURVEILLANCE,
          history,
          weatherSummary: {
            validPeriodText: serverlessJson.validPeriod?.text || 'Next 2 Hours',
            rainWashoutExpected: serverlessJson.summary?.rainWashoutExpected ?? false,
            rainWashoutSummary: serverlessJson.summary?.rainWashoutSummary || '',
            forecasts: serverlessJson.twoHourForecasts || []
          }
        };
      }
    }
  } catch (serverlessErr) {
    console.info('Serverless /api/hazePSI not directly reachable from client, trying direct NEA open data:', serverlessErr);
  }

  // Fallback to direct NEA public API
  try {
    const res = await fetch('https://api.data.gov.sg/v1/environment/psi', {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    });

    if (!res.ok) {
      throw new Error(`Data.gov.sg returned HTTP ${res.status}`);
    }

    const json = await res.json();
    const item = json?.items?.[0];

    if (!item || !item.readings) {
      throw new Error('Malformed response from NEA API');
    }

    const readings = item.readings;
    const regionsObj = {} as Record<RegionId, RegionAirQualityData>;

    REGION_KEYS.forEach(reg => {
      const psi24h = Math.round(readings.psi_twenty_four_hourly?.[reg] ?? 45);
      const pm25_1h = Math.round(readings.pm25_one_hourly?.[reg] ?? 16);
      const pm25_24h = Math.round(readings.pm25_twenty_four_hourly?.[reg] ?? 14);
      const pm10_24h = Math.round(readings.pm10_twenty_four_hourly?.[reg] ?? 24);
      const o3_8h = Math.round(readings.o3_eight_hour_max?.[reg] ?? 22);
      const no2_1h = Math.round(readings.no2_one_hour_max?.[reg] ?? 18);
      const so2_24h = Math.round(readings.so2_twenty_four_hourly?.[reg] ?? 6);
      const co_8h = Number((readings.co_eight_hour_max?.[reg] ?? 0.4).toFixed(1));

      const psiBand = getPsiBand(psi24h);
      const pm25B = getPm25Band(pm25_1h);

      regionsObj[reg] = {
        region: reg,
        name: REGIONS_METADATA[reg].name,
        readings: {
          psi24h,
          pm25_1h,
          pm25_24h,
          pm10_24h,
          o3_8h,
          no2_1h,
          so2_24h,
          co_8h
        },
        band: psiBand,
        pm25Band: pm25B.id,
        trend: psi24h > 100 ? 'deteriorating' : 'stable',
        delta24h: 0
      };
    });

    const updateTime = item.update_timestamp || item.timestamp;
    const formattedTime = updateTime ? new Date(updateTime).toLocaleTimeString('en-SG', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    }) + ' SGT' : 'Just now';

    const history = generate24hHistory(regionsObj);

    return {
      regions: regionsObj,
      national: regionsObj.national,
      timestamp: formattedTime,
      source: 'live_api',
      hotspots: INITIAL_HOTSPOT_SURVEILLANCE,
      history
    };
  } catch (error) {
    console.warn('Live NEA API fetch unavailable or blocked by CORS, falling back to realistic live baseline:', error);
    const fallback = createPresetData('moderate');
    fallback.source = 'simulated';
    return fallback;
  }
};

/**
 * Checks whether current readings breach user-configured thresholds,
 * fires push notifications and audio chimes, and returns newly created alerts.
 */
export const evaluateThresholdsAndNotify = async (
  data: DataFetchResult,
  config: AlertConfig,
  existingAlerts: PushNotificationRecord[]
): Promise<PushNotificationRecord[]> => {
  if (!config.enabled) return [];

  const newAlerts: PushNotificationRecord[] = [];
  const targetRegions: RegionId[] = config.targetRegion === 'all'
    ? ['west', 'east', 'central', 'south', 'north']
    : [config.targetRegion];

  for (const reg of targetRegions) {
    const regData = data.regions[reg];
    if (!regData) continue;

    const psiBreach = regData.readings.psi24h >= config.psiThreshold;
    const pm25Breach = regData.readings.pm25_1h >= config.pm25Threshold;

    if (psiBreach || pm25Breach) {
      // Check if we already alerted on this region in the last 15 minutes to avoid spam
      const recentAlert = existingAlerts.find(
        a => a.region === reg &&
             Date.now() - new Date(a.timestamp).getTime() < 15 * 60 * 1000
      );

      if (!recentAlert) {
        const metricName = psiBreach ? 'PSI' : 'PM2.5';
        const metricVal = psiBreach ? regData.readings.psi24h : regData.readings.pm25_1h;
        const thresholdVal = psiBreach ? config.psiThreshold : config.pm25Threshold;
        const severity = metricVal >= 200 ? 'critical' : 'unhealthy';

        const title = `⚠️ Air Quality Alert: ${REGIONS_METADATA[reg].name}`;
        const body = `${metricName} reached ${metricVal} (exceeds threshold ${thresholdVal}). ${regData.band.generalPublicAdvice}`;

        let sentViaBrowser = false;

        // Trigger real Web Notification if user granted permission
        if (config.browserPushEnabled && typeof window !== 'undefined' && 'Notification' in window) {
          if (Notification.permission === 'granted') {
            try {
              new Notification(title, {
                body,
                tag: `air-alert-${reg}-${Date.now()}`,
                silent: !config.soundEnabled
              });
              sentViaBrowser = true;
            } catch (e) {
              console.warn('Native notification failed:', e);
            }
          }
        }

        // Play alert audio chime
        if (config.soundEnabled) {
          playNotificationChime(severity);
        }

        newAlerts.push({
          id: `alert-${reg}-${Date.now()}`,
          timestamp: new Date().toISOString(),
          title,
          body,
          severity,
          region: reg,
          metric: metricName,
          currentValue: metricVal,
          threshold: thresholdVal,
          read: false,
          sentViaBrowser
        });
      }
    }
  }

  return newAlerts;
};
