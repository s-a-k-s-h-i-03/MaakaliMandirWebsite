import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { clearStoredToken, getStoredToken, isTokenExpired, setStoredToken } from "../Utils/auth";

const AdminAuthContext = createContext(null);

export function AdminAuthProvider({ children }) {
  const [token, setToken] = useState(() => getStoredToken());

  useEffect(() => {
    function handleLogout() {
      setToken(null);
    }

    window.addEventListener("admin:logout", handleLogout);
    return () => window.removeEventListener("admin:logout", handleLogout);
  }, []);

  useEffect(() => {
    if (token && isTokenExpired(token)) {
      clearStoredToken();
      setToken(null);
      return undefined;
    }

    if (!token) {
      return undefined;
    }

    const intervalId = window.setInterval(() => {
      if (isTokenExpired(token)) {
        clearStoredToken();
        setToken(null);
      }
    }, 30000);

    return () => window.clearInterval(intervalId);
  }, [token]);

  const value = useMemo(() => ({
    token,
    isAuthenticated: Boolean(token),
    login(nextToken) {
      setStoredToken(nextToken);
      setToken(nextToken);
    },
    logout() {
      clearStoredToken();
      setToken(null);
    },
  }), [token]);

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>;
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);

  if (!context) {
    throw new Error("useAdminAuth must be used within AdminAuthProvider");
  }

  return context;
}
