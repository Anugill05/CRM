import React, { useState } from 'react';
import { useLeads } from '../context/LeadsContext';
import LeadModal from '../components/LeadModal';
import { format } from 'date-fns';

const STATUSES = ['New', 'Contacted', 'Qualified', 'Converted', 'Lost'];
const STATUS_COLORS = {
  New: '#1d9e75', Contacted: '#185fa5',
  Qualified: '#ba7517', Converted: '#3b6d11', Lost: '#a32d2d',
};

function Dashboard({ onNavigate }) {
  const { stats, leads } = useLeads();
  const [showModal, setShowModal] = useState(false);

  if (!stats) return <div className="loading">Loading...</div>;

  const maxBar = Math.max(...STATUSES.map(s => stats.byStatus[s] || 0), 1);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h1 style={{ fontSize: 20, fontWeight: 600 }}>Overview</h1>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ Add Lead</button>
      </div>

      <div className="stats-grid" style={{ marginBottom: 20 }}>
        {[
          { label: 'Total Leads', value: stats.total, delta: 'All time' },
          { label: 'This Month', value: stats.thisMonth, delta: 'New leads' },
          { label: 'Converted', value: stats.byStatus.Converted, delta: `${stats.conversionRate}% rate` },
          { label: 'Revenue', value: `$${((stats.totalConvertedValue || 0) / 1000).toFixed(0)}k`, delta: 'Closed deals' },
        ].map(({ label, value, delta }) => (
          <div key={label} className="stat-card">
            <div className="stat-label">{label}</div>
            <div className="stat-val">{value}</div>
            <div className="stat-delta">{delta}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
        <div className="chart-area">
          <div className="chart-title">Pipeline by status</div>
          <div className="bar-chart">
            {STATUSES.map(s => (
              <div key={s} className="bar-wrap">
                <div className="bar-val">{stats.byStatus[s] || 0}</div>
                <div
                  className="bar"
                  style={{
                    height: Math.round(((stats.byStatus[s] || 0) / maxBar) * 100) + 'px',
                    background: STATUS_COLORS[s] + '30',
                    border: `1.5px solid ${STATUS_COLORS[s]}`,
                  }}
                />
                <div className="bar-label">{s}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="chart-area">
          <div className="chart-title">Recent leads</div>
          {(stats.recentLeads || []).map(lead => (
            <div key={lead._id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 0', borderBottom: '0.5px solid var(--c-border)' }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 500 }}>{lead.name}</div>
                <div style={{ fontSize: 11, color: 'var(--c-muted)' }}>{lead.company}</div>
              </div>
              <span className={`badge badge-${lead.status.toLowerCase()}`}>{lead.status}</span>
            </div>
          ))}
          <button className="btn btn-sm" style={{ marginTop: 12, width: '100%' }} onClick={() => onNavigate('leads')}>
            View all leads →
          </button>
        </div>
      </div>

      {showModal && <LeadModal onClose={() => setShowModal(false)} />}
    </div>
  );
}

export default Dashboard;
