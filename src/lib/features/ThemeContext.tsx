// app/context/ThemeContext.tsx
"use client";
import React, { createContext, useContext, useEffect, useState } from "react";

type ThemeContextType = {
  darkMode: boolean;
  toggleDarkMode: () => void;
};

const ThemeContext = createContext<ThemeContextType>({
  darkMode: true,
  toggleDarkMode: () => {},
});

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [darkMode, setDarkMode] = useState(true);

  // Load from localStorage on first render
  useEffect(() => {
    const storedMode = localStorage.getItem("darkMode");
    setDarkMode(storedMode === "false" ? false : true);
  }, []);

  // Save to localStorage when darkMode changes
  useEffect(() => {
    localStorage.setItem("darkMode", darkMode.toString());
  }, [darkMode]);

  const toggleDarkMode = () => setDarkMode((prev) => !prev);

  return (
    <ThemeContext.Provider value={{ darkMode, toggleDarkMode }}>
      <div className={darkMode ? "dark" : ""}>
        {children}
      </div>
    </ThemeContext.Provider>
  );
};

// Custom hook for easier usage
export const useTheme = () => useContext(ThemeContext);
