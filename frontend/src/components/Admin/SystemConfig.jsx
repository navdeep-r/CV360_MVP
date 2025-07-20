import React, { useEffect, useState } from 'react';
import { Plus, Trash2, Save } from 'lucide-react';

const SystemConfig = () => {
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [newSeverity, setNewSeverity] = useState('');
  const [newLanguage, setNewLanguage] = useState({ code: '', name: '' });

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/admin/config', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setConfig(data);
      }
    } catch (error) {
      setMessage('Error fetching config');
    } finally {
      setLoading(false);
    }
  };

  const updateCategories = async (categories) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/admin/config/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ categories })
      });
      if (res.ok) {
        setMessage('Categories updated!');
        fetchConfig();
      } else {
        setMessage('Failed to update categories');
      }
    } catch (error) {
      setMessage('Error updating categories');
    } finally {
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const updateSeverity = async (severityLevels) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/admin/config/severity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ severityLevels })
      });
      if (res.ok) {
        setMessage('Severity levels updated!');
        fetchConfig();
      } else {
        setMessage('Failed to update severity levels');
      }
    } catch (error) {
      setMessage('Error updating severity levels');
    } finally {
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const updateLanguages = async (languages, defaultLanguage) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/admin/config/languages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ languages, defaultLanguage })
      });
      if (res.ok) {
        setMessage('Languages updated!');
        fetchConfig();
      } else {
        setMessage('Failed to update languages');
      }
    } catch (error) {
      setMessage('Error updating languages');
    } finally {
      setTimeout(() => setMessage(''), 3000);
    }
  };

  if (loading || !config) return <div className="p-6">Loading configuration...</div>;

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-bold mb-4">System Configuration</h2>
      {message && <div className="mb-4 p-3 rounded bg-blue-100 text-blue-700">{message}</div>}
      {/* Categories */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-2">Categories</h3>
        <div className="flex flex-wrap gap-2 mb-2">
          {config.categories.map((cat, i) => (
            <span key={i} className="inline-flex items-center bg-gray-100 px-3 py-1 rounded-full text-sm">
              {cat}
              <button
                className="ml-2 text-red-500 hover:text-red-700"
                onClick={() => updateCategories(config.categories.filter((c, idx) => idx !== i))}
                title="Delete"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </span>
          ))}
        </div>
        <form
          onSubmit={e => {
            e.preventDefault();
            if (newCategory.trim()) {
              updateCategories([...config.categories, newCategory.trim()]);
              setNewCategory('');
            }
          }}
          className="flex gap-2"
        >
          <input
            type="text"
            value={newCategory}
            onChange={e => setNewCategory(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg"
            placeholder="Add category"
          />
          <button type="submit" className="px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
            <Plus className="h-4 w-4" />
          </button>
        </form>
      </div>
      {/* Severity Levels */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-2">Severity Levels</h3>
        <div className="flex flex-wrap gap-2 mb-2">
          {config.severityLevels.map((sev, i) => (
            <span key={i} className="inline-flex items-center bg-gray-100 px-3 py-1 rounded-full text-sm">
              {sev}
              <button
                className="ml-2 text-red-500 hover:text-red-700"
                onClick={() => updateSeverity(config.severityLevels.filter((s, idx) => idx !== i))}
                title="Delete"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </span>
          ))}
        </div>
        <form
          onSubmit={e => {
            e.preventDefault();
            if (newSeverity.trim()) {
              updateSeverity([...config.severityLevels, newSeverity.trim()]);
              setNewSeverity('');
            }
          }}
          className="flex gap-2"
        >
          <input
            type="text"
            value={newSeverity}
            onChange={e => setNewSeverity(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg"
            placeholder="Add severity"
          />
          <button type="submit" className="px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
            <Plus className="h-4 w-4" />
          </button>
        </form>
      </div>
      {/* Languages */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-2">Languages</h3>
        <div className="flex flex-wrap gap-2 mb-2">
          {config.languages.map((lang, i) => (
            <span key={i} className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${lang.active ? 'bg-green-100' : 'bg-gray-100'}`}>
              {lang.name} ({lang.code})
              <button
                className="ml-2 text-red-500 hover:text-red-700"
                onClick={() => updateLanguages(config.languages.filter((l, idx) => idx !== i), config.defaultLanguage)}
                title="Delete"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </span>
          ))}
        </div>
        <form
          onSubmit={e => {
            e.preventDefault();
            if (newLanguage.code.trim() && newLanguage.name.trim()) {
              updateLanguages([...config.languages, { ...newLanguage, active: true }], config.defaultLanguage);
              setNewLanguage({ code: '', name: '' });
            }
          }}
          className="flex gap-2"
        >
          <input
            type="text"
            value={newLanguage.name}
            onChange={e => setNewLanguage({ ...newLanguage, name: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-lg"
            placeholder="Language name"
          />
          <input
            type="text"
            value={newLanguage.code}
            onChange={e => setNewLanguage({ ...newLanguage, code: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-lg"
            placeholder="Code (e.g. en)"
          />
          <button type="submit" className="px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
            <Plus className="h-4 w-4" />
          </button>
        </form>
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Default Language</label>
          <select
            value={config.defaultLanguage}
            onChange={e => updateLanguages(config.languages, e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          >
            {config.languages.map(lang => (
              <option key={lang.code} value={lang.code}>{lang.name} ({lang.code})</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

export default SystemConfig; 