export function parseJwt(token) {
  if (!token) {
    return null;
  }

  try {
    const [, payload] = token.split(".");
    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    const decoded = JSON.parse(window.atob(normalized));
    return decoded;
  } catch {
    return null;
  }
}

export function isTokenExpired(token) {
  const payload = parseJwt(token);

  if (!payload?.exp) {
    return false;
  }

  return payload.exp * 1000 <= Date.now();
}

export function getStoredToken() {
  return window.localStorage.getItem("token");
}

export function setStoredToken(token) {
  window.localStorage.setItem("token", token);
}

export function clearStoredToken() {
  window.localStorage.removeItem("token");
}
