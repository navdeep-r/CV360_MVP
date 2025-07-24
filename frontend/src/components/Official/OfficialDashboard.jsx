import React, { useEffect, useState } from 'react';
import OfficialLayout from './OfficialLayout';
import ComplaintsTable from './ComplaintsTable';
import { useComplaintsContext } from '../../context/ComplaintsContext';
import { fetchDashboardTrends } from '../../utils/api';
import { saveAs } from 'file-saver';
import { Camera, FileText, X } from 'lucide-react';
import HeatmapVisualization from './HeatmapVisualization';
import MapHeatmap from './MapHeatmap';

const OfficialDashboard = ({ user, region, onLogout }) => {
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const { complaints, loading, stats } = useComplaintsContext();
  const [trends, setTrends] = useState([]);
  const [trendsLoading, setTrendsLoading] = useState(false);
  const [trendsError, setTrendsError] = useState(null);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [modalComplaint, setModalComplaint] = useState(null);
  const [updateLoading, setUpdateLoading] = useState(false);
  const { updateComplaintProgress } = useComplaintsContext();

  // --- Move all hooks to top level ---
  // Insights tab state
  const [trendCategory, setTrendCategory] = useState('all');
  const [selectedZone, setSelectedZone] = useState(null);
  // Notifications tab state
  const [notifications, setNotifications] = useState([]);
  const [notifLoading, setNotifLoading] = useState(false);
  const [notifError, setNotifError] = useState(null);
  const [notifDetail, setNotifDetail] = useState(null);
  const [notifDetailModal, setNotifDetailModal] = useState(false);

  // Notifications fetch logic
  const fetchNotifications = async () => {
    setNotifLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/notifications', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setNotifications(await res.json());
        setNotifError(null);
      } else {
        setNotifError('Failed to fetch notifications');
      }
    } catch (err) {
      setNotifError('Error fetching notifications');
    } finally {
      setNotifLoading(false);
    }
  };
  useEffect(() => { if (currentTab === 'notifications') fetchNotifications(); }, [currentTab]);
  const markAsRead = async (id) => {
    const token = localStorage.getItem('token');
    await fetch(`http://localhost:5000/api/notifications/${id}/read`, {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    fetchNotifications();
  };
  const markAllAsRead = async () => {
    const token = localStorage.getItem('token');
    await fetch('http://localhost:5000/api/notifications/read-all', {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    fetchNotifications();
  };
  const handleNotifClick = (notif) => {
    if (!notif.read) markAsRead(notif._id);
    if (notif.relatedComplaint) {
      setNotifDetail(notif);
      setNotifDetailModal(true);
    }
  };

  useEffect(() => {
    const fetchTrends = async () => {
      setTrendsLoading(true);
      try {
        const token = localStorage.getItem('token');
        const data = await fetchDashboardTrends(token);
        setTrends(data);
        setTrendsError(null);
      } catch (err) {
        setTrendsError('Failed to load trends');
      } finally {
        setTrendsLoading(false);
      }
    };
    if (currentTab === 'dashboard') fetchTrends();
  }, [currentTab]);

  // Recent activity: last 5 timeline entries from all complaints
  const recentActivities = complaints
    .flatMap(c => (c.timeline || []).map(t => ({ ...t, complaint: c })))
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    .slice(0, 5);

  // Stats cards UI
  const StatsCards = () => (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      <div className="bg-white rounded-lg shadow p-4 flex flex-col items-center">
        <span className="text-2xl font-bold text-indigo-600">{stats.active}</span>
        <span className="text-gray-600">Active Complaints</span>
      </div>
      <div className="bg-white rounded-lg shadow p-4 flex flex-col items-center">
        <span className="text-2xl font-bold text-green-600">{stats.resolvedToday}</span>
        <span className="text-gray-600">Resolved Today</span>
      </div>
      <div className="bg-white rounded-lg shadow p-4 flex flex-col items-center">
        <span className="text-2xl font-bold text-yellow-600">{stats.overdueYellow}</span>
        <span className="text-gray-600">Overdue (4-7d)</span>
      </div>
      <div className="bg-white rounded-lg shadow p-4 flex flex-col items-center">
        <span className="text-2xl font-bold text-red-600">{stats.overdueRed}</span>
        <span className="text-gray-600">Overdue (&gt;7d)</span>
      </div>
    </div>
  );

  // Trends chart UI (simple bar chart)
  const TrendsChart = ({ trends }) => {
    if (trendsLoading) return <div>Loading trends...</div>;
    if (trendsError) return <div className="text-red-500">{trendsError}</div>;
    if (!trends || trends.length === 0) return <div>No trend data available.</div>;
    return (
      <div className="bg-white rounded-lg shadow p-4 mb-8">
        <div className="font-bold mb-2">Complaints Over Last 30 Days</div>
        <div className="overflow-x-auto">
          <div className="flex items-end h-32 space-x-1">
            {trends.map((t, idx) => (
              <div key={idx} className="flex flex-col items-center" style={{ width: 12 }}>
                <div
                  className="bg-indigo-400"
                  style={{ height: `${Math.max(4, t.count * 8)}px`, width: '10px', borderRadius: '4px' }}
                  title={`${t._id.date}: ${t.count}`}
                ></div>
                <span className="text-[10px] text-gray-400 mt-1 rotate-45" style={{ writingMode: 'vertical-lr' }}>{t._id.date.slice(5)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // Recent activity feed UI
  const RecentActivityFeed = () => (
    <div className="bg-white rounded-lg shadow p-4 mb-8">
      <div className="font-bold mb-2">Recent Activity</div>
      <ul>
        {recentActivities.length === 0 && <li className="text-gray-400">No recent activity.</li>}
        {recentActivities.map((a, idx) => (
          <li key={idx} className="mb-2 text-sm text-gray-700">
            <span className="font-semibold text-indigo-600">{a.complaint.title}</span>: {a.action}
            {a.comment && <span className="text-gray-500"> – {a.comment}</span>}
            <span className="text-gray-400 ml-2">({new Date(a.timestamp).toLocaleString()})</span>
          </li>
        ))}
      </ul>
    </div>
  );

  // Helper: Export complaints as CSV
  const exportCSV = () => {
    if (!complaints.length) return;
    const headers = Object.keys(complaints[0]).filter(k => k !== '__v');
    const rows = [headers.join(',')];
    complaints.forEach(c => {
      rows.push(headers.map(h => JSON.stringify(c[h] ?? '')).join(','));
    });
    const blob = new Blob([rows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, 'complaints.csv');
  };

  // Helper: Calculate breakdowns
  const categoryCounts = {};
  const severityCounts = {};
  const statusCounts = {};
  let resolvedCount = 0;
  let totalResolutionTime = 0;
  let resolvedWithTime = 0;
  complaints.forEach(c => {
    categoryCounts[c.category] = (categoryCounts[c.category] || 0) + 1;
    severityCounts[c.severity] = (severityCounts[c.severity] || 0) + 1;
    statusCounts[c.status] = (statusCounts[c.status] || 0) + 1;
    if (c.status === 'resolved' && c.createdAt && c.updatedAt) {
      resolvedCount++;
      totalResolutionTime += (new Date(c.updatedAt) - new Date(c.createdAt));
      resolvedWithTime++;
    }
  });
  const resolutionRate = complaints.length ? ((resolvedCount / complaints.length) * 100).toFixed(1) : '0.0';
  const avgResolutionDays = resolvedWithTime ? (totalResolutionTime / resolvedWithTime / (1000*60*60*24)).toFixed(1) : '0.0';

  // Helper: Custom date range for trends
  const [dateRange, setDateRange] = useState({ from: '', to: '' });
  const filteredTrends = trends.filter(t => {
    const d = t._id.date;
    if (dateRange.from && d < dateRange.from) return false;
    if (dateRange.to && d > dateRange.to) return false;
    return true;
  });

  // Bar chart component
  const BarChart = ({ data, label, color }) => {
    const max = Math.max(...Object.values(data), 1);
    return (
      <div className="mb-4">
        <div className="font-bold mb-1">{label}</div>
        <div className="flex items-end gap-2 h-24">
          {Object.entries(data).map(([k, v]) => (
            <div key={k} className="flex flex-col items-center" style={{ width: 32 }}>
              <div
                className={color}
                style={{ height: `${Math.max(8, (v / max) * 80)}px`, width: '20px', borderRadius: '4px' }}
                title={`${k}: ${v}`}
              ></div>
              <span className="text-xs text-gray-600 mt-1">{k}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Circular progress ring component
  const ProgressRing = ({ progress = 0, size = 64, stroke = 8, color = '#6366f1', bg = '#e5e7eb', onClick }) => {
    const radius = (size - stroke) / 2;
    const circ = 2 * Math.PI * radius;
    const offset = circ - (progress / 100) * circ;
    return (
      <svg width={size} height={size} onClick={onClick} className="cursor-pointer">
        <circle cx={size/2} cy={size/2} r={radius} stroke={bg} strokeWidth={stroke} fill="none" />
        <circle cx={size/2} cy={size/2} r={radius} stroke={color} strokeWidth={stroke} fill="none" strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round" />
        <text x="50%" y="50%" textAnchor="middle" dy="0.35em" fontSize={size/4} fill="#222">{progress}%</text>
      </svg>
    );
  };

  // Complaint update modal
  const UpdateProgressModal = ({ complaint, onClose, onSubmit, loading }) => {
    const [progress, setProgress] = useState(complaint.progress || 0);
    const [notes, setNotes] = useState('');
    const [files, setFiles] = useState([]);
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const isResolved = progress >= 100;
    // Timeline: show all updates, submission, assignment, and proof
    const timeline = complaint.timeline || [];
    const proofFiles = complaint.proofFiles || [];
    const resolutionMedia = complaint.resolutionMedia || [];
    const allProof = [...proofFiles, ...resolutionMedia];
    // Handle file upload
    const handleFileUpload = (e) => {
      const newFiles = Array.from(e.target.files);
      setFiles([...files, ...newFiles]);
    };
    // Remove file
    const removeFile = (idx) => setFiles(files.filter((_, i) => i !== idx));
    // Submit handler: close modal after update
    const handleSubmit = async () => {
      setError('');
      if (isResolved && files.length === 0 && allProof.length === 0) {
        setError('Proof of resolution is required to mark as resolved.');
        return;
      }
      setSubmitting(true);
      await onSubmit(progress, notes, files);
      setSubmitting(false);
      // onClose(); // REMOVE this line so parent controls closing
    };
    // Format date
    const fmt = (d) => new Date(d).toLocaleString();
    // Severity color
    const sevColor = {
      low: 'text-green-600',
      medium: 'text-yellow-600',
      high: 'text-orange-600',
      critical: 'text-red-600',
    }[complaint.severity] || 'text-gray-600';
    return (
      <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl shadow-2xl p-6 max-w-2xl w-full relative">
          <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-xl" onClick={onClose}>×</button>
          <div className="mb-2 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
            <div>
              <div className="font-bold text-lg text-indigo-700">{complaint.title}</div>
              <div className="text-xs text-gray-500">{complaint.location?.address}</div>
              <div className="flex gap-2 mt-1">
                <span className={`px-2 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700`}>{complaint.category}</span>
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${sevColor}`}>{complaint.severity}</span>
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${complaint.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : complaint.status === 'in_progress' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>{complaint.status.replace('_', ' ')}</span>
              </div>
            </div>
            <div className="flex flex-col items-end">
              <div className="text-xs text-gray-400">Assigned: {complaint.createdAt ? fmt(complaint.createdAt) : '-'}</div>
              <div className="text-xs text-gray-400">Last Updated: {complaint.updatedAt ? fmt(complaint.updatedAt) : '-'}</div>
            </div>
          </div>
          <div className="my-4">
            <label className="block text-sm font-medium mb-1">Progress: <span className="font-bold text-indigo-700">{progress}%</span></label>
            <input type="range" min={0} max={100} value={progress} onChange={e => setProgress(Number(e.target.value))} className="w-full" />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Notes</label>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} className="w-full border rounded px-2 py-1" rows={2} placeholder="E.g. Work started, half complete, etc." />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Upload Progress Proof (images/videos/docs)</label>
            <input type="file" multiple onChange={handleFileUpload} className="w-full" />
            <div className="flex flex-wrap gap-2 mt-2">
              {files.map((file, idx) => (
                <div key={idx} className="bg-gray-100 px-2 py-1 rounded flex items-center gap-1 text-xs">
                  {file.name}
                  <button onClick={() => removeFile(idx)} className="text-red-500 ml-1">×</button>
                </div>
              ))}
            </div>
          </div>
          {error && <div className="text-red-600 text-sm mb-2">{error}</div>}
          <button onClick={handleSubmit} disabled={submitting} className="w-full py-2 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 disabled:opacity-50 mt-2">
            {submitting ? 'Updating...' : 'Submit Update'}
          </button>
          <div className="mt-6">
            <div className="font-bold text-gray-700 mb-2 text-lg">Timeline</div>
            <ol className="border-l-4 border-indigo-300 pl-6 space-y-4 max-h-64 overflow-y-auto bg-indigo-50 rounded-lg py-4">
              {timeline.map((t, idx) => (
                <li key={idx} className="relative pb-2">
                  <div className="absolute -left-4 top-2 w-3 h-3 rounded-full bg-indigo-500 border-2 border-white"></div>
                  <div className="text-base text-gray-800 font-semibold">{t.action}</div>
                  <div className="text-sm text-gray-600 mb-1">{t.comment}</div>
                  <div className="text-xs text-gray-400 mb-1">{fmt(t.timestamp)}</div>
                  {t.files && t.files.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-1">
                      {t.files.map((f, i) => <span key={i} className="bg-gray-200 px-2 py-1 rounded text-xs">{f}</span>)}
                    </div>
                  )}
                </li>
              ))}
              {isResolved && (
                <li className="relative pb-2">
                  <div className="absolute -left-4 top-2 w-3 h-3 rounded-full bg-green-500 border-2 border-white"></div>
                  <div className="text-base text-green-700 font-semibold">Resolved</div>
                  <div className="text-xs text-gray-400 mb-1">{fmt(new Date())}</div>
                  {files.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-1">
                      {files.map((f, i) => <span key={i} className="bg-green-200 px-2 py-1 rounded text-xs">{f.name}</span>)}
                    </div>
                  )}
                </li>
              )}
            </ol>
          </div>
          {allProof.length > 0 && (
            <div className="mt-4">
              <div className="font-bold text-gray-700 mb-2">Proof Files</div>
              <div className="flex flex-wrap gap-2">
                {allProof.map((file, idx) => (
                  <a key={idx} href={`/${file.path}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center px-2 py-1 bg-gray-100 rounded text-xs text-indigo-700 hover:underline">
                    📎 {file.originalName || file.filename}
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  // --- Insights tab computed variables ---
  const regionCounts = {};
  complaints.forEach(c => {
    const region = c.location?.zone || c.location?.address?.split(',')[1]?.trim() || 'Unknown';
    regionCounts[region] = (regionCounts[region] || 0) + 1;
  });
  const sortedCategories = Object.entries(categoryCounts).sort((a,b) => b[1]-a[1]);
  const now = new Date();
  const bottlenecks = complaints.filter(c => {
    if (c.status === 'resolved') return false;
    const created = new Date(c.createdAt);
    const daysOpen = Math.ceil((now - created) / (1000*60*60*24));
    const noProgress = (!c.progress || c.progress === 0);
    return daysOpen >= 7 || noProgress;
  });
  const filteredTrendsForInsights = trendCategory === 'all' ? trends : trends.filter(t => t.category === trendCategory);
  const aiSuggestions = complaints.filter(c => c.aiSuggestions && c.aiSuggestions.category);

  // Stubs for each section
  const renderTabContent = () => {
    const handleOpenUpdate = (complaint) => {
      setModalComplaint(complaint);
      setShowUpdateModal(true);
    };
    const handleCloseUpdate = () => {
      setShowUpdateModal(false);
      setModalComplaint(null);
    };
    const handleSubmitUpdate = async (progress, notes, files) => {
      if (!modalComplaint) return;
      setUpdateLoading(true);
      try {
        await updateComplaintProgress(modalComplaint._id, progress, notes, files);
        handleCloseUpdate();
      } finally {
        setUpdateLoading(false);
      }
    };

    // Split complaints
    const liveComplaints = complaints.filter(c => c.status !== 'resolved' && c.status !== 'closed');
    const resolvedComplaints = complaints.filter(c => c.status === 'resolved');

    switch (currentTab) {
      case 'dashboard':
        return (
          <div>
            <StatsCards />
            <div className="flex flex-wrap gap-4 mb-8">
              <div className="flex-1 min-w-[200px]"><BarChart data={categoryCounts} label="By Category" color="bg-blue-400" /></div>
              <div className="flex-1 min-w-[200px]"><BarChart data={severityCounts} label="By Severity" color="bg-yellow-400" /></div>
              <div className="flex-1 min-w-[200px]"><BarChart data={statusCounts} label="By Status" color="bg-green-400" /></div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-white rounded-lg shadow p-4 flex flex-col items-center">
                <span className="text-2xl font-bold text-indigo-600">{resolutionRate}%</span>
                <span className="text-gray-600">Resolution Rate</span>
              </div>
              <div className="bg-white rounded-lg shadow p-4 flex flex-col items-center">
                <span className="text-2xl font-bold text-green-600">{avgResolutionDays}</span>
                <span className="text-gray-600">Avg. Resolution Days</span>
              </div>
              <div className="col-span-2 flex items-center justify-end">
                <button onClick={exportCSV} className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700">Export CSV</button>
              </div>
            </div>
            <div className="flex gap-4 items-center mb-4">
              <label className="text-sm">From: <input type="date" value={dateRange.from} onChange={e => setDateRange(r => ({ ...r, from: e.target.value }))} className="border rounded px-2 py-1 ml-1" /></label>
              <label className="text-sm">To: <input type="date" value={dateRange.to} onChange={e => setDateRange(r => ({ ...r, to: e.target.value }))} className="border rounded px-2 py-1 ml-1" /></label>
            </div>
            <TrendsChart trends={filteredTrends} />
            <RecentActivityFeed />
            <div className="mb-8">
              <h2 className="text-lg font-bold mb-2">Resolved Complaints</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {resolvedComplaints.length === 0 && <div className="text-gray-400">No resolved complaints.</div>}
                {resolvedComplaints.map(c => (
                  <div key={c._id} className="bg-white rounded-lg shadow p-4 flex flex-col items-center">
                    <div className="mb-2">
                      <ProgressRing progress={100} color="#22c55e" />
                    </div>
                    <div className="font-semibold text-green-700 mb-1">{c.title}</div>
                    <div className="text-sm text-gray-500 mb-1">{c.category} | {c.severity}</div>
                    <div className="text-xs text-gray-400">{c.location?.address}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      case 'live':
        return (
          <div>
            <h2 className="text-xl font-bold mb-4 text-indigo-700">Live Complaints</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {liveComplaints.length === 0 && <div className="text-gray-400">No active complaints.</div>}
              {liveComplaints.map(c => {
                const severityColors = {
                  low: 'border-green-300',
                  medium: 'border-yellow-300',
                  high: 'border-orange-400',
                  critical: 'border-red-500',
                };
                const escalationBadge = c.escalationStatus?.level === 'yellow' ? (
                  <span className="ml-2 px-2 py-1 bg-yellow-200 text-yellow-800 rounded-full text-xs font-bold animate-pulse">Escalation</span>
                ) : c.escalationStatus?.level === 'red' ? (
                  <span className="ml-2 px-2 py-1 bg-red-200 text-red-800 rounded-full text-xs font-bold animate-pulse">Escalation</span>
                ) : null;
                return (
                  <div
                    key={c._id}
                    className={`bg-white rounded-2xl shadow-lg p-6 flex flex-col items-center border-4 transition-all duration-200 hover:shadow-2xl hover:scale-[1.03] cursor-pointer ${severityColors[c.severity] || 'border-gray-200'}`}
                    style={{ minHeight: 340, minWidth: 340, maxWidth: 420 }}
                    onClick={() => handleOpenUpdate(c)}
                  >
                    <div className="mb-4 relative">
                      <ProgressRing progress={c.progress || 0} size={110} stroke={12} color="#6366f1" />
                      {escalationBadge && <div className="absolute top-0 right-0">{escalationBadge}</div>}
                    </div>
                    <div className="w-full flex flex-col items-center gap-1 mb-2">
                      <div className="text-lg font-bold text-indigo-800 text-center">{c.title}</div>
                      <div className="flex gap-2 text-xs mb-1">
                        <span className="px-2 py-1 rounded-full bg-gray-100 text-gray-700 font-medium">{c.category}</span>
                        <span className={`px-2 py-1 rounded-full font-medium ${severityColors[c.severity] || 'bg-gray-100 text-gray-700'}`}>{c.severity}</span>
                        <span className={`px-2 py-1 rounded-full ${c.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : c.status === 'in_progress' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}`}>{c.status.replace('_', ' ')}</span>
                      </div>
                      <div className="text-sm text-gray-500 text-center mb-1">{c.location?.address}</div>
                    </div>
                    <div className="w-full text-gray-600 text-sm line-clamp-3 text-center mb-2">{c.description}</div>
                    <div className="mt-auto flex gap-2 w-full justify-center">
                      <button className="px-4 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-semibold pointer-events-none">Update Progress</button>
                    </div>
                  </div>
                );
              })}
            </div>
            {showUpdateModal && modalComplaint && (
              <UpdateProgressModal
                complaint={modalComplaint}
                onClose={handleCloseUpdate}
                onSubmit={handleSubmitUpdate}
                loading={updateLoading}
              />
            )}
          </div>
        );
      case 'complaints':
        return (
          <>
            <ComplaintsTable
              complaints={complaints}
              onRowClick={setSelectedComplaint}
            />
            {/* Complaint Detail Modal stub */}
            {selectedComplaint && (
              <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg shadow-lg p-8 max-w-xl w-full relative">
                  <button
                    className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-xl"
                    onClick={() => setSelectedComplaint(null)}
                  >
                    &times;
                  </button>
                  <div className="text-lg font-bold mb-2">Complaint Details (Coming Soon)</div>
                  <pre className="text-xs bg-gray-50 rounded p-2 overflow-x-auto max-h-96">{JSON.stringify(selectedComplaint, null, 2)}</pre>
                </div>
              </div>
            )}
          </>
        );
      case 'insights':
        // Use trendCategory, setTrendCategory from top-level state
        // Use filteredTrendsForInsights from top-level state
        const filteredComplaints = selectedZone ? complaints.filter(c => c.location?.zone === selectedZone) : complaints;
        const categoryCountsByZone = {};
        filteredComplaints.forEach(c => {
          const zone = c.location?.zone || 'Unknown Zone';
          categoryCountsByZone[zone] = (categoryCountsByZone[zone] || 0) + 1;
        });
        const sortedCategoriesByZone = Object.entries(categoryCountsByZone).sort((a,b) => b[1]-a[1]);

        return (
          <div>
            <div className="mb-8">
              <h2 className="text-lg font-bold mb-2">Complaints Heatmap by Zone</h2>
              <MapHeatmap complaints={filteredComplaints} />
            </div>
            <div className="mb-8">
              <h2 className="text-lg font-bold mb-2">Complaints by Region (Heatmap)</h2>
              {Object.keys(regionCounts).length === 0 ? (
                <div className="text-gray-400">No location data available for heatmap.</div>
              ) : (
                <BarChart data={regionCounts} label="Complaints by Region" color="bg-pink-400" />
              )}
            </div>
            <div className="mb-8">
              <h2 className="text-lg font-bold mb-2">Top Complaint Categories</h2>
              <BarChart data={Object.fromEntries(sortedCategories.slice(0,5))} label="Top Categories" color="bg-blue-400" />
            </div>
            <div className="mb-8">
              <h2 className="text-lg font-bold mb-2">Bottlenecks (Overdue or No Progress &ge; 7 days)</h2>
              {bottlenecks.length === 0 ? <div className="text-gray-400">No bottlenecks detected.</div> : (
                <ul className="space-y-2">
                  {bottlenecks.map(c => (
                    <li key={c._id} className="bg-yellow-50 border-l-4 border-yellow-400 p-2 rounded">
                      <span className="font-semibold text-yellow-700">{c.title}</span> - {c.category} | {c.severity} | {c.location?.address}
                      <span className="ml-2 text-xs text-gray-500">Opened {Math.ceil((now - new Date(c.createdAt))/(1000*60*60*24))} days ago</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="mb-8">
              <h2 className="text-lg font-bold mb-2">Trends by Category</h2>
              <div className="mb-2">
                <label className="text-sm">Category: </label>
                <select value={trendCategory} onChange={e => setTrendCategory(e.target.value)} className="border rounded px-2 py-1 ml-1">
                  <option value="all">All</option>
                  {Object.keys(categoryCounts).map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </div>
              <TrendsChart trends={filteredTrendsForInsights} />
            </div>
            {aiSuggestions.length > 0 && (
              <div className="mb-8">
                <h2 className="text-lg font-bold mb-2">AI Suggestions</h2>
                <ul className="space-y-2">
                  {aiSuggestions.map(c => (
                    <li key={c._id} className="bg-indigo-50 border-l-4 border-indigo-400 p-2 rounded">
                      <span className="font-semibold text-indigo-700">{c.title}</span>: Suggested category <span className="font-bold">{c.aiSuggestions.category}</span> (confidence: {Math.round((c.aiSuggestions.confidence||0)*100)}%)
                      {c.aiSuggestions.tags && c.aiSuggestions.tags.length > 0 && (
                        <span className="ml-2 text-xs text-gray-500">Tags: {c.aiSuggestions.tags.join(', ')}</span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        );
      case 'notifications':
        // Use notifications, notifLoading, notifError, notifDetail, notifDetailModal, markAsRead, markAllAsRead, handleNotifClick from top-level state
        return (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">Notifications</h2>
              <button onClick={markAllAsRead} className="px-3 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700">Mark all as read</button>
            </div>
            {notifLoading ? <div>Loading...</div> : notifError ? <div className="text-red-500">{notifError}</div> : (
              <ul className="space-y-2">
                {notifications.length === 0 && <li className="text-gray-400">No notifications.</li>}
                {notifications.map(n => (
                  <li key={n._id} onClick={() => handleNotifClick(n)} className={`p-3 rounded shadow flex flex-col cursor-pointer border-l-4 ${n.read ? 'border-gray-200 bg-gray-50' : 'border-indigo-500 bg-indigo-50'}`}>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2 py-1 rounded-full ${n.read ? 'bg-gray-200 text-gray-500' : 'bg-indigo-600 text-white'}`}>{n.type}</span>
                      <span className="font-semibold">{n.title}</span>
                      <span className="ml-auto text-xs text-gray-400">{new Date(n.createdAt).toLocaleString()}</span>
                    </div>
                    <div className="text-sm text-gray-700 mt-1">{n.message}</div>
                    {!n.read && <span className="text-xs text-indigo-600 mt-1">Unread</span>}
                  </li>
                ))}
              </ul>
            )}
            {notifDetailModal && notifDetail && (
              <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg shadow-lg p-6 max-w-lg w-full relative">
                  <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-xl" onClick={() => setNotifDetailModal(false)}><X /></button>
                  <h2 className="text-lg font-bold mb-2">Related Complaint Details</h2>
                  <pre className="text-xs bg-gray-50 rounded p-2 overflow-x-auto max-h-96">{JSON.stringify(notifDetail, null, 2)}</pre>
                </div>
              </div>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <OfficialLayout
      currentTab={currentTab}
      setCurrentTab={setCurrentTab}
      user={user}
      region={region}
      onLogout={onLogout}
    >
      {renderTabContent()}
    </OfficialLayout>
  );
};

export default OfficialDashboard; 