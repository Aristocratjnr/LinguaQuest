import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import RootPage from './pages/RootPage';
import { SettingsProvider } from './context/SettingsContext';
import { ActivityFeedProvider } from './components/ActivityFeedContext';
import { BrowserRouter } from 'react-router-dom';
import { UserProvider } from './context/UserContext';

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
  <React.StrictMode>
    <ActivityFeedProvider>
      <SettingsProvider>
        <UserProvider>
          <BrowserRouter>
            <RootPage />
          </BrowserRouter>
        </UserProvider>
      </SettingsProvider>
    </ActivityFeedProvider>
  </React.StrictMode>
);
