import React from 'react';
import { Navigate } from 'react-router-dom';

// Simple App component that redirects to the root page
// This maintains compatibility if anything still tries to import App
const App: React.FC = () => {
  return <Navigate to="/" replace />;
};

export default App;