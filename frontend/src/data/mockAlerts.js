// ⚠️ DEMO DATA — Synthetic alerts for development/demonstration only.

export const mockAlerts = [
  { id: 'ALT-2001', village: 'Jamwala',   animal: 'Asiatic Lion', riskScore: 88, riskLevel: 'CRITICAL',  confidence: 91, time: '2024-01-15T20:30:00Z', status: 'NEW',          reason: 'Recent verified sighting + proximity to movement corridor + historical conflict pattern.' },
  { id: 'ALT-2002', village: 'Visavadar', animal: 'Asiatic Lion', riskScore: 82, riskLevel: 'CRITICAL',  confidence: 84, time: '2024-01-15T21:10:00Z', status: 'IN_PROGRESS',  reason: 'Pride of 3 lions on forest-edge road + elevated activity period + low ambient light.' },
  { id: 'ALT-2003', village: 'Sasan Gir', animal: 'Asiatic Lion', riskScore: 72, riskLevel: 'HIGH',      confidence: 88, time: '2024-01-15T18:45:00Z', status: 'ACKNOWLEDGED', reason: 'Male lion near water source 400m from village boundary + dusk hours.' },
  { id: 'ALT-2004', village: 'Talala',    animal: 'Asiatic Lion', riskScore: 69, riskLevel: 'HIGH',      confidence: 79, time: '2024-01-15T06:15:00Z', status: 'RESOLVED',     reason: 'Lioness with cubs near nala. Cubs increase territorial aggression risk.' },
  { id: 'ALT-2005', village: 'Maliya',    animal: 'Leopard',      riskScore: 55, riskLevel: 'ELEVATED',  confidence: 72, time: '2024-01-15T05:20:00Z', status: 'ACKNOWLEDGED', reason: 'Leopard near cattle pen at dawn. Livestock predation risk elevated.' },
  { id: 'ALT-2006', village: 'Mendarda',  animal: 'Leopard',      riskScore: 48, riskLevel: 'ELEVATED',  confidence: 65, time: '2024-01-13T12:00:00Z', status: 'NEW',          reason: 'Unverified sighting near crop field. Awaiting confirmation.' },
  { id: 'ALT-2007', village: 'Kodinar',   animal: 'Leopard',      riskScore: 41, riskLevel: 'ELEVATED',  confidence: 68, time: '2024-01-14T03:40:00Z', status: 'RESOLVED',     reason: 'Leopard passing through agricultural land. Night movement pattern.' },
  { id: 'ALT-2008', village: 'Khambha',   animal: 'Asiatic Lion', riskScore: 35, riskLevel: 'MODERATE',  confidence: 61, time: '2024-01-14T08:00:00Z', status: 'RESOLVED',     reason: 'Tracks found near village periphery. Animal not directly sighted.' },
  { id: 'ALT-2009', village: 'Sasan Gir', animal: 'Hyena',        riskScore: 30, riskLevel: 'MODERATE',  confidence: 58, time: '2024-01-14T22:00:00Z', status: 'RESOLVED',     reason: 'Striped hyena near garbage dump. Low direct conflict risk.' },
  { id: 'ALT-2010', village: 'Dhari',     animal: 'Asiatic Lion', riskScore: 18, riskLevel: 'LOW',       confidence: 45, time: '2024-01-12T16:00:00Z', status: 'RESOLVED',     reason: 'Historical pattern flag only. No recent sighting.' },
];
