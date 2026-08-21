/**
 * GirGuard AI â€” Service Abstraction Layer
 *
 * STATE: Connected to Flask REST API when VITE_API_BASE_URL is set.
 *       Falls back to mock data when no backend URL is configured.
 *
 * Pattern:
 *   React UI â†’ apiService.getAlerts() â†’ Flask API / mock fallback
 *
 * SECURITY: Never import IBM API keys here. All credentials stay server-side.
 */

import {
  mockVillages,
  mockSightings,
  mockAlerts,
  mockIncidents,
  mockRiskPredictions,
  mockResponseTeams,
  mockHotspots,
  mockTouristZones,
  mockLivestockLosses,
} from '../../data/index.js';
import { API_BASE_URL, USE_MOCK } from './config.js';

// Simulate realistic async delay for mock calls
const delay = (ms = 300) => new Promise(res => setTimeout(res, ms));

let sightingCounter = 1010;
let lossCounter = 5010;

// â”€â”€ HTTP helper â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

async function apiFetch(path, options = {}) {
  const url = `${API_BASE_URL}${path}`;
  
  // Get token from localStorage
  const token = localStorage.getItem('token');
  const authHeaders = token ? { 'Authorization': 'Bearer ' + token } : {};

  const res = await fetch(url, {
    headers: { 
      'Content-Type': 'application/json', 
      ...authHeaders,
      ...options.headers 
    },
    ...options,
  });
  const json = await res.json();
  if (!json.success) {
    throw new Error(json.error?.message || 'API error');
  }
  return json;
}

// â”€â”€ Villages â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export async function getVillages() {
  if (USE_MOCK) {
    await delay();
    return { data: mockVillages, source: 'mock' };
  }
  const json = await apiFetch('/villages?per_page=50');
  return { data: json.data, source: 'api' };
}

// â”€â”€ Wildlife Sightings â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export async function getSightings() {
  if (USE_MOCK) {
    await delay();
    return { data: mockSightings, source: 'mock' };
  }
  const json = await apiFetch('/sightings?per_page=50');
  return { data: json.data, source: 'api' };
}

export async function submitSighting(formData) {
  if (USE_MOCK) {
    await delay(600);
    const id = `SIGHT-${++sightingCounter}`;
    return { success: true, id, status: 'Pending Verification', source: 'mock' };
  }
  const payload = {
    species: formData.species,
    date: formData.date,
    time: formData.time,
    village: formData.village,
    source: formData.source?.toUpperCase().replace(' ', '_') || 'CITIZEN',
    description: formData.description,
  };
  const json = await apiFetch('/sightings', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return {
    success: json.success,
    id: json.data.id,
    status: json.data.status,
    source: 'api',
  };
}

// â”€â”€ Alerts â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export async function getAlerts() {
  if (USE_MOCK) {
    await delay();
    return { data: mockAlerts, source: 'mock' };
  }
  const json = await apiFetch('/alerts?per_page=50');
  return { data: json.data, source: 'api' };
}

// â”€â”€ Risk Predictions â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export async function getRiskPredictions() {
  if (USE_MOCK) {
    await delay();
    return { data: mockRiskPredictions, source: 'mock' };
  }
  const json = await apiFetch('/risk?per_page=50');
  return { data: json.data, source: 'api' };
}

export async function predictRisk(villageId, species = null) {
  if (USE_MOCK) {
    await delay(400);
    const mock = mockRiskPredictions.find(r => r.village === villageId) || mockRiskPredictions[0];
    return { data: mock, source: 'mock' };
  }
  const payload = { village_id: villageId };
  if (species) payload.species = species;
  const json = await apiFetch('/risk/predict', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return { data: json.data, source: 'api' };
}

// â”€â”€ Incidents â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export async function getIncidents() {
  if (USE_MOCK) {
    await delay();
    return { data: mockIncidents, source: 'mock' };
  }
  const json = await apiFetch('/incidents?per_page=50');
  return { data: json.data, source: 'api' };
}

// â”€â”€ Response Teams â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export async function getResponseTeams() {
  if (USE_MOCK) {
    await delay();
    return { data: mockResponseTeams, source: 'mock' };
  }
  const json = await apiFetch('/response-teams?per_page=50');
  return { data: json.data, source: 'api' };
}

// â”€â”€ Hotspots â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Hotspots are derived/analytics data â€” served from mock in both modes
// (no dedicated backend endpoint required; computed by ML in Task 3)

export async function getHotspots() {
  await delay();
  return { data: mockHotspots, source: 'mock' };
}

// â”€â”€ Tourist Zones â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Tourist zones are static config data â€” served from mock in both modes

export async function getTouristZones() {
  await delay();
  return { data: mockTouristZones, source: 'mock' };
}

// â”€â”€ Livestock Losses â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export async function getLivestockLosses() {
  if (USE_MOCK) {
    await delay();
    return { data: mockLivestockLosses, source: 'mock' };
  }
  const json = await apiFetch('/livestock-loss?per_page=50');
  return { data: json.data, source: 'api' };
}

export async function submitLivestockLoss(formData) {
  if (USE_MOCK) {
    await delay(600);
    const id = `LS-${++lossCounter}`;
    return { success: true, id, status: 'SUBMITTED', source: 'mock' };
  }
  const payload = {
    village: formData.village,
    livestock_type: formData.livestockType,
    count: parseInt(formData.count, 10),
    date: formData.date,
    description: formData.description,
    species: formData.species || undefined,
  };
  const json = await apiFetch('/livestock-loss', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return {
    success: json.success,
    id: json.data.id,
    status: json.data.status,
    source: 'api',
  };
}

