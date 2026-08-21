// Environment variable placeholder for future IBM Cloud backend URL.
// Replace with actual endpoint when backend is available.
// NEVER put secrets or API keys in this file.
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';
export const USE_MOCK = false; // Mocks are disabled, full integration enabled
