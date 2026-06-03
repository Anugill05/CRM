import React from 'react';

const PAGE_TITLES = {
  dashboard: 'Dashboard',
  leads: 'All Leads',
  pipeline: 'Pipeline',
};

function Topbar({ page }) {
  return (
    <div className="topbar">
      <div className="topbar-title">{PAGE_TITLES[page] || 'LeadCRM'}</div>
    </div>
  );
}

export default Topbar;