import { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark" | "calm-teal";
interface ThemeContextValue { theme: Theme; setTheme: (t: Theme) => void; }

const ThemeContext = createContext<ThemeContextValue | null>(null);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [theme, setTheme] = useState<Theme>(
    () => (localStorage.getItem("manobalam-theme") as Theme) || "light"
  );

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("dark", "theme-calm-teal");
    if (theme === "dark") root.classList.add("dark");
    if (theme === "calm-teal") root.classList.add("theme-calm-teal");
    localStorage.setItem("manobalam-theme", theme);
  }, [theme]);

  return <ThemeContext.Provider value={{ theme, setTheme }}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
};
