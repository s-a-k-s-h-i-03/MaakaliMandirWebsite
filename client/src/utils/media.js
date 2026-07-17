import { apiBaseUrl } from "../content";

const backendBaseUrl = apiBaseUrl || "http://localhost:5000";

export function resolveMediaUrl(path) {
  if (!path) {
    return "";
  }

  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  if (path.startsWith("/uploads/")) {
    return `${backendBaseUrl}${path}`;
  }

  if (path.startsWith("/assets/")) {
    return path;
  }

  return path;
}

if (import.meta.env.DEV) {
  console.assert(
    resolveMediaUrl("/uploads/example.jpg") === `${backendBaseUrl}/uploads/example.jpg`,
    "ponytail: uploaded media should resolve against the backend origin; if this fails, check VITE_API_BASE_URL.",
  );
}
