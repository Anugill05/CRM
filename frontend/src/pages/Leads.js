import React, { useState } from 'react';
import { useLeads } from '../context/LeadsContext';
import LeadModal from '../components/LeadModal';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const STATUSES = ['New', 'Contacted', 'Qualified', 'Converted', 'Lost'];

function Leads() {
  const {
    leads, loading, pagination,
    search, setSearch,
    statusFilter, setStatusFilter,
    sortBy, sortOrder, handleSort,
    page, setPage,
    updateStatus, deleteLead, bulkDelete,
  } = useLeads();

  const [showModal, setShowModal] = useState(false);
  const [editLead, setEditLead] = useState(null);
  const [selected, setSelected] = useState(new Set());

  const toggleSelect = (id) => {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleAll = (e) => {
    setSelected(e.target.checked ? new Set(leads.map(l => l._id)) : new Set());
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete ${name}? This cannot be undone.`)) return;
    try { await deleteLead(id); setSelected(p => { const n = new Set(p); n.delete(id); return n; }); }
    catch (err) { toast.error(err.response?.data?.message || 'Failed to delete'); }
  };

  const handleBulkDelete = async () => {
    if (!window.confirm(`Delete ${selected.size} leads?`)) return;
    try { await bulkDelete([...selected]); setSelected(new Set()); }
    catch (err) { toast.error('Failed to delete leads'); }
  };

  const sortArrow = (col) => sortBy === col ? (sortOrder === 'asc' ? ' ↑' : ' ↓') : '';

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h1 style={{ fontSize: 20, fontWeight: 600 }}>All Leads</h1>
        <button className="btn btn-primary" onClick={() => { setEditLead(null); setShowModal(true); }}>+ Add Lead</button>
      </div>

      <div className="search-bar" style={{ marginBottom: 12 }}>
        <div className="search-wrap" style={{ flex: 1 }}>
          <input
            className="search-input"
            placeholder="Search by name, email, company, phone…"
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
        <select className="filter" value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}>
          <option value="All">All Status</option>
          {STATUSES.map(s => <option key={s}>{s}</option>)}
        </select>
      </div>

      {selected.size > 0 && (
        <div className="bulk-bar" style={{ marginBottom: 12 }}>
          <span className="bulk-info">{selected.size} selected</span>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-sm" onClick={() => setSelected(new Set())}>Clear</button>
            <button className="btn btn-sm btn-danger" onClick={handleBulkDelete}>Delete selected</button>
          </div>
        </div>
      )}

      <div className="table-wrap">
        {loading ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--c-muted)' }}>Loading…</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th style={{ width: 32 }}>
                  <input type="checkbox" onChange={toggleAll} checked={selected.size === leads.length && leads.length > 0} />
                </th>
                <th onClick={() => handleSort('name')} style={{ cursor: 'pointer' }}>Name{sortArrow('name')}</th>
                <th onClick={() => handleSort('company')} style={{ cursor: 'pointer' }}>Company{sortArrow('company')}</th>
                <th>Status</th>
                <th onClick={() => handleSort('source')} style={{ cursor: 'pointer' }}>Source{sortArrow('source')}</th>
                <th onClick={() => handleSort('createdAt')} style={{ cursor: 'pointer' }}>Created{sortArrow('createdAt')}</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {leads.length === 0 ? (
                <tr><td colSpan={7} style={{ textAlign: 'center', padding: 40, color: 'var(--c-muted)' }}>No leads found</td></tr>
              ) : leads.map(lead => (
                <tr key={lead._id}>
                  <td><input type="checkbox" checked={selected.has(lead._id)} onChange={() => toggleSelect(lead._id)} /></td>
                  <td>
                    <div style={{ fontWeight: 500 }}>{lead.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--c-muted)' }}>{lead.email}</div>
                  </td>
                  <td>{lead.company}</td>
                  <td>
                    <select
                      className="status-select"
                      value={lead.status}
                      onChange={e => updateStatus(lead._id, e.target.value)}
                    >
                      {STATUSES.map(s => <option key={s}>{s}</option>)}
                    </select>
                  </td>
                  <td style={{ fontSize: 12, color: 'var(--c-muted)' }}>{lead.source}</td>
                  <td style={{ fontSize: 12, color: 'var(--c-muted)' }}>
                    {format(new Date(lead.createdAt), 'MMM d, yyyy')}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 4 }}>
                      <button className="icon-btn" onClick={() => { setEditLead(lead); setShowModal(true); }} title="Edit">✎</button>
                      <button className="icon-btn" style={{ color: '#a32d2d' }} onClick={() => handleDelete(lead._id, lead.name)} title="Delete">🗑</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <div className="pagination">
          <span className="page-info">
            {pagination.total > 0
              ? `Showing ${(pagination.page - 1) * 10 + 1}–${Math.min(pagination.page * 10, pagination.total)} of ${pagination.total}`
              : '0 results'}
          </span>
          <div className="page-btns">
            <button className="page-btn" onClick={() => setPage(p => p - 1)} disabled={!pagination.hasPrev}>‹</button>
            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
              .filter(p => p >= pagination.page - 2 && p <= pagination.page + 2)
              .map(p => (
                <button key={p} className={`page-btn ${pagination.page === p ? 'active' : ''}`} onClick={() => setPage(p)}>{p}</button>
              ))}
            <button className="page-btn" onClick={() => setPage(p => p + 1)} disabled={!pagination.hasNext}>›</button>
          </div>
        </div>
      </div>

      {showModal && (
        <LeadModal lead={editLead} onClose={() => { setShowModal(false); setEditLead(null); }} />
      )}
    </div>
  );
}

export default Leads;
