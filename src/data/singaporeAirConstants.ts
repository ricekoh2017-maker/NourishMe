import {
  AirQualityBand,
  AirQualityBandId,
  RegionId,
  RegionMetadata,
  ActivityLocation,
  HotspotSurveillance
} from '../types/airQuality';

export const PSI_BANDS: Record<AirQualityBandId, AirQualityBand> = {
  good: {
    id: 'good',
    label: 'Good',
    min: 0,
    max: 50,
    color: '#10B981', // emerald-500
    bgColor: 'rgba(16, 185, 129, 0.15)',
    borderColor: '#059669',
    textColor: '#34D399',
    badgeClass: 'text-emerald-400 bg-emerald-950/60 border-emerald-700/50',
    generalPublicAdvice: 'Normal outdoor activities can be carried out. Air quality is clean and healthy.',
    vulnerableGroupsAdvice: 'Safe for all normal outdoor activities, sports, and school workouts.',
    chronicPatientsAdvice: 'Safe to carry out regular daily physical activities outdoors.',
    maskRecommended: false
  },
  moderate: {
    id: 'moderate',
    label: 'Moderate',
    min: 51,
    max: 100,
    color: '#0EA5E9', // sky-500
    bgColor: 'rgba(14, 165, 233, 0.15)',
    borderColor: '#0284C7',
    textColor: '#38BDF8',
    badgeClass: 'text-sky-400 bg-sky-950/60 border-sky-700/50',
    generalPublicAdvice: 'Normal outdoor activities can be carried out. Keep well hydrated.',
    vulnerableGroupsAdvice: 'Safe for outdoor activities. Individuals who are feeling unwell should rest indoors.',
    chronicPatientsAdvice: 'Individuals with heart or respiratory conditions should monitor their symptoms.',
    maskRecommended: false
  },
  unhealthy: {
    id: 'unhealthy',
    label: 'Unhealthy',
    min: 101,
    max: 200,
    color: '#F59E0B', // amber-500
    bgColor: 'rgba(245, 158, 11, 0.18)',
    borderColor: '#D97706',
    textColor: '#FBBF24',
    badgeClass: 'text-amber-400 bg-amber-950/60 border-amber-700/50',
    generalPublicAdvice: 'Reduce prolonged or strenuous outdoor exertion. Close windows if smoke odor is detected.',
    vulnerableGroupsAdvice: 'Minimise outdoor activities. Children and elderly should remain in air-conditioned environments.',
    chronicPatientsAdvice: 'Avoid outdoor activities. Have personal relief medication (e.g. asthma inhalers) immediately on hand.',
    maskRecommended: true
  },
  very_unhealthy: {
    id: 'very_unhealthy',
    label: 'Very Unhealthy',
    min: 201,
    max: 300,
    color: '#EF4444', // red-500
    bgColor: 'rgba(239, 68, 68, 0.22)',
    borderColor: '#DC2626',
    textColor: '#F87171',
    badgeClass: 'text-red-400 bg-red-950/60 border-red-700/50',
    generalPublicAdvice: 'Avoid prolonged or strenuous outdoor exertion. Run air purifiers with HEPA filters.',
    vulnerableGroupsAdvice: 'Avoid outdoor activities completely. Vulnerable individuals should stay in closed indoor spaces.',
    chronicPatientsAdvice: 'Avoid all outdoor exertion. Seek immediate medical attention if experiencing breathing distress.',
    maskRecommended: true
  },
  hazardous: {
    id: 'hazardous',
    label: 'Hazardous',
    min: 301,
    max: 500,
    color: '#8B5CF6', // purple-500
    bgColor: 'rgba(139, 92, 246, 0.25)',
    borderColor: '#7C3AED',
    textColor: '#A78BFA',
    badgeClass: 'text-purple-400 bg-purple-950/60 border-purple-700/50',
    generalPublicAdvice: 'Minimise or avoid all outdoor activities. Essential outdoor work requires certified N95 respirators.',
    vulnerableGroupsAdvice: 'Strictly remain indoors with air conditioning and air filtration. Avoid natural ventilation.',
    chronicPatientsAdvice: 'Stay strictly indoors in air-conditioned facilities. Medical consultation strongly recommended.',
    maskRecommended: true
  }
};

export const getPsiBand = (psi: number): AirQualityBand => {
  if (psi <= 50) return PSI_BANDS.good;
  if (psi <= 100) return PSI_BANDS.moderate;
  if (psi <= 200) return PSI_BANDS.unhealthy;
  if (psi <= 300) return PSI_BANDS.very_unhealthy;
  return PSI_BANDS.hazardous;
};

export const getPm25Band = (pm25: number): {
  id: 'normal' | 'elevated' | 'high' | 'very_high';
  label: string;
  color: string;
  advice: string;
} => {
  if (pm25 <= 55) {
    return {
      id: 'normal',
      label: 'Normal (0–55 µg/m³)',
      color: '#10B981',
      advice: 'Normal outdoor activities may be carried out by everyone.'
    };
  }
  if (pm25 <= 150) {
    return {
      id: 'elevated',
      label: 'Elevated (56–150 µg/m³)',
      color: '#F59E0B',
      advice: 'Healthy individuals: reduce strenuous exercise. Vulnerable groups: minimise outdoor exertion.'
    };
  }
  if (pm25 <= 250) {
    return {
      id: 'high',
      label: 'High (151–250 µg/m³)',
      color: '#EF4444',
      advice: 'Avoid strenuous outdoor activities. Wear N95 mask if outdoors for prolonged periods.'
    };
  }
  return {
    id: 'very_high',
    label: 'Very High (>250 µg/m³)',
    color: '#8B5CF6',
    advice: 'Avoid all outdoor activity. Keep doors and windows tightly shut with air purifiers active.'
  };
};

