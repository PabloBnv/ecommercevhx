import React, { createContext, useContext, useState, useEffect } from 'react';

export const themes = {
  minimal: {
    id: 'minimal',
    name: 'Minimal',
    description: 'Blanco / Negro',
    colors: {
      bg: '#ffffff',
      bgSecondary: '#f8f9fa',
      text: '#0a0a0a',
      textSecondary: '#6b7280',
      accent: '#6366f1',
      accentHover: '#4f46e5',
      border: '#e5e7eb',
      card: '#ffffff',
      button: '#0a0a0a',
      buttonText: '#ffffff',
    },
    fonts: {
      display: 'Inter, system-ui, sans-serif',
      body: 'Inter, system-ui, sans-serif',
    },
  },
  urbanDark: {
    id: 'urbanDark',
    name: 'Urban Dark',
    description: 'Negro / Neón',
    colors: {
      bg: '#0a0a0a',
      bgSecondary: '#1a1a1a',
      text: '#ffffff',
      textSecondary: '#9ca3af',
      accent: '#22d3ee',
      accentHover: '#06b6d4',
      border: '#374151',
      card: '#171717',
      button: '#22d3ee',
      buttonText: '#0a0a0a',
    },
    fonts: {
      display: 'Space Grotesk, system-ui, sans-serif',
      body: 'Inter, system-ui, sans-serif',
    },
  },
  vintage: {
    id: 'vintage',
    name: 'Vintage',
    description: 'Sepia / Crema',
    colors: {
      bg: '#faf6e9',
      bgSecondary: '#f0e8d8',
      text: '#5c3d1e',
      textSecondary: '#8b7355',
      accent: '#d4a017',
      accentHover: '#b8860b',
      border: '#d4c4b0',
      card: '#fffff0',
      button: '#704214',
      buttonText: '#ffffff',
    },
    fonts: {
      display: 'Playfair Display, Georgia, serif',
      body: 'Lora, Georgia, serif',
    },
  },
  sport: {
    id: 'sport',
    name: 'Sport',
    description: 'Verde / Naranja',
    colors: {
      bg: '#ffffff',
      bgSecondary: '#f8f9fa',
      text: '#1a1a1a',
      textSecondary: '#6b7280',
      accent: '#00a86b',
      accentHover: '#007a50',
      border: '#e5e7eb',
      card: '#ffffff',
      button: '#ff6b35',
      buttonText: '#ffffff',
    },
    fonts: {
      display: 'Bebas Neue, Oswald, sans-serif',
      body: 'Roboto, system-ui, sans-serif',
    },
  },
  premium: {
    id: 'premium',
    name: 'Premium',
    description: 'Negro / Dorado',
    colors: {
      bg: '#0d0d0d',
      bgSecondary: '#1a1a1a',
      text: '#faf8f5',
      textSecondary: '#a3a3a3',
      accent: '#d4af37',
      accentHover: '#b8962f',
      border: '#333333',
      card: '#141414',
      button: '#d4af37',
      buttonText: '#0d0d0d',
    },
    fonts: {
      display: 'Cinzel, Trajan Pro, serif',
      body: 'Montserrat, Proxima Nova, sans-serif',
    },
  },
};

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved && themes[saved] ? saved : 'minimal';
  });

  useEffect(() => {
    localStorage.setItem('theme', currentTheme);
    document.documentElement.setAttribute('data-theme', currentTheme);
    
    const theme = themes[currentTheme];
    const root = document.documentElement;
    
    root.style.setProperty('--theme-bg', theme.colors.bg);
    root.style.setProperty('--theme-bg-secondary', theme.colors.bgSecondary);
    root.style.setProperty('--theme-text', theme.colors.text);
    root.style.setProperty('--theme-text-secondary', theme.colors.textSecondary);
    root.style.setProperty('--theme-accent', theme.colors.accent);
    root.style.setProperty('--theme-accent-hover', theme.colors.accentHover);
    root.style.setProperty('--theme-border', theme.colors.border);
    root.style.setProperty('--theme-card', theme.colors.card);
    root.style.setProperty('--theme-button', theme.colors.button);
    root.style.setProperty('--theme-button-text', theme.colors.buttonText);
    root.style.setProperty('--theme-font-display', theme.fonts.display);
    root.style.setProperty('--theme-font-body', theme.fonts.body);
  }, [currentTheme]);

  const changeTheme = (themeId) => {
    if (themes[themeId]) {
      setCurrentTheme(themeId);
    }
  };

  const theme = themes[currentTheme];

  return (
    <ThemeContext.Provider value={{ theme, themes, changeTheme, currentTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);