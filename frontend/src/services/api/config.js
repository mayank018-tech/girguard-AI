// Environment variable placeholder for future IBM Cloud backend URL.
// Replace with actual endpoint when backend is available.
// NEVER put secrets or API keys in this file.
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || null;
export const USE_MOCK = !API_BASE_URL;
