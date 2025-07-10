import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import 'bootstrap/dist/css/bootstrap.min.css';
// Make sure this import comes before your app's custom CSS
import { ActivityFeedProvider } from './components/ActivityFeedContext';

// For React 18
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

// If you need to support older React versions, use this instead:
/*
ReactDOM.render(
  <React.StrictMode>
    <ActivityFeedProvider>
      <App />
    </ActivityFeedProvider>
  </React.StrictMode>,
  document.getElementById('root') as HTMLElement
);
*/