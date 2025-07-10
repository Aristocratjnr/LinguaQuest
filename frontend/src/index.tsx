import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { ActivityFeedProvider } from './components/ActivityFeedContext';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <ActivityFeedProvider>
      <App />
    </ActivityFeedProvider>
  </React.StrictMode>
); 