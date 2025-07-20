import React, { useState, useEffect } from 'react';
import { 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  FileText, 
  MapPin, 
  Search, 
  Filter,
  Calendar,
  TrendingUp,
  BarChart3,
  Eye,
  Edit,
  Upload,
  Download
} from 'lucide-react';
import ComplaintTable from './ComplaintTable';
import ComplaintDetailModal from './ComplaintDetailModal';
import InteractiveMap from './InteractiveMap';
import TrendChartPanel from './TrendChartPanel';
import { useComplaintsContext } from '../../context/ComplaintsContext';
import { exportFilteredComplaints } from '../../utils/exportUtils';

const OfficialDashboard = () => {
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [filters, setFilters] = useState({
    severity: '',
    status: '',
    dateRange: '',
    location: '',
    search: ''
  });
  const [selectedZone, setSelectedZone] = useState(null);

  const { 
    complaints, 
    loading, 
    error, 
    stats,
    updateComplaintStatus
  } = useComplaintsContext();

  // Filter complaints based on current filters and selected zone
  const filteredComplaints = complaints.filter(complaint => {
    // Zone filter from heatmap
    if (selectedZone && complaint.location?.zone !== selectedZone) {
      return false;
    }

    // Severity filter
    if (filters.severity && complaint.severity !== filters.severity) {
      return false;
    }

    // Status filter
    if (filters.status && complaint.status !== filters.status) {
      return false;
    }

    // Search filter
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      return (
        complaint.title.toLowerCase().includes(searchTerm) ||
        complaint.description.toLowerCase().includes(searchTerm) ||
        complaint._id.toLowerCase().includes(searchTerm)
      );
    }

    return true;
  });

  const handleComplaintClick = (complaint) => {
    setSelectedComplaint(complaint);
    setShowDetailModal(true);
  };

  const handleStatusUpdate = async (complaintId, newStatus, notes, files) => {
    try {
      await updateComplaintStatus(complaintId, newStatus, notes, files);
      setShowDetailModal(false);
      setSelectedComplaint(null);
    } catch (error) {
      console.error('Error updating complaint status:', error);
    }
  };

  const handleZoneClick = (zone) => {
    setSelectedZone(selectedZone === zone ? null : zone);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Official Dashboard</h1>
        <p className="text-gray-600">Manage and resolve citizen complaints efficiently</p>
      </div>

      {/* Overview Panels */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Complaints</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.active || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Resolved Today</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.resolvedToday || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Overdue (Yellow)</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.overdueYellow || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Overdue (Red)</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.overdueRed || 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Complaint Table - Takes 2/3 of the space */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Complaints</h2>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => exportFilteredComplaints(filteredComplaints, filters, 'excel')}
                    className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
                  >
                    <Download className="h-4 w-4 mr-1 inline" />
                    Export Excel
                  </button>
                  <button 
                    onClick={() => exportFilteredComplaints(filteredComplaints, filters, 'csv')}
                    className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
                  >
                    <Download className="h-4 w-4 mr-1 inline" />
                    Export CSV
                  </button>
                </div>
              </div>

              {/* Filters */}
              <div className="flex flex-col md:flex-row gap-4 mb-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    type="text"
                    placeholder="Search complaints..."
                    value={filters.search}
                    onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <select
                  value={filters.severity}
                  onChange={(e) => setFilters({ ...filters, severity: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">All Severities</option>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">All Statuses</option>
                  <option value="pending">New</option>
                  <option value="in_progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                </select>
                <select
                  value={filters.location}
                  onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">All Locations</option>
                  <option value="downtown">Downtown</option>
                  <option value="residential">Residential</option>
                  <option value="commercial">Commercial</option>
                  <option value="industrial">Industrial</option>
                </select>
              </div>

              {selectedZone && (
                <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-blue-800">
                      Filtering by zone: <strong>{selectedZone}</strong>
                    </span>
                    <button
                      onClick={() => setSelectedZone(null)}
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      Clear filter
                    </button>
                  </div>
                </div>
              )}
            </div>

            <ComplaintTable
              complaints={filteredComplaints}
              loading={loading}
              onComplaintClick={handleComplaintClick}
            />
          </div>
        </div>

        {/* Sidebar - Takes 1/3 of the space */}
        <div className="space-y-6">
          {/* Interactive Map */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <MapPin className="h-5 w-5 mr-2 text-indigo-600" />
              Interactive Complaint Map
            </h3>
            <InteractiveMap
              complaints={complaints}
              onZoneClick={handleZoneClick}
              selectedZone={selectedZone}
            />
          </div>

          {/* Trend Chart Panel */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <TrendingUp className="h-5 w-5 mr-2 text-green-600" />
              Trends & Analytics
            </h3>
            <TrendChartPanel complaints={complaints} />
          </div>
        </div>
      </div>

      {/* Complaint Detail Modal */}
      {showDetailModal && selectedComplaint && (
        <ComplaintDetailModal
          complaint={selectedComplaint}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedComplaint(null);
          }}
          onStatusUpdate={handleStatusUpdate}
        />
      )}
    </div>
  );
};

export default OfficialDashboard; 