import { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext({});

export const ThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(() => {
    // Persist preference in localStorage
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('crm-theme');
      if (stored) return stored === 'dark';
      // Default: system preference
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('crm-theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  const toggleTheme = () => setIsDark(prev => !prev);

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
