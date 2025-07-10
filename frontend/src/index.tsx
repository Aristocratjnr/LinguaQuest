import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { SettingsProvider } from './context/SettingsContext';
import { ActivityFeedProvider } from './components/ActivityFeedContext';

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
  <React.StrictMode>
    <ActivityFeedProvider>
      <SettingsProvider>
        <App />
      </SettingsProvider>
    </ActivityFeedProvider>
  </React.StrictMode>
);