export const REGIONS_METADATA: Record<RegionId, RegionMetadata> = {
  north: {
    id: 'north',
    name: 'North Region',
    fullDisplayName: 'North (Woodlands, Yishun, Sembawang)',
    landmarks: ['Woodlands Waterfront', 'Yishun Dam', 'Sembawang Park', 'Kranji Marshes'],
    lat: 1.418,
    lng: 103.82,
    mapCoords: { x: 380, y: 110 }
  },
  south: {
    id: 'south',
    name: 'South Region',
    fullDisplayName: 'South (Marina Bay, Sentosa, Tanjong Pagar)',
    landmarks: ['Marina Bay Sands', 'Sentosa Island', 'Gardens by the Bay', 'Telok Blangah Hill'],
    lat: 1.295,
    lng: 103.82,
    mapCoords: { x: 395, y: 350 }
  },
  east: {
    id: 'east',
    name: 'East Region',
    fullDisplayName: 'East (Tampines, Bedok, Changi, Pasir Ris)',
    landmarks: ['East Coast Park', 'Changi Airport', 'Bedok Reservoir', 'Pasir Ris Coast'],
    lat: 1.357,
    lng: 103.94,
    mapCoords: { x: 555, y: 220 }
  },
  west: {
    id: 'west',
    name: 'West Region',
    fullDisplayName: 'West (Jurong, Tuas, Clementi, Bukit Batok)',
    landmarks: ['Jurong Lake Gardens', 'Tuas Mega Port', 'Bukit Batok Nature Park', 'Pandan Reservoir'],
    lat: 1.357,
    lng: 103.70,
    mapCoords: { x: 195, y: 225 }
  },
  central: {
    id: 'central',
    name: 'Central Region',
    fullDisplayName: 'Central (Bishan, Ang Mo Kio, Novena, Bukit Timah)',
    landmarks: ['MacRitchie Reservoir', 'Bishan-AMK Park', 'Bukit Timah Nature Reserve', 'Toa Payoh Central'],
    lat: 1.357,
    lng: 103.82,
    mapCoords: { x: 380, y: 230 }
  },
  national: {
    id: 'national',
    name: 'Singapore Islandwide',
    fullDisplayName: 'National Average (Singapore)',
    landmarks: ['Republic of Singapore', 'Changi to Tuas Corridor'],
    lat: 1.352,
    lng: 103.819,
    mapCoords: { x: 380, y: 230 }
  }
};

export const ACTIVITY_LOCATIONS: ActivityLocation[] = [
  {
    id: 'ecp',
    name: 'East Coast Park',
    zone: 'Coastal Park Connector',
    region: 'east',
    tags: ['Running', 'Cycling', 'Rollerblading', 'Barbecue'],
    suitability: 'great',
    recommendation: 'Ideal sea breeze with clear air.'
  },
  {
    id: 'macritchie',
    name: 'MacRitchie Reservoir',
    zone: 'Central Catchment Nature Reserve',
    region: 'central',
    tags: ['Trail Running', 'Hiking', 'TreeTop Walk', 'Kayaking'],
    suitability: 'great',
    recommendation: 'Canopy coverage filters light particulates.'
  },
  {
    id: 'marinabay',
    name: 'Marina Bay Waterfront & Promenade',
    zone: 'Downtown Core',
    region: 'south',
    tags: ['Strolling', 'Outdoor Dining', 'Sightseeing', 'Jogging'],
    suitability: 'great',
    recommendation: 'Clear urban visibility across the bay.'
  },
  {
    id: 'juronglake',
    name: 'Jurong Lake Gardens',
    zone: 'Lakeside Recreational District',
    region: 'west',
    tags: ['Family Walks', 'Open Grasslands', 'Playgrounds'],
    suitability: 'great',
    recommendation: 'Pleasant open green space.'
  },
  {
    id: 'sentosa',
    name: 'Sentosa Siloso & Palawan Beaches',
    zone: 'Southern Island Resort',
    region: 'south',
    tags: ['Swimming', 'Beach Volleyball', 'Outdoor Attractions'],
    suitability: 'great',
    recommendation: 'Brisk sea currents keeping air circulating.'
  },
  {
    id: 'punggol',
    name: 'Punggol Waterway & Coney Island',
    zone: 'North-East Coast',
    region: 'north',
    tags: ['Cycling', 'Bird Watching', 'Nature Photography'],
    suitability: 'great',
    recommendation: 'Fresh mangrove breeze and open waterways.'
  }
];

export const INITIAL_HOTSPOT_SURVEILLANCE: HotspotSurveillance = {
  sumatraHotspots: 18,
  kalimantanHotspots: 24,
  regionalRiskLevel: 'Low',
  windDirection: 'SSW (South-Southwest)',
  windAngleDegrees: 200,
  windSpeedKmH: 14,
  satelliteObservationTime: 'Today, 18:30 SGT (Himawari-9 & NOAA-20)',
  monsoonPeriod: 'Southwest Monsoon (Transitional season)'
};
