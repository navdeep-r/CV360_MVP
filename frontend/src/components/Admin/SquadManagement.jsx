// SquadManagement.jsx
import React, { useState, useEffect } from 'react';
import { 
  Users, 
  MapPin, 
  Plus, 
  Edit, 
  Trash2, 
  Eye,
  UserPlus,
  Settings
} from 'lucide-react';

const SquadManagement = () => {
  const [squads, setSquads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSquad, setSelectedSquad] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    assignedRegions: []
  });

  const API_BASE = 'http://localhost:5000/api';

  useEffect(() => {
    fetchSquads();
  }, []);

  const fetchSquads = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/squads`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch squads');
      }

      const data = await response.json();
      setSquads(data);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching squads:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem('token');
      const url = selectedSquad 
        ? `${API_BASE}/squads/${selectedSquad._id}`
        : `${API_BASE}/squads`;
      
      const response = await fetch(url, {
        method: selectedSquad ? 'PUT' : 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to save squad');
      }

      await fetchSquads();
      setShowForm(false);
      setSelectedSquad(null);
      setFormData({ name: '', code: '', description: '', assignedRegions: [] });
    } catch (err) {
      setError(err.message);
      console.error('Error saving squad:', err);
    }
  };

  const handleEdit = (squad) => {
    setSelectedSquad(squad);
    setFormData({
      name: squad.name,
      code: squad.code,
      description: squad.description,
      assignedRegions: squad.assignedRegions
    });
    setShowForm(true);
  };

  const handleDelete = async (squadId) => {
    if (!window.confirm('Are you sure you want to delete this squad?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/squads/${squadId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete squad');
      }

      await fetchSquads();
    } catch (err) {
      setError(err.message);
      console.error('Error deleting squad:', err);
    }
  };

  const addRegion = () => {
    setFormData(prev => ({
      ...prev,
      assignedRegions: [
        ...prev.assignedRegions,
        {
          city: '',
          state: '',
          coordinates: {
            center: { lat: 0, lng: 0 },
            bounds: { north: 0, south: 0, east: 0, west: 0 }
          }
        }
      ]
    }));
  };

  const removeRegion = (index) => {
    setFormData(prev => ({
      ...prev,
      assignedRegions: prev.assignedRegions.filter((_, i) => i !== index)
    }));
  };

  const updateRegion = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      assignedRegions: prev.assignedRegions.map((region, i) => 
        i === index ? { ...region, [field]: value } : region
      )
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Squad Management</h1>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Squad
        </button>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {/* Squad List */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {squads.map((squad) => (
          <div key={squad._id} className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{squad.name}</h3>
                <p className="text-sm text-gray-500">Code: {squad.code}</p>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleEdit(squad)}
                  className="p-1 text-gray-400 hover:text-indigo-600"
                >
                  <Edit className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDelete(squad._id)}
                  className="p-1 text-gray-400 hover:text-red-600"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>

            <p className="text-gray-600 mb-4">{squad.description}</p>

            <div className="space-y-3">
              <div className="flex items-center text-sm text-gray-500">
                <Users className="h-4 w-4 mr-2" />
                <span>{squad.members?.length || 0} members</span>
              </div>

              {squad.supervisor && (
                <div className="text-sm text-gray-500">
                  <strong>Supervisor:</strong> {squad.supervisor.name}
                </div>
              )}

              <div className="text-sm text-gray-500">
                <strong>Regions:</strong>
                <div className="mt-1 space-y-1">
                  {squad.assignedRegions?.map((region, index) => (
                    <div key={index} className="flex items-center">
                      <MapPin className="h-3 w-3 mr-1" />
                      {region.city}, {region.state}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Squad Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">
                  {selectedSquad ? 'Edit Squad' : 'Add New Squad'}
                </h2>
                <button
                  onClick={() => {
                    setShowForm(false);
                    setSelectedSquad(null);
                    setFormData({ name: '', code: '', description: '', assignedRegions: [] });
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Squad Name *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Squad Code *
                    </label>
                    <input
                      type="text"
                      value={formData.code}
                      onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-4">
                    <label className="block text-sm font-medium text-gray-700">
                      Assigned Regions
                    </label>
                    <button
                      type="button"
                      onClick={addRegion}
                      className="flex items-center px-3 py-1 text-sm bg-green-100 text-green-700 rounded-md hover:bg-green-200"
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      Add Region
                    </button>
                  </div>

                  <div className="space-y-4">
                    {formData.assignedRegions.map((region, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-center mb-3">
                          <h4 className="font-medium">Region {index + 1}</h4>
                          <button
                            type="button"
                            onClick={() => removeRegion(index)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              City
                            </label>
                            <input
                              type="text"
                              value={region.city}
                              onChange={(e) => updateRegion(index, 'city', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              State
                            </label>
                            <input
                              type="text"
                              value={region.state}
                              onChange={(e) => updateRegion(index, 'state', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false);
                      setSelectedSquad(null);
                      setFormData({ name: '', code: '', description: '', assignedRegions: [] });
                    }}
                    className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                  >
                    {selectedSquad ? 'Update Squad' : 'Create Squad'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SquadManagement; 