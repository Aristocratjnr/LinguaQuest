import React, { createContext, useContext, useState, ReactNode } from 'react';
import avatar1 from '../assets/images/boy.png';
import avatar2 from '../assets/images/woman.png';
import avatar3 from '../assets/images/programmer.png';
import avatar4 from '../assets/images/avatar.png';

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
};

const defaultAvatar = AVATARS[0];

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider = ({ children }: { children: ReactNode }) => {
  const [nickname, setNickname] = useState(() => localStorage.getItem('lq_nickname') || 'Player');
  const [avatar, setAvatar] = useState(() => localStorage.getItem('lq_avatar') || defaultAvatar);
  const [language, setLanguage] = useState('twi');
  const [theme, setTheme] = useState('system');
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

  return (
    <SettingsContext.Provider value={{
      nickname,
      setNickname: handleSetNickname,
      avatar,
      setAvatar: handleSetAvatar,
      language,
      setLanguage,
      theme,
      setTheme,
      sound,
      setSound,
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