// Profile.jsx
import React, { useState } from 'react';
import useProfile from '../../hooks/useProfile';

const Profile = ({ onNavigate }) => {
  const { profile, loading, error, updateProfile } = useProfile();
  const [edit, setEdit] = useState(false);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  // Update form when profile loads
  React.useEffect(() => {
    if (profile) {
      setForm(profile);
    }
  }, [profile]);

  if (loading) return <div className="text-gray-400 text-center py-8">Loading profile...</div>;
  if (error) return <div className="text-red-500 text-center py-8">Error loading profile: {error}</div>;
  if (!profile) return <div className="text-gray-400 text-center py-8">No profile data found.</div>;

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = async e => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateProfile(form);
      setSaving(false);
      setEdit(false);
      setMessage('Profile updated successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setSaving(false);
      setMessage('Error updating profile: ' + error.message);
      setTimeout(() => setMessage(''), 3000);
    }
  };

  return (
    <div className="p-6 bg-white rounded shadow max-w-md mx-auto mt-8">
      <h2 className="text-2xl font-bold mb-4 text-indigo-700">My Profile</h2>
      {message && <div className="mb-2 text-green-600 text-sm">{message}</div>}
      <form onSubmit={handleSave} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
          <input
            name="name"
            value={form.name || ''}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            disabled={!edit}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input
            name="email"
            value={form.email || ''}
            disabled
            className="w-full px-3 py-2 border border-gray-200 rounded-md bg-gray-50"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
          <input
            name="phone"
            value={form.phone || ''}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            disabled={!edit}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
          <input
            name="address"
            value={form.address || ''}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            disabled={!edit}
          />
        </div>
        <div className="flex gap-2 mt-4">
          {edit ? (
            <>
              <button
                type="submit"
                className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 disabled:opacity-50"
                disabled={saving}
              >
                {saving ? 'Saving...' : 'Save'}
              </button>
              <button
                type="button"
                className="bg-gray-100 text-gray-700 px-4 py-2 rounded hover:bg-gray-200"
                onClick={() => { setEdit(false); setForm(profile); }}
                disabled={saving}
              >
                Cancel
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                className="bg-indigo-100 text-indigo-700 px-4 py-2 rounded hover:bg-indigo-200"
                onClick={() => setEdit(true)}
              >
                Edit Profile
              </button>
              {onNavigate && (
                <button
                  type="button"
                  onClick={() => onNavigate('dashboard')}
                  className="bg-gray-100 text-gray-700 px-4 py-2 rounded hover:bg-gray-200"
                >
                  Back to Dashboard
                </button>
              )}
            </>
          )}
        </div>
      </form>
    </div>
  );
};

export default Profile; 