// ⚠️ DEMO DATA — Synthetic livestock loss records for development/demonstration only.

export const mockLivestockLosses = [
  { id: 'LS-5001', village: 'Jamwala',   date: '2024-01-14', livestockType: 'Cow',   count: 2, species: 'Asiatic Lion', status: 'APPROVED',             description: 'Two cows killed near forest boundary at night.', compensation: 15000 },
  { id: 'LS-5002', village: 'Visavadar', date: '2024-01-13', livestockType: 'Goat',  count: 4, species: 'Leopard',      status: 'APPROVED',             description: 'Four goats taken from unfenced pen.', compensation: 8000 },
  { id: 'LS-5003', village: 'Maliya',    date: '2024-01-15', livestockType: 'Buffalo',count:1, species: 'Asiatic Lion', status: 'UNDER_REVIEW',         description: 'Buffalo found injured near water trough.', compensation: null },
  { id: 'LS-5004', village: 'Talala',    date: '2024-01-12', livestockType: 'Goat',  count: 3, species: 'Leopard',      status: 'VERIFICATION_REQUIRED', description: 'Goats missing. No direct evidence of wildlife attack.', compensation: null },
  { id: 'LS-5005', village: 'Sasan Gir', date: '2024-01-10', livestockType: 'Cow',   count: 1, species: 'Asiatic Lion', status: 'SUBMITTED',             description: 'Cow killed in open field adjacent to sanctuary.', compensation: null },
  { id: 'LS-5006', village: 'Kodinar',   date: '2024-01-09', livestockType: 'Sheep', count: 5, species: 'Leopard',      status: 'REJECTED',             description: 'No supporting evidence found during field verification.', compensation: 0 },
];
