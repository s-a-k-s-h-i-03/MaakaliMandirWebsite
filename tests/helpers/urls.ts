import { requireEnv } from "./env";

export const frontendBaseUrl = requireEnv("PLAYWRIGHT_BASE_URL", "http://127.0.0.1:5173");
export const backendBaseUrl = requireEnv("PLAYWRIGHT_API_URL", "http://127.0.0.1:5000");

