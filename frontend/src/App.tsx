import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { SettingsProvider } from './context/SettingsContext';
import { UserProvider } from './context/UserContext';
import RootPage from './pages/RootPage';
import './App.css';

const App: React.FC = () => {
  return (
    <SettingsProvider>
      <UserProvider>
        <Router>
          <RootPage />
        </Router>
      </UserProvider>
    </SettingsProvider>
  );
};

export default App;