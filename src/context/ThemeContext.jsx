import React, { createContext, useState, useContext, useEffect } from 'react';

const ThemeContext = createContext();

export const THEMES = ['light', 'dark', 'system', 'brand-dark', 'fintech'];

const getInitialTheme = () => {
  if (typeof window === 'undefined') {
    return 'light';
  }

  const storedTheme = localStorage.getItem('theme');
  return THEMES.includes(storedTheme) ? storedTheme : 'light';
};

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(getInitialTheme);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    // Bootstrap only supports light | dark; system is light brand, brand-dark is dark brand
    document.documentElement.setAttribute(
      'data-bs-theme',
      theme === 'dark' || theme === 'brand-dark' ? 'dark' : 'light'
    );
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prevTheme) => {
      const currentIndex = THEMES.indexOf(prevTheme);
      const nextIndex = currentIndex === -1 ? 0 : (currentIndex + 1) % THEMES.length;
      return THEMES[nextIndex];
    });
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme, themes: THEMES }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }

  return context;
};
