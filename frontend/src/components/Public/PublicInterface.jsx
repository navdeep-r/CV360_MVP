import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Filter, Eye, ThumbsUp, Calendar, MapPin } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in react-leaflet
import L from 'leaflet';
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const PublicInterface = () => {
  const [complaints, setComplaints] = useState([]);
  const [filteredComplaints, setFilteredComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    category: '',
    status: '',
    severity: '',
    dateRange: 'all'
  });
  const [showMap, setShowMap] = useState(true);
  const [selectedComplaint, setSelectedComplaint] = useState(null);

  useEffect(() => {
    fetchPublicComplaints();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [complaints, filters]);

  const fetchPublicComplaints = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/public/complaints');
      if (res.ok) {
        const data = await res.json();
        setComplaints(data);
      } else {
        setError('Failed to fetch complaints');
      }
    } catch (error) {
      setError('Error fetching complaints');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...complaints];

    if (filters.category) {
      filtered = filtered.filter(c => c.category === filters.category);
    }
    if (filters.status) {
      filtered = filtered.filter(c => c.status === filters.status);
    }
    if (filters.severity) {
      filtered = filtered.filter(c => c.severity === filters.severity);
    }
    if (filters.dateRange !== 'all') {
      const now = new Date();
      const daysAgo = filters.dateRange === '7' ? 7 : filters.dateRange === '30' ? 30 : 90;
      const cutoffDate = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
      filtered = filtered.filter(c => new Date(c.createdAt) >= cutoffDate);
    }

    setFilteredComplaints(filtered);
  };

  const handleUpvote = async (complaintId) => {
    try {
      const res = await fetch(`http://localhost:5000/api/public/complaints/${complaintId}/upvote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      if (res.ok) {
        // Update local state
        setComplaints(prev => prev.map(c => 
          c._id === complaintId 
            ? { ...c, upvotes: c.upvotes + 1 }
            : c
        ));
      }
    } catch (error) {
      console.error('Error upvoting:', error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'resolved': return 'text-green-600 bg-green-100';
      case 'in_progress': return 'text-blue-600 bg-blue-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getMarkerColor = (status) => {
    switch (status) {
      case 'resolved': return '#10B981';
      case 'in_progress': return '#3B82F6';
      case 'pending': return '#F59E0B';
      default: return '#6B7280';
    }
  };

  // Prepare chart data
  const statusData = [
    { name: 'Resolved', value: complaints.filter(c => c.status === 'resolved').length, color: '#10B981' },
    { name: 'In Progress', value: complaints.filter(c => c.status === 'in_progress').length, color: '#3B82F6' },
    { name: 'Pending', value: complaints.filter(c => c.status === 'pending').length, color: '#F59E0B' }
  ];

  const categoryData = complaints.reduce((acc, complaint) => {
    acc[complaint.category] = (acc[complaint.category] || 0) + 1;
    return acc;
  }, {});

  const chartData = Object.entries(categoryData).map(([category, count]) => ({
    category: category.charAt(0).toUpperCase() + category.slice(1),
    count
  }));

  if (loading) return <div className="p-6">Loading public complaints...</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">CityView 360 - Public Dashboard</h1>
        <p className="text-gray-600">Track and monitor city complaints and their resolution progress</p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">{complaints.length}</div>
          <div className="text-gray-600">Total Complaints</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4 text-center">
          <div className="text-2xl font-bold text-green-600">
            {complaints.filter(c => c.status === 'resolved').length}
          </div>
          <div className="text-gray-600">Resolved</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">
            {complaints.filter(c => c.status === 'in_progress').length}
          </div>
          <div className="text-gray-600">In Progress</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4 text-center">
          <div className="text-2xl font-bold text-yellow-600">
            {complaints.filter(c => c.status === 'pending').length}
          </div>
          <div className="text-gray-600">Pending</div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Status Distribution</h3>
          {statusData.some(item => item.value > 0) ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-500">
              No data available for chart
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Complaints by Category</h3>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="category" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#3B82F6" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-500">
              No data available for chart
            </div>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center gap-4 mb-4">
          <Filter className="h-5 w-5 text-gray-600" />
          <h3 className="text-lg font-semibold">Filters</h3>
          <button
            onClick={() => setShowMap(!showMap)}
            className="ml-auto px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            {showMap ? 'Show Table' : 'Show Map'}
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <select
            value={filters.category}
            onChange={(e) => setFilters({ ...filters, category: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-lg"
          >
            <option value="">All Categories</option>
            <option value="sanitation">Sanitation</option>
            <option value="roads">Roads</option>
            <option value="water">Water</option>
            <option value="electricity">Electricity</option>
            <option value="parks">Parks</option>
            <option value="traffic">Traffic</option>
            <option value="other">Other</option>
          </select>

          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-lg"
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
          </select>

          <select
            value={filters.severity}
            onChange={(e) => setFilters({ ...filters, severity: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-lg"
          >
            <option value="">All Severity</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>

          <select
            value={filters.dateRange}
            onChange={(e) => setFilters({ ...filters, dateRange: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-lg"
          >
            <option value="all">All Time</option>
            <option value="7">Last 7 Days</option>
            <option value="30">Last 30 Days</option>
            <option value="90">Last 90 Days</option>
          </select>
        </div>
      </div>

      {/* Map or Table View */}
      {showMap ? (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Complaint Locations</h3>
          <div className="h-96">
            <MapContainer
              center={[20.5937, 78.9629]} // India center
              zoom={5}
              style={{ height: '100%', width: '100%' }}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />
              {filteredComplaints.map((complaint) => {
                // Only render if coordinates exist and are valid
                if (complaint.location?.coordinates && 
                    complaint.location.coordinates.lat && 
                    complaint.location.coordinates.lng &&
                    !isNaN(complaint.location.coordinates.lat) && 
                    !isNaN(complaint.location.coordinates.lng)) {
                  return (
                    <Circle
                      key={complaint._id}
                      center={[complaint.location.coordinates.lat, complaint.location.coordinates.lng]}
                      radius={1000}
                      pathOptions={{
                        color: getMarkerColor(complaint.status),
                        fillColor: getMarkerColor(complaint.status),
                        fillOpacity: 0.3
                      }}
                    >
                      <Popup>
                        <div className="p-2">
                          <h4 className="font-semibold">{complaint.title}</h4>
                          <p className="text-sm text-gray-600">{complaint.description}</p>
                          <div className="mt-2">
                            <span className={`px-2 py-1 rounded text-xs ${getStatusColor(complaint.status)}`}>
                              {complaint.status.replace('_', ' ')}
                            </span>
                            <span className={`ml-2 px-2 py-1 rounded text-xs ${getSeverityColor(complaint.severity)}`}>
                              {complaint.severity}
                            </span>
                          </div>
                          <div className="mt-2 text-xs text-gray-500">
                            <Calendar className="h-3 w-3 inline mr-1" />
                            {new Date(complaint.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </Popup>
                    </Circle>
                  );
                }
                return null; // Don't render anything if coordinates are invalid
              })}
            </MapContainer>
          </div>
          {/* Show message if no complaints have valid coordinates */}
          {filteredComplaints.filter(c => 
            c.location?.coordinates && 
            c.location.coordinates.lat && 
            c.location.coordinates.lng &&
            !isNaN(c.location.coordinates.lat) && 
            !isNaN(c.location.coordinates.lng)
          ).length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No complaints with valid location data to display on map.
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Complaints Table</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Complaint
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Severity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredComplaints.map((complaint) => (
                  <tr key={complaint._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{complaint.title}</div>
                        <div className="text-sm text-gray-500 truncate max-w-xs">{complaint.description}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 capitalize">
                      {complaint.category}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded text-xs ${getStatusColor(complaint.status)}`}>
                        {complaint.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded text-xs ${getSeverityColor(complaint.severity)}`}>
                        {complaint.severity}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(complaint.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => setSelectedComplaint(complaint)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleUpvote(complaint._id)}
                          className="text-green-600 hover:text-green-900 flex items-center"
                        >
                          <ThumbsUp className="h-4 w-4 mr-1" />
                          {complaint.upvotes || 0}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Complaint Details Modal */}
      {selectedComplaint && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-96 overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Complaint Details</h3>
              <button
                onClick={() => setSelectedComplaint(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <h4 className="font-medium">{selectedComplaint.title}</h4>
                <p className="text-gray-600 mt-1">{selectedComplaint.description}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm font-medium text-gray-500">Category:</span>
                  <div className="capitalize">{selectedComplaint.category}</div>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">Severity:</span>
                  <span className={`px-2 py-1 rounded text-xs ${getSeverityColor(selectedComplaint.severity)}`}>
                    {selectedComplaint.severity}
                  </span>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">Status:</span>
                  <span className={`px-2 py-1 rounded text-xs ${getStatusColor(selectedComplaint.status)}`}>
                    {selectedComplaint.status.replace('_', ' ')}
                  </span>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">Progress:</span>
                  <div>{selectedComplaint.progress || 0}%</div>
                </div>
              </div>
              
              {selectedComplaint.location?.address && (
                <div>
                  <span className="text-sm font-medium text-gray-500">Location:</span>
                  <div className="flex items-center mt-1">
                    <MapPin className="h-4 w-4 mr-1 text-gray-400" />
                    {selectedComplaint.location.address}
                  </div>
                </div>
              )}
              
              <div>
                <span className="text-sm font-medium text-gray-500">Created:</span>
                <div>{new Date(selectedComplaint.createdAt).toLocaleString()}</div>
              </div>
              
              {selectedComplaint.timeline && selectedComplaint.timeline.length > 0 && (
                <div>
                  <span className="text-sm font-medium text-gray-500">Recent Updates:</span>
                  <div className="mt-2 space-y-2">
                    {selectedComplaint.timeline.slice(-3).map((update, index) => (
                      <div key={index} className="text-sm bg-gray-50 p-2 rounded">
                        <div className="font-medium">{update.action}</div>
                        <div className="text-gray-600">{update.comment}</div>
                        <div className="text-xs text-gray-500">
                          {new Date(update.timestamp).toLocaleString()}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PublicInterface; 