import React, { createContext, useContext, useState, ReactNode } from 'react';
import avatar1 from '../assets/images/boy.jpg';
import avatar2 from '../assets/images/woman.jpg';
import avatar3 from '../assets/images/programmer.jpg';
import avatar4 from '../assets/images/avatar.jpg';

const AVATARS = [avatar1, avatar2, avatar3, avatar4];

type SettingsContextType = {
  nickname: string;
  setNickname: (n: string) => void;
  avatar: string;
  setAvatar: (a: string) => void;
  language: string;
  setLanguage: (l: string) => void;
  theme: string;
  setTheme: (t: string) => void;
  sound: boolean;
  setSound: (s: boolean) => void;
  resolvedTheme: 'light' | 'dark';
};

const defaultAvatar = AVATARS[0];

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider = ({ children }: { children: ReactNode }) => {
  const [nickname, setNickname] = useState(() => localStorage.getItem('lq_nickname') || 'Player');
  const [avatar, setAvatar] = useState(() => localStorage.getItem('lq_avatar') || defaultAvatar);
  const [language, setLanguageState] = useState(() => localStorage.getItem('lq_language') || 'twi');
  const [theme, setThemeState] = useState(() => localStorage.getItem('lq_theme') || 'system');
  // Track resolved theme (light/dark) for system mode
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light');

  // Helper to get system theme
  const getSystemTheme = () =>
    window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';

  // Apply theme to <html> and <body> for compatibility with CSS
  const applyTheme = (t: string) => {
    let finalTheme = t === 'system' ? getSystemTheme() : t;
    setResolvedTheme(finalTheme as 'light' | 'dark');
    document.documentElement.classList.remove('theme-light', 'theme-dark');
    document.documentElement.classList.add(`theme-${finalTheme}`);
    // Also set body class for legacy and CSS compatibility
    document.body.classList.remove('dark', 'light');
    document.body.classList.add(finalTheme);
    if (finalTheme === 'dark') {
      document.body.classList.add('dark');
      document.body.classList.remove('light');
    } else {
      document.body.classList.add('light');
      document.body.classList.remove('dark');
    }
  };

  // On mount and when theme changes, apply theme
  React.useEffect(() => {
    applyTheme(theme);
    // Listen for system theme changes if 'system' is selected
    if (theme === 'system') {
      const mql = window.matchMedia('(prefers-color-scheme: dark)');
      const listener = () => applyTheme('system');
      mql.addEventListener('change', listener);
      return () => mql.removeEventListener('change', listener);
    }
  }, [theme]);
  const [sound, setSound] = useState(true);

  // Persist nickname and avatar
  const handleSetNickname = (n: string) => {
    setNickname(n);
    localStorage.setItem('lq_nickname', n);
  };
  const handleSetAvatar = (a: string) => {
    setAvatar(a);
    localStorage.setItem('lq_avatar', a);
  };
  // Persist theme
  const handleSetTheme = (t: string) => {
    setThemeState(t);
    localStorage.setItem('lq_theme', t);
    applyTheme(t);
  };
  // Persist language
  const handleSetLanguage = (l: string) => {
    setLanguageState(l);
    localStorage.setItem('lq_language', l);
  };

  return (
    <SettingsContext.Provider value={{
      nickname,
      setNickname: handleSetNickname,
      avatar,
      setAvatar: handleSetAvatar,
      language,
      setLanguage: handleSetLanguage,
      theme,
      setTheme: handleSetTheme,
      sound,
      setSound,
      // Optionally expose resolvedTheme for components that want to know actual mode
      resolvedTheme,
    }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used within a SettingsProvider');
  return ctx;
}; 