import React, { createContext, useContext, useState, useEffect } from 'react';

import { audioEngine } from '../lib/audio';

type Theme = 'color' | 'noir';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem('app-theme-mode');
    return (saved as Theme) || 'color';
  });

  useEffect(() => {
    localStorage.setItem('app-theme-mode', theme);
    if (theme === 'noir') {
      document.documentElement.classList.add('theme-noir');
    } else {
      document.documentElement.classList.remove('theme-noir');
    }
  }, [theme]);

  const toggleTheme = () => {
    audioEngine.init();
    audioEngine.playSwitch();
    setTheme(t => t === 'color' ? 'noir' : 'color');
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
