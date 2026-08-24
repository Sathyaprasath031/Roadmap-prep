// API base URL configuration
// In development: uses Vite proxy (relative URLs)
// In production: uses VITE_API_URL environment variable
const API_BASE_URL = import.meta.env.VITE_API_URL || '';

export default API_BASE_URL;
