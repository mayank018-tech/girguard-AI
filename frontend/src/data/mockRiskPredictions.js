// ⚠️ DEMO DATA — Synthetic risk predictions for development/demonstration only.

export const mockRiskPredictions = [
  { id: 'RISK-4001', village: 'Jamwala',   riskScore: 88, riskLevel: 'CRITICAL',  confidence: 91, reason: 'Recent verified sighting + proximity to movement corridor + historical conflict.', timestamp: '2024-01-15T23:00:00Z', factors: ['Recent sighting (2h)', 'Movement corridor overlap', 'Historical conflict: 15 incidents'] },
  { id: 'RISK-4002', village: 'Visavadar', riskScore: 82, riskLevel: 'CRITICAL',  confidence: 84, reason: 'Pride movement on forest road + dusk/night hours + prior livestock loss.', timestamp: '2024-01-15T23:00:00Z', factors: ['Pride movement detected', 'Night hours', 'Prior livestock loss: 3 events'] },
  { id: 'RISK-4003', village: 'Sasan Gir', riskScore: 72, riskLevel: 'HIGH',      confidence: 88, reason: 'Adult male territorial activity near village water source.', timestamp: '2024-01-15T23:00:00Z', factors: ['Territorial male', 'Water source proximity', 'Drought stress indicator'] },
  { id: 'RISK-4004', village: 'Talala',    riskScore: 63, riskLevel: 'HIGH',      confidence: 79, reason: 'Lioness with cubs — elevated maternal aggression probability.', timestamp: '2024-01-15T23:00:00Z', factors: ['Maternal presence', 'Cub protection behavior', 'Restricted movement zone'] },
  { id: 'RISK-4005', village: 'Maliya',    riskScore: 55, riskLevel: 'ELEVATED',  confidence: 72, reason: 'Leopard near livestock pen at dawn. Repeat-visit pattern.', timestamp: '2024-01-15T23:00:00Z', factors: ['Repeat sighting', 'Dawn activity', 'Livestock pen proximity'] },
  { id: 'RISK-4006', village: 'Mendarda',  riskScore: 48, riskLevel: 'ELEVATED',  confidence: 65, reason: 'Unverified citizen report. Seasonal movement pattern active.', timestamp: '2024-01-15T23:00:00Z', factors: ['Seasonal corridor', 'Unverified sighting'] },
  { id: 'RISK-4007', village: 'Kodinar',   riskScore: 41, riskLevel: 'ELEVATED',  confidence: 68, reason: 'Leopard in agricultural land. Night movement confirmed by camera trap.', timestamp: '2024-01-15T23:00:00Z', factors: ['Camera trap confirmed', 'Night movement', 'Agricultural zone'] },
  { id: 'RISK-4008', village: 'Khambha',   riskScore: 35, riskLevel: 'MODERATE',  confidence: 61, reason: 'Tracks found. Seasonal pattern suggests transiting animal.', timestamp: '2024-01-15T23:00:00Z', factors: ['Pug marks found', 'Seasonal transit route'] },
  { id: 'RISK-4009', village: 'Una',       riskScore: 28, riskLevel: 'MODERATE',  confidence: 55, reason: 'Historical data pattern. No recent sighting.', timestamp: '2024-01-15T23:00:00Z', factors: ['Historical baseline', 'Distance from forest core'] },
  { id: 'RISK-4010', village: 'Dhari',     riskScore: 18, riskLevel: 'LOW',       confidence: 45, reason: 'Buffer zone village. Low wildlife activity this season.', timestamp: '2024-01-15T23:00:00Z', factors: ['Buffer zone location', 'Low seasonal activity'] },
];

export const mockRiskForecast = [
  { hour: 'Now',   risk: 72 },
  { hour: '+1h',   risk: 75 },
  { hour: '+2h',   risk: 81 },
  { hour: '+3h',   risk: 85 },
  { hour: '+4h',   risk: 79 },
  { hour: '+5h',   risk: 68 },
  { hour: '+6h',   risk: 55 },
];
