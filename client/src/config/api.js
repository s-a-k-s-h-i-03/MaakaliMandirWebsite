const rawApiBaseUrl = import.meta.env.VITE_API_BASE_URL;

if (import.meta.env.PROD && !rawApiBaseUrl) {
  throw new Error("Missing required VITE_API_BASE_URL for production build.");
}

export const apiBaseUrl = (rawApiBaseUrl || "").replace(/\/$/, "");
