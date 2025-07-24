import React, { useState, useMemo } from 'react';
import { ArrowUp, ArrowDown, Search } from 'lucide-react';

const severityColors = {
  low: 'bg-green-100 text-green-800',
  medium: 'bg-yellow-100 text-yellow-800',
  high: 'bg-orange-100 text-orange-800',
  critical: 'bg-red-100 text-red-800',
};

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  in_progress: 'bg-blue-100 text-blue-800',
  resolved: 'bg-green-100 text-green-800',
  closed: 'bg-gray-100 text-gray-800',
};

const ComplaintsTable = ({ complaints, onRowClick }) => {
  // Filters and sorting state
  const [filters, setFilters] = useState({
    severity: '',
    status: '',
    region: '',
    category: '',
    dateFrom: '',
    dateTo: '',
    search: '',
  });
  const [sortBy, setSortBy] = useState('date');
  const [sortDir, setSortDir] = useState('desc');

  // Unique values for filters
  const categories = useMemo(() => Array.from(new Set(complaints.map(c => c.category))).filter(Boolean), [complaints]);
  const regions = useMemo(() => Array.from(new Set(complaints.map(c => c.location?.zone))).filter(Boolean), [complaints]);

  // Filtering logic
  const filtered = useMemo(() => {
    return complaints.filter(c => {
      if (filters.severity && c.severity !== filters.severity) return false;
      if (filters.status && c.status !== filters.status) return false;
      if (filters.region && c.location?.zone !== filters.region) return false;
      if (filters.category && c.category !== filters.category) return false;
      if (filters.dateFrom && new Date(c.createdAt) < new Date(filters.dateFrom)) return false;
      if (filters.dateTo && new Date(c.createdAt) > new Date(filters.dateTo)) return false;
      if (filters.search) {
        const s = filters.search.toLowerCase();
        if (!(
          c._id?.toLowerCase().includes(s) ||
          c.title?.toLowerCase().includes(s) ||
          c.category?.toLowerCase().includes(s) ||
          c.location?.address?.toLowerCase().includes(s)
        )) return false;
      }
      return true;
    });
  }, [complaints, filters]);

  // Sorting logic
  const sorted = useMemo(() => {
    const arr = [...filtered];
    arr.sort((a, b) => {
      let vA, vB;
      switch (sortBy) {
        case 'date':
          vA = new Date(a.createdAt);
          vB = new Date(b.createdAt);
          break;
        case 'severity':
          const sevOrder = { low: 1, medium: 2, high: 3, critical: 4 };
          vA = sevOrder[a.severity] || 0;
          vB = sevOrder[b.severity] || 0;
          break;
        case 'status':
          vA = a.status;
          vB = b.status;
          break;
        case 'upvotes':
          vA = a.upvotes || 0;
          vB = b.upvotes || 0;
          break;
        default:
          vA = a[sortBy];
          vB = b[sortBy];
      }
      if (vA < vB) return sortDir === 'asc' ? -1 : 1;
      if (vA > vB) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
    return arr;
  }, [filtered, sortBy, sortDir]);

  // Table header with sorting
  const th = (label, key) => (
    <th
      className="px-3 py-2 text-left cursor-pointer select-none"
      onClick={() => {
        if (sortBy === key) setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
        else { setSortBy(key); setSortDir('asc'); }
      }}
    >
      <span className="flex items-center gap-1">
        {label}
        {sortBy === key && (sortDir === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />)}
      </span>
    </th>
  );

  return (
    <div className="bg-white rounded-lg shadow p-4">
      {/* Filters & Search */}
      <div className="flex flex-wrap gap-2 mb-4 items-end">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Search..."
            value={filters.search}
            onChange={e => setFilters(f => ({ ...f, search: e.target.value }))}
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        <select
          value={filters.severity}
          onChange={e => setFilters(f => ({ ...f, severity: e.target.value }))}
          className="px-2 py-2 border border-gray-300 rounded-md"
        >
          <option value="">All Severities</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="critical">Critical</option>
        </select>
        <select
          value={filters.status}
          onChange={e => setFilters(f => ({ ...f, status: e.target.value }))}
          className="px-2 py-2 border border-gray-300 rounded-md"
        >
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="in_progress">In Progress</option>
          <option value="resolved">Resolved</option>
          <option value="closed">Closed</option>
        </select>
        <select
          value={filters.region}
          onChange={e => setFilters(f => ({ ...f, region: e.target.value }))}
          className="px-2 py-2 border border-gray-300 rounded-md"
        >
          <option value="">All Regions</option>
          {regions.map(r => <option key={r} value={r}>{r}</option>)}
        </select>
        <select
          value={filters.category}
          onChange={e => setFilters(f => ({ ...f, category: e.target.value }))}
          className="px-2 py-2 border border-gray-300 rounded-md"
        >
          <option value="">All Categories</option>
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <input
          type="date"
          value={filters.dateFrom}
          onChange={e => setFilters(f => ({ ...f, dateFrom: e.target.value }))}
          className="px-2 py-2 border border-gray-300 rounded-md"
        />
        <input
          type="date"
          value={filters.dateTo}
          onChange={e => setFilters(f => ({ ...f, dateTo: e.target.value }))}
          className="px-2 py-2 border border-gray-300 rounded-md"
        />
      </div>
      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-gray-50">
              {th('ID', '_id')}
              {th('Title', 'title')}
              {th('Category', 'category')}
              {th('Severity', 'severity')}
              {th('Location', 'location')}
              {th('Date Submitted', 'date')}
              {th('Status', 'status')}
              {th('Upvotes', 'upvotes')}
            </tr>
          </thead>
          <tbody>
            {sorted.length === 0 && (
              <tr><td colSpan={8} className="text-center py-8 text-gray-400">No complaints found.</td></tr>
            )}
            {sorted.map(c => (
              <tr
                key={c._id}
                className="hover:bg-indigo-50 cursor-pointer"
                onClick={() => onRowClick?.(c)}
              >
                <td className="px-3 py-2 font-mono text-xs text-gray-500">{c._id?.slice(-6)}</td>
                <td className="px-3 py-2 font-medium text-gray-900">{c.title}</td>
                <td className="px-3 py-2 text-gray-700">{c.category}</td>
                <td className="px-3 py-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${severityColors[c.severity] || 'bg-gray-100 text-gray-800'}`}>{c.severity}</span>
                </td>
                <td className="px-3 py-2 text-gray-700">{c.location?.address || c.location?.zone || '-'}</td>
                <td className="px-3 py-2 text-gray-500">{c.createdAt ? new Date(c.createdAt).toLocaleDateString() : '-'}</td>
                <td className="px-3 py-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${statusColors[c.status] || 'bg-gray-100 text-gray-800'}`}>{c.status?.replace('_', ' ')}</span>
                </td>
                <td className="px-3 py-2 text-center">{c.upvotes || 0}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ComplaintsTable; 