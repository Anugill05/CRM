import React, { useState } from 'react';
import { Toaster } from 'react-hot-toast';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import Dashboard from './pages/Dashboard';
import Leads from './pages/Leads';
import Pipeline from './pages/Pipeline';
import './App.css';

function App() {
  const [page, setPage] = useState('dashboard');

  const renderPage = () => {
    switch (page) {
      case 'dashboard': return <Dashboard onNavigate={setPage} />;
      case 'leads': return <Leads />;
      case 'pipeline': return <Pipeline />;
      default: return <Dashboard onNavigate={setPage} />;
    }
  };

  return (
    <div className="app">
      <Sidebar activePage={page} onNavigate={setPage} />
      <div className="main">
        <Topbar page={page} />
        <div className="content">
          {renderPage()}
        </div>
      </div>
      <Toaster
        position="bottom-right"
        toastOptions={{
          duration: 3000,
          style: { fontSize: '13px', borderRadius: '8px' },
        }}
      />
    </div>
  );
}

export default App;
