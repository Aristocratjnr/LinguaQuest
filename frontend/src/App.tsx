import React from 'react';
import { Navigate } from 'react-router-dom';
import { SettingsProvider } from './context/SettingsContext';

const App: React.FC = () => {
  return (
    <SettingsProvider>
      <Navigate to="/" replace />
    </SettingsProvider>
  );
};

export default App;