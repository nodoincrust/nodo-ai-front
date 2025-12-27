export const config = {
  // Use a dedicated API base URL, NOT Vite's BASE_URL (which is just the frontend public path).
  // Define VITE_API_BASE_URL in your .env file, for example:
  // VITE_API_BASE_URL=http://localhost:5000
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || "http://localhost:5000",
};