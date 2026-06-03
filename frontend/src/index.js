import React from 'react';
import ReactDOM from 'react-dom/client';
import './App.css';
import App from './App';
import { LeadsProvider } from './context/LeadsContext';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <LeadsProvider>
      <App />
    </LeadsProvider>
  </React.StrictMode>
);