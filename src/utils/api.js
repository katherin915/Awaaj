/**
 * Central API configuration
 * Uses REACT_APP_API_URL env variable in production,
 * falls back to localhost:5000 for local development.
 */
const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

export default API_BASE;
