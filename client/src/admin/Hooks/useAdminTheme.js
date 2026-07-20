import { useEffect, useState } from "react";

const STORAGE_KEY = "admin-theme";

export function useAdminTheme() {
  const [theme, setTheme] = useState(() => window.localStorage.getItem(STORAGE_KEY) || "light");

  useEffect(() => {
    document.documentElement.dataset.adminTheme = theme;
    window.localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  return {
    theme,
    toggleTheme() {
      setTheme((current) => (current === "light" ? "dark" : "light"));
    },
  };
}
