import React, { useState } from 'react';
import { useLeads } from '../context/LeadsContext';
import LeadModal from '../components/LeadModal';
import toast from 'react-hot-toast';

const STATUSES = ['New', 'Contacted', 'Qualified', 'Converted', 'Lost'];
const COL_COLORS = {
  New: '#1d9e75', Contacted: '#185fa5',
  Qualified: '#ba7517', Converted: '#3b6d11', Lost: '#a32d2d',
};

function Pipeline() {
  const { leads, updateStatus, deleteLead } = useLeads();
  const [showModal, setShowModal] = useState(false);
  const [editLead, setEditLead] = useState(null);

  const byStatus = Object.fromEntries(
    STATUSES.map(s => [s, leads.filter(l => l.status === s)])
  );

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete ${name}?`)) return;
    try { await deleteLead(id); }
    catch { toast.error('Failed to delete'); }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h1 style={{ fontSize: 20, fontWeight: 600 }}>Pipeline</h1>
        <button className="btn btn-primary" onClick={() => { setEditLead(null); setShowModal(true); }}>+ Add Lead</button>
      </div>

      <div style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 8 }}>
        {STATUSES.map(status => (
          <div key={status} style={{ minWidth: 220, flex: '0 0 220px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <span style={{ fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.4px', color: COL_COLORS[status] }}>
                {status}
              </span>
              <span style={{ background: 'var(--c-bg)', border: '0.5px solid var(--c-border)', borderRadius: 20, padding: '1px 8px', fontSize: 11, color: 'var(--c-muted)' }}>
                {byStatus[status].length}
              </span>
            </div>

            {byStatus[status].length === 0 ? (
              <div style={{ border: '1.5px dashed var(--c-border)', borderRadius: 8, padding: 20, textAlign: 'center', color: 'var(--c-muted)', fontSize: 12 }}>
                No leads
              </div>
            ) : (
              byStatus[status].map(lead => (
                <div key={lead._id} className="kanban-card">
                  <div style={{ fontWeight: 500, fontSize: 13, marginBottom: 3 }}>{lead.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--c-muted)', marginBottom: 2 }}>{lead.company}</div>
                  <div style={{ fontSize: 11, color: 'var(--c-muted)', marginBottom: 10 }}>{lead.email}</div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <select
                      style={{ padding: '3px 6px', border: '0.5px solid var(--c-border-md)', borderRadius: 6, fontSize: 11, background: 'var(--c-surface)', color: 'var(--c-text)', cursor: 'pointer', fontFamily: 'inherit' }}
                      value={lead.status}
                      onChange={e => updateStatus(lead._id, e.target.value)}
                    >
                      {STATUSES.map(s => <option key={s}>{s}</option>)}
                    </select>
                    <div style={{ display: 'flex', gap: 2 }}>
                      <button className="icon-btn" onClick={() => { setEditLead(lead); setShowModal(true); }} title={`Edit ${lead.name}`}>✎</button>
                      <button className="icon-btn" style={{ color: '#a32d2d' }} onClick={() => handleDelete(lead._id, lead.name)} title={`Delete ${lead.name}`}>🗑</button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        ))}
      </div>

      {showModal && (
        <LeadModal lead={editLead} onClose={() => { setShowModal(false); setEditLead(null); }} />
      )}
    </div>
  );
}

export default Pipeline;
