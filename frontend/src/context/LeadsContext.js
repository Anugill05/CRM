import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { leadsAPI } from '../utils/api';

const LeadsContext = createContext(null);

export function LeadsProvider({ children }) {
  const [leads, setLeads] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ total: 0, page: 1, totalPages: 1 });

  // Query state
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit, sortBy, sortOrder };
      if (search) params.search = search;
      if (statusFilter !== 'All') params.status = statusFilter;

      const res = await leadsAPI.getAll(params);
      setLeads(res.data.data);
      setPagination(res.data.pagination);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to fetch leads');
    } finally {
      setLoading(false);
    }
  }, [page, limit, sortBy, sortOrder, search, statusFilter]);

  const fetchStats = useCallback(async () => {
    try {
      const res = await leadsAPI.getStats();
      setStats(res.data.data);
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  }, []);

  useEffect(() => { fetchLeads(); }, [fetchLeads]);
  useEffect(() => { fetchStats(); }, [fetchStats]);

  const createLead = async (data) => {
    const res = await leadsAPI.create(data);
    toast.success('Lead created successfully');
    fetchLeads();
    fetchStats();
    return res.data.data;
  };

  const updateLead = async (id, data) => {
    const res = await leadsAPI.update(id, data);
    toast.success('Lead updated');
    fetchLeads();
    fetchStats();
    return res.data.data;
  };

  const updateStatus = async (id, status) => {
    await leadsAPI.updateStatus(id, status);
    toast.success(`Status → ${status}`);
    fetchLeads();
    fetchStats();
  };

  const deleteLead = async (id) => {
    await leadsAPI.delete(id);
    toast.success('Lead deleted');
    fetchLeads();
    fetchStats();
  };

  const bulkDelete = async (ids) => {
    await leadsAPI.bulkDelete(ids);
    toast.success(`${ids.length} leads deleted`);
    fetchLeads();
    fetchStats();
  };

  const handleSort = (col) => {
    if (sortBy === col) setSortOrder(o => o === 'asc' ? 'desc' : 'asc');
    else { setSortBy(col); setSortOrder('desc'); }
    setPage(1);
  };

  return (
    <LeadsContext.Provider value={{
      leads, stats, loading, pagination,
      search, setSearch,
      statusFilter, setStatusFilter,
      sortBy, sortOrder, handleSort,
      page, setPage,
      createLead, updateLead, updateStatus, deleteLead, bulkDelete,
      refresh: fetchLeads,
    }}>
      {children}
    </LeadsContext.Provider>
  );
}

export const useLeads = () => useContext(LeadsContext);
