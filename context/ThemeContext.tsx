
import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColorScheme } from 'react-native';
import { lightColors, darkColors } from '../constants/Colors';

type Theme = 'light' | 'dark';
const THEME_KEY = 'user_theme';

interface ThemeContextType {
  theme: Theme;
  colors: typeof lightColors;
  toggleTheme: () => void;
  isLoading: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const systemTheme = useColorScheme() || 'light'; 
  const [theme, setTheme] = useState<Theme>(systemTheme);
  const [isLoading, setIsLoading] = useState(true);

 
  useEffect(() => {
    const loadTheme = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem(THEME_KEY) as Theme | null;
        if (savedTheme) {
          setTheme(savedTheme);
        } else {
          setTheme(systemTheme); 
        }
      } catch (e) {
        console.error("Erro ao carregar o tema:", e);
      } finally {
        setIsLoading(false);
      }
    };
    loadTheme();
  }, [systemTheme]);

  const toggleTheme = async () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    try {
      await AsyncStorage.setItem(THEME_KEY, newTheme);
    } catch (e) {
      console.error("Erro ao salvar o tema:", e);
    }
  };

  const colors = theme === 'light' ? lightColors : darkColors;

  if (isLoading) {
    return null;
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, colors, isLoading }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};