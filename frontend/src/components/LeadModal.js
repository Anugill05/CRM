import React, { useState, useEffect } from 'react';
import { useLeads } from '../context/LeadsContext';
import toast from 'react-hot-toast';

const STATUSES = ['New', 'Contacted', 'Qualified', 'Converted', 'Lost'];
const SOURCES = ['Website', 'Referral', 'Social Media', 'Email', 'Cold Call', 'Other'];

const empty = {
  name: '', email: '', phone: '', company: '',
  status: 'New', source: 'Other', value: 0, notes: '',
};

function LeadModal({ lead, onClose }) {
  const { createLead, updateLead } = useLeads();
  const [form, setForm] = useState(lead ? { ...lead } : { ...empty });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const isEdit = Boolean(lead);

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Required';
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) e.email = 'Valid email required';
    if (!form.phone.trim()) e.phone = 'Required';
    if (!form.company.trim()) e.company = 'Required';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setSaving(true);
    try {
      if (isEdit) await updateLead(lead._id, form);
      else await createLead(form);
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong');
    } finally {
      setSaving(false);
    }
  };

  const set = (k, v) => {
    setForm(f => ({ ...f, [k]: v }));
    if (errors[k]) setErrors(e => ({ ...e, [k]: undefined }));
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h2 className="modal-title">{isEdit ? 'Edit Lead' : 'Add New Lead'}</h2>
          <button className="icon-btn" onClick={onClose} aria-label="Close">✕</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-grid">
              {[
                { key: 'name', label: 'Full Name', type: 'text', placeholder: 'Jane Smith' },
                { key: 'email', label: 'Email', type: 'email', placeholder: 'jane@company.com' },
                { key: 'phone', label: 'Phone', type: 'tel', placeholder: '+1-555-0100' },
                { key: 'company', label: 'Company', type: 'text', placeholder: 'Acme Corp' },
              ].map(({ key, label, type, placeholder }) => (
                <div className="form-group" key={key}>
                  <label className="form-label">{label} *</label>
                  <input
                    className={`form-input ${errors[key] ? 'error' : ''}`}
                    type={type}
                    placeholder={placeholder}
                    value={form[key]}
                    onChange={(e) => set(key, e.target.value)}
                  />
                  {errors[key] && <span className="err-msg">{errors[key]}</span>}
                </div>
              ))}
              <div className="form-group">
                <label className="form-label">Status</label>
                <select className="form-input" value={form.status} onChange={(e) => set('status', e.target.value)}>
                  {STATUSES.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Source</label>
                <select className="form-input" value={form.source} onChange={(e) => set('source', e.target.value)}>
                  {SOURCES.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Deal Value ($)</label>
                <input
                  className="form-input"
                  type="number"
                  min="0"
                  value={form.value}
                  onChange={(e) => set('value', parseFloat(e.target.value) || 0)}
                />
              </div>
              <div className="form-group full">
                <label className="form-label">Notes</label>
                <textarea
                  className="form-input"
                  rows={3}
                  value={form.notes}
                  onChange={(e) => set('notes', e.target.value)}
                  placeholder="Any additional notes..."
                />
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Lead'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default LeadModal;
