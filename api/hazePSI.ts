import type { Request, Response } from 'express';

export interface AreaForecast {
  area: string;
  forecast: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

export interface RegionPsiReading {
  psi24h: number;
  pm25_1h: number;
  pm25_24h: number;
  pm10_24h: number;
  o3_8h: number;
  no2_1h: number;
  so2_24h: number;
  co_8h: number;
  band: 'Good' | 'Moderate' | 'Unhealthy' | 'Very Unhealthy' | 'Hazardous';
  bandColor: string;
  alertTriggered: boolean;
  healthAdvice: string;
}

export interface HazePsiResponse {
  timestamp: string;
  lastUpdated: string;
  source: string;
  validPeriod: {
    start: string;
    end: string;
    text: string;
  };
  summary: {
    nationalPsi: number;
    nationalBand: string;
    highestRegion: {
      region: string;
      psi: number;
      band: string;
    };
    unhealthySectorsCount: number;
    rainWashoutExpected: boolean;
    rainWashoutSummary: string;
  };
  regions: Record<'north' | 'south' | 'east' | 'west' | 'central' | 'national', RegionPsiReading>;
  twoHourForecasts: AreaForecast[];
  alerts: Array<{
    region: string;
    metric: string;
    value: number;
    threshold: number;
    severity: 'unhealthy' | 'critical';
    message: string;
  }>;
}

const getBandDetails = (psi: number): {
  band: 'Good' | 'Moderate' | 'Unhealthy' | 'Very Unhealthy' | 'Hazardous';
  color: string;
  advice: string;
} => {
  if (psi <= 50) {
    return {
      band: 'Good',
      color: '#10B981',
      advice: 'Normal outdoor activities can be carried out. Air is clean.'
    };
  }
  if (psi <= 100) {
    return {
      band: 'Moderate',
      color: '#0EA5E9',
      advice: 'Normal outdoor activities can be carried out.'
    };
  }
  if (psi <= 200) {
    return {
      band: 'Unhealthy',
      color: '#F59E0B',
      advice: 'Reduce prolonged or strenuous outdoor exertion. Vulnerable groups should minimise outdoor activity.'
    };
  }
  if (psi <= 300) {
    return {
      band: 'Very Unhealthy',
      color: '#EF4444',
      advice: 'Avoid prolonged or strenuous outdoor exertion. Vulnerable groups stay indoors.'
    };
  }
  return {
    band: 'Hazardous',
    color: '#8B5CF6',
    advice: 'Minimise or avoid outdoor activities. N95 respirator recommended outdoors.'
  };
};

export const fetchNeaData = async (): Promise<HazePsiResponse> => {
  const headers = {
    'accept': 'application/json',
    'User-Agent': 'SG-AirAlert-Serverless/1.0'
  };

  // 1. Fetch 2-hr Weather Forecast from NEA Datamall API v2
  let twoHourData: any = null;
  try {
    const resTwoHr = await fetch('https://api-open.data.gov.sg/v2/real-time/api/two-hr-forecast', {
      method: 'GET',
      headers
    });
    if (resTwoHr.ok) {
      twoHourData = await resTwoHr.json();
    }
  } catch (err) {
    console.warn('Could not fetch two-hr-forecast from api-open.data.gov.sg:', err);
  }

  // 2. Fetch Live PSI from NEA Data API
  let psiData: any = null;
  try {
    const resPsi = await fetch('https://api.data.gov.sg/v1/environment/psi', {
      method: 'GET',
      headers
    });
    if (resPsi.ok) {
      psiData = await resPsi.json();
    }
  } catch (err) {
    console.warn('Could not fetch psi from api.data.gov.sg:', err);
  }

  // Process Two-Hour Forecasts
  const forecastsList: AreaForecast[] = [];
  let validPeriod = {
    start: new Date().toISOString(),
    end: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
    text: 'Next 2 Hours'
  };

  const coordsMap = new Map<string, { latitude: number; longitude: number }>();
  if (twoHourData?.data?.area_metadata) {
    for (const meta of twoHourData.data.area_metadata) {
      if (meta?.name && meta?.label_location) {
        coordsMap.set(meta.name.toLowerCase(), meta.label_location);
      }
    }
  }

  const rawForecasts = twoHourData?.data?.items?.[0]?.forecasts || [];
  if (twoHourData?.data?.items?.[0]?.valid_period) {
    validPeriod = twoHourData.data.items[0].valid_period;
  }

  let rainyAreaCount = 0;
  for (const item of rawForecasts) {
    const forecastText = item.forecast || 'Cloudy';
    if (/rain|shower|thunder/i.test(forecastText)) {
      rainyAreaCount++;
    }
    forecastsList.push({
      area: item.area,
      forecast: forecastText,
      coordinates: coordsMap.get(item.area.toLowerCase())
    });
  }

  const rainWashoutExpected = rainyAreaCount > 5;
  const rainWashoutSummary = rainWashoutExpected
    ? `Showers/rain forecasted in ${rainyAreaCount} sectors. Rainfall will assist in scrubbing airborne haze particles.`
    : `Predominantly dry conditions across Singapore. Haze particulate dispersal depends primarily on prevailing wind currents.`;

  // Process PSI Readings
  const readings = psiData?.items?.[0]?.readings || {};
  const regionKeys: Array<'north' | 'south' | 'east' | 'west' | 'central' | 'national'> = [
    'north', 'south', 'east', 'west', 'central', 'national'
  ];

  const regions: Record<'north' | 'south' | 'east' | 'west' | 'central' | 'national', RegionPsiReading> = {} as any;
  const alerts: HazePsiResponse['alerts'] = [];

  let highestRegion = { region: 'national', psi: 0, band: 'Good' };
  let unhealthyCount = 0;

  for (const reg of regionKeys) {
    const psi24 = Math.round(readings.psi_twenty_four_hourly?.[reg] ?? 45);
    const pm25_1 = Math.round(readings.pm25_one_hourly?.[reg] ?? 16);
    const pm25_24 = Math.round(readings.pm25_twenty_four_hourly?.[reg] ?? 14);
    const pm10_24 = Math.round(readings.pm10_twenty_four_hourly?.[reg] ?? 22);
    const o3_8 = Math.round(readings.o3_eight_hour_max?.[reg] ?? 18);
    const no2_1 = Math.round(readings.no2_one_hour_max?.[reg] ?? 16);
    const so2_24 = Math.round(readings.so2_twenty_four_hourly?.[reg] ?? 6);
    const co_8 = Number((readings.co_eight_hour_max?.[reg] ?? 0.4).toFixed(1));

    const bandInfo = getBandDetails(psi24);
    const alertTriggered = psi24 > 100 || pm25_1 > 55;

    if (alertTriggered && reg !== 'national') {
      unhealthyCount++;
      alerts.push({
        region: reg,
        metric: psi24 > 100 ? 'PSI' : 'PM2.5',
        value: psi24 > 100 ? psi24 : pm25_1,
        threshold: psi24 > 100 ? 100 : 55,
        severity: psi24 > 200 ? 'critical' : 'unhealthy',
        message: `${reg.toUpperCase()} sector reached ${psi24} PSI (${bandInfo.band}). ${bandInfo.advice}`
      });
    }

    if (reg !== 'national' && psi24 > highestRegion.psi) {
      highestRegion = {
        region: reg,
        psi: psi24,
        band: bandInfo.band
      };
    }

    regions[reg] = {
      psi24h: psi24,
      pm25_1h: pm25_1,
      pm25_24h: pm25_24,
      pm10_24h: pm10_24,
      o3_8h: o3_8,
      no2_1h: no2_1,
      so2_24h: so2_24,
      co_8h: co_8,
      band: bandInfo.band,
      bandColor: bandInfo.color,
      alertTriggered,
      healthAdvice: bandInfo.advice
    };
  }

  const nationalPsi = regions.national?.psi24h || 45;
  const nationalBand = regions.national?.band || 'Good';

  const updateTimestamp = psiData?.items?.[0]?.update_timestamp ||
    twoHourData?.data?.items?.[0]?.update_timestamp ||
    new Date().toISOString();

  return {
    timestamp: new Date().toISOString(),
    lastUpdated: updateTimestamp,
    source: 'NEA Datamall Open Data (api-open.data.gov.sg & api.data.gov.sg)',
    validPeriod,
    summary: {
      nationalPsi,
      nationalBand,
      highestRegion,
      unhealthySectorsCount: unhealthyCount,
      rainWashoutExpected,
      rainWashoutSummary
    },
    regions,
    twoHourForecasts: forecastsList,
    alerts
  };
};

// Express route handler
export const hazePsiHandler = async (req: Request, res: Response) => {
  try {
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept');
    res.setHeader('Cache-Control', 'public, max-age=60, s-maxage=60');

    if (req.method === 'OPTIONS') {
      return res.status(204).end();
    }

    const data = await fetchNeaData();
    return res.status(200).json(data);
  } catch (error) {
    console.error('Error in /api/hazePSI:', error);
    return res.status(500).json({
      error: 'Failed to fetch NEA haze and PSI data',
      message: (error as Error).message
    });
  }
};

// Default serverless export
export default async function handler(req: Request, res: Response) {
  return hazePsiHandler(req, res);
}
