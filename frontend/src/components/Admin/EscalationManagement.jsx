import React, { useState, useEffect } from 'react';
import { Save, AlertTriangle, Bell, Mail, MessageSquare } from 'lucide-react';

const EscalationManagement = () => {
  const [settings, setSettings] = useState({
    yellowThresholdDays: 45,
    redThresholdDays: 60,
    notifySMS: false,
    notifyEmail: true,
    autoEscalateTo: ''
  });
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchSettings();
    fetchUsers();
  }, []);

  const fetchSettings = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/admin/escalation-settings', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setSettings(data);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/admin/users', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setUsers(data.filter(user => user.role === 'official' || user.role === 'supervisor'));
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/admin/escalation-settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(settings)
      });
      if (res.ok) {
        setMessage('Settings updated successfully!');
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage('Failed to update settings');
      }
    } catch (error) {
      setMessage('Error updating settings');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center mb-6">
        <AlertTriangle className="h-6 w-6 text-orange-500 mr-3" />
        <h2 className="text-2xl font-bold">Escalation Management</h2>
      </div>

      {message && (
        <div className={`mb-4 p-3 rounded ${message.includes('success') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Threshold Settings */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-4">Escalation Thresholds</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Yellow Alert (Days)
              </label>
              <input
                type="number"
                value={settings.yellowThresholdDays}
                onChange={(e) => setSettings({...settings, yellowThresholdDays: parseInt(e.target.value)})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                min="1"
                max="365"
              />
              <p className="text-xs text-gray-500 mt-1">Complaints older than this will be marked as yellow</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Red Alert (Days)
              </label>
              <input
                type="number"
                value={settings.redThresholdDays}
                onChange={(e) => setSettings({...settings, redThresholdDays: parseInt(e.target.value)})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                min="1"
                max="365"
              />
              <p className="text-xs text-gray-500 mt-1">Complaints older than this will be marked as red</p>
            </div>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-4">Notification Preferences</h3>
          <div className="space-y-3">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="notifyEmail"
                checked={settings.notifyEmail}
                onChange={(e) => setSettings({...settings, notifyEmail: e.target.checked})}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label htmlFor="notifyEmail" className="ml-2 flex items-center text-sm text-gray-700">
                <Mail className="h-4 w-4 mr-1" />
                Email Notifications
              </label>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="notifySMS"
                checked={settings.notifySMS}
                onChange={(e) => setSettings({...settings, notifySMS: e.target.checked})}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label htmlFor="notifySMS" className="ml-2 flex items-center text-sm text-gray-700">
                <MessageSquare className="h-4 w-4 mr-1" />
                SMS Notifications
              </label>
            </div>
          </div>
        </div>

        {/* Auto-Escalation */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-4">Auto-Escalation Path</h3>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Auto-escalate to
            </label>
            <select
              value={settings.autoEscalateTo}
              onChange={(e) => setSettings({...settings, autoEscalateTo: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Select an official or supervisor</option>
              {users.map(user => (
                <option key={user._id} value={user._id}>
                  {user.name} ({user.role})
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">Complaints will be automatically assigned to this person when escalated</p>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
          >
            <Save className="h-4 w-4 mr-2" />
            {loading ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EscalationManagement; 