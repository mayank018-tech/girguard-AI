// ⚠️ DEMO DATA — Synthetic tourist zone data for development/demonstration only.

export const mockTouristZones = [
  { id: 'TZ-001', name: 'Sasan Gir Core Zone', status: 'OPEN',       safetyScore: 72, activity: 'MODERATE', permits: true,  maxVisitors: 50,  description: 'Main wildlife sanctuary core area. Safari available with registered guides only.' },
  { id: 'TZ-002', name: 'Devaliya Safari Park', status: 'OPEN',      safetyScore: 85, activity: 'LOW',      permits: true,  maxVisitors: 100, description: 'Fenced safari park. High safety. Excellent lion sighting probability.' },
  { id: 'TZ-003', name: 'Kankai Mata Area',     status: 'CAUTION',   safetyScore: 58, activity: 'HIGH',     permits: true,  maxVisitors: 20,  description: 'Religious site with wildlife activity. Extra caution advised after sunset.' },
  { id: 'TZ-004', name: 'Girnar Forest Trail',  status: 'RESTRICTED', safetyScore: 35, activity: 'HIGH',    permits: false, maxVisitors: 0,   description: 'Trail temporarily restricted due to elevated leopard activity. Check back in 48h.' },
  { id: 'TZ-005', name: 'Tulsi Shyam Hot Spring', status: 'OPEN',    safetyScore: 78, activity: 'LOW',      permits: false, maxVisitors: 200, description: 'Religious/nature site. Daylight hours safe. Avoid after sunset.' },
  { id: 'TZ-006', name: 'Somnath Coastal Zone', status: 'OPEN',      safetyScore: 92, activity: 'MINIMAL',  permits: false, maxVisitors: 500, description: 'Coastal area, minimal large wildlife activity.' },
];

export const mockWeather = {
  temperature: 28,
  condition: 'Partly Cloudy',
  humidity: 65,
  windSpeed: 12,
  visibility: 'Good',
  sunrise: '07:12',
  sunset: '18:45',
  moonPhase: 'Waning Gibbous',
  advisory: 'Clear conditions. Wildlife activity typically peaks post-sunset. Plan safari accordingly.',
};

export const mockSafetyGuidelines = [
  'Always use registered safari vehicles and licensed guides inside the sanctuary.',
  'Never exit vehicles inside the core zone — strict forest department rule.',
  'Maintain complete silence when lions are nearby.',
  'Do not carry food items with strong odours near wildlife zones.',
  'Carry the Forest Department emergency number: 1926.',
  'Follow permitted route maps strictly. Do not deviate into unmarked trails.',
  'Avoid visiting edge villages after sunset during elevated alert periods.',
  'Children under 6 are not recommended for core-zone safaris.',
  'Photography flash is prohibited — use only silent, non-flash modes.',
  'In case of vehicle breakdown in core zone, call the control room immediately.',
];

export const mockOfficialWarnings = [
  { id: 'WARN-001', level: 'HIGH',    message: 'Elevated lion activity near Jamwala sector. Tourists advised to avoid this area until further notice.', issued: '2024-01-15T22:00:00Z' },
  { id: 'WARN-002', level: 'CAUTION', message: 'Girnar Forest Trail temporarily restricted. Leopard sightings confirmed. Check with forest office before visiting.', issued: '2024-01-15T14:00:00Z' },
  { id: 'WARN-003', level: 'INFO',    message: 'Devaliya Safari Park operating normally. Morning and evening slots available.', issued: '2024-01-15T08:00:00Z' },
];
