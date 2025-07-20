import React, { useEffect, useState } from 'react';
import EscalationManagement from './EscalationManagement';
import UserManagement from './UserManagement';
import PerformanceAnalytics from './PerformanceAnalytics';
import SystemConfig from './SystemConfig';
import SquadProgress from './SquadProgress';
import SquadManagement from './SquadManagement';

const TABS = [
  { key: 'dashboard', label: 'Overview' },
  { key: 'escalation', label: 'Escalation Management' },
  { key: 'users', label: 'User Management' },
  { key: 'analytics', label: 'Performance Analytics' },
  { key: 'squad-progress', label: 'Squad Progress' },
  { key: 'squads', label: 'Squad Management' },
  { key: 'config', label: 'System Configuration' },
];

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState(null);
  const [tab, setTab] = useState('dashboard');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('http://localhost:5000/api/admin/dashboard', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (!res.ok) throw new Error('Failed to fetch dashboard data');
        const data = await res.json();
        setStats(data);
      } catch (err) {
        setError(err.message);
      }
    };
    fetchStats();
  }, []);

  if (error) return <div className="p-8 text-red-600">Error: {error}</div>;
  if (!stats) return <div className="p-8">Loading dashboard...</div>;

  return (
    <div className="max-w-5xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Admin/Supervisor Dashboard</h1>
      <div className="flex space-x-4 mb-8 border-b">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2 font-medium border-b-2 transition-colors ${tab === t.key ? 'border-indigo-600 text-indigo-700' : 'border-transparent text-gray-500 hover:text-indigo-600'}`}
          >
            {t.label}
          </button>
        ))}
      </div>
      {tab === 'dashboard' && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.users}</div>
            <div className="text-gray-700 mt-2">Total Users</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <div className="text-2xl font-bold text-green-600">{stats.complaints}</div>
            <div className="text-gray-700 mt-2">Total Complaints</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <div className="text-2xl font-bold text-indigo-600">{stats.officials}</div>
            <div className="text-gray-700 mt-2">Officials</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <div className="text-2xl font-bold text-purple-600">{stats.supervisors}</div>
            <div className="text-gray-700 mt-2">Supervisors</div>
          </div>
        </div>
      )}
      {tab === 'escalation' && <EscalationManagement />}
      {tab === 'users' && <UserManagement />}
      {tab === 'analytics' && <PerformanceAnalytics />}
      {tab === 'squad-progress' && <SquadProgress />}
      {tab === 'squads' && <SquadManagement />}
      {tab === 'config' && <SystemConfig />}
    </div>
  );
};

export default AdminDashboard; 