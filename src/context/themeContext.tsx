// context for app theme

import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useState } from 'react';
import log from '@/utils/log';

export type ThemeState = {
  theme: string;
  setTheme: React.Dispatch<React.SetStateAction<string>>;
  currentBgColor: string; // current background color
  currentTextColor: string; // current text color
  loadTheme: () => void;
  toggleTheme: () => void;
  themeColor: string;
};

export const Theme = createContext<ThemeState | null>(null);

const ThemeContext: React.FC<{
  children?: React.ReactNode | ((_state: ThemeState) => React.ReactNode);
}> = ({ children }) => {
  const [theme, setTheme] = useState('light');
  const currentBgColor = theme == 'light' ? '#fff' : '#111';
  const currentTextColor = theme == 'light' ? '#222' : '#fff';
  const themeColor = '#6236FF';
  async function loadTheme(): Promise<void> {
    try {
      const savedTheme = await AsyncStorage.getItem('theme');
      if (savedTheme) {
        setTheme(savedTheme);
      } else {
        setTheme('light');
      }
    } catch (error) {
      console.error('Error loading theme from AsyncStorage:', error);
    }
  }

  const toggleTheme = (): void => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    AsyncStorage.setItem('theme', newTheme).catch((error) => {
      console.error('Error saving theme to AsyncStorage:', error);
    });
  };

  // if you want to clear stuff from asyncstorage
  async function _clearItem(): Promise<void> {
    try {
      await AsyncStorage.removeItem('authToken');
      log.debug('removed');
    } catch {
      log.debug('error');
    }
  }

  const state = {
    theme,
    setTheme,
    currentBgColor, // current background color
    currentTextColor, // current text color
    loadTheme,
    toggleTheme,
    themeColor,
  };

  //   clearItem();
  return (
    <Theme.Provider value={state}>
      {children instanceof Function ? children(state) : children}
    </Theme.Provider>
  );
};

export const useTheme = (): ThemeState => {
  const theme = useContext(Theme);
  if (!theme) {
    throw new Error("ThemeContext isn't initialized");
  }

  return theme;
};

export default ThemeContext;
