// ⚠️ DEMO DATA — Synthetic hotspot analytics for development/demonstration only.

export const mockHotspots = [
  { id: 'HS-001', name: 'Jamwala-Forest Edge',    lat: 21.183, lng: 70.813, incidentCount: 15, species: 'Asiatic Lion', severity: 'CRITICAL', radius: 2.4 },
  { id: 'HS-002', name: 'Visavadar Road Corridor', lat: 21.002, lng: 70.733, incidentCount: 12, species: 'Asiatic Lion', severity: 'CRITICAL', radius: 3.1 },
  { id: 'HS-003', name: 'Sasan Water Zone',        lat: 21.122, lng: 70.604, incidentCount: 8,  species: 'Mixed',        severity: 'HIGH',     radius: 1.8 },
  { id: 'HS-004', name: 'Talala Nala Crossing',    lat: 20.943, lng: 70.467, incidentCount: 7,  species: 'Asiatic Lion', severity: 'HIGH',     radius: 1.5 },
  { id: 'HS-005', name: 'Maliya Livestock Belt',   lat: 21.093, lng: 70.553, incidentCount: 6,  species: 'Leopard',      severity: 'ELEVATED', radius: 1.2 },
  { id: 'HS-006', name: 'Kodinar Agricultural',    lat: 20.793, lng: 70.703, incidentCount: 5,  species: 'Leopard',      severity: 'ELEVATED', radius: 1.0 },
];

export const mockIncidentsByVillage = [
  { village: 'Jamwala',   count: 15 },
  { village: 'Visavadar', count: 12 },
  { village: 'Sasan Gir', count: 8  },
  { village: 'Talala',    count: 7  },
  { village: 'Maliya',    count: 6  },
  { village: 'Kodinar',   count: 5  },
  { village: 'Mendarda',  count: 3  },
  { village: 'Khambha',   count: 2  },
  { village: 'Una',       count: 2  },
  { village: 'Dhari',     count: 1  },
];

export const mockIncidentsBySpecies = [
  { name: 'Asiatic Lion', value: 38 },
  { name: 'Leopard',      value: 18 },
  { name: 'Hyena',        value: 4  },
  { name: 'Other',        value: 2  },
];

export const mockIncidentsByHour = [
  { hour: '00-02', count: 8  },
  { hour: '02-04', count: 11 },
  { hour: '04-06', count: 9  },
  { hour: '06-08', count: 5  },
  { hour: '08-10', count: 2  },
  { hour: '10-12', count: 1  },
  { hour: '12-14', count: 1  },
  { hour: '14-16', count: 2  },
  { hour: '16-18', count: 4  },
  { hour: '18-20', count: 12 },
  { hour: '20-22', count: 15 },
  { hour: '22-24', count: 10 },
];

export const mockMonthlyTrends = [
  { month: 'Aug', incidents: 18, livestock: 7  },
  { month: 'Sep', incidents: 24, livestock: 10 },
  { month: 'Oct', incidents: 31, livestock: 14 },
  { month: 'Nov', incidents: 28, livestock: 12 },
  { month: 'Dec', incidents: 35, livestock: 16 },
  { month: 'Jan', incidents: 42, livestock: 19 },
];

export const mockResponseTimes = [
  { village: 'Sasan Gir', avgMinutes: 18 },
  { village: 'Jamwala',   avgMinutes: 34 },
  { village: 'Visavadar', avgMinutes: 27 },
  { village: 'Talala',    avgMinutes: 22 },
  { village: 'Maliya',    avgMinutes: 25 },
  { village: 'Kodinar',   avgMinutes: 41 },
  { village: 'Mendarda',  avgMinutes: 38 },
];
