import React, { useState, useEffect } from 'react';
import { 
  Users, 
  MapPin, 
  Clock, 
  AlertTriangle, 
  CheckCircle,
  FileText,
  Search,
  Filter,
  User,
  Phone,
  Mail,
  BarChart3,
  TrendingUp,
  Download,
  Eye,
  Edit
} from 'lucide-react';
import ComplaintTable from './ComplaintTable';
import ComplaintDetailModal from './ComplaintDetailModal';
import InteractiveMap from './InteractiveMap';
import TrendChartPanel from './TrendChartPanel';
import { useComplaintsContext } from '../../context/ComplaintsContext';
import { exportFilteredComplaints, exportSquadAssignments } from '../../utils/exportUtils';

const AllComplaints = () => {
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [filters, setFilters] = useState({
    severity: '',
    status: '',
    squad: '',
    zone: '',
    dateRange: '',
    search: ''
  });
  const [selectedZone, setSelectedZone] = useState(null);
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'map'

  const { 
    complaints, 
    loading, 
    error, 
    stats,
    updateComplaintStatus
  } = useComplaintsContext();

  // Squad information for all squads
  const squads = [
    {
      id: 'alpha',
      name: 'Squad Alpha',
      zone: 'downtown',
      members: 4,
      vehicle: 'Alpha-001',
      supervisor: 'Captain Robert Wilson',
      status: 'active'
    },
    {
      id: 'beta',
      name: 'Squad Beta',
      zone: 'residential',
      members: 3,
      vehicle: 'Beta-002',
      supervisor: 'Lieutenant Maria Garcia',
      status: 'active'
    },
    {
      id: 'gamma',
      name: 'Squad Gamma',
      zone: 'commercial',
      members: 4,
      vehicle: 'Gamma-003',
      supervisor: 'Sergeant David Kim',
      status: 'active'
    },
    {
      id: 'delta',
      name: 'Squad Delta',
      zone: 'industrial',
      members: 3,
      vehicle: 'Delta-004',
      supervisor: 'Officer Sarah Johnson',
      status: 'standby'
    }
  ];

  // Filter complaints based on current filters and selected zone
  const filteredComplaints = complaints.filter(complaint => {
    // Zone filter from heatmap
    if (selectedZone && complaint.location?.zone !== selectedZone) {
      return false;
    }

    // Squad filter
    if (filters.squad) {
      const squad = squads.find(s => s.id === filters.squad);
      if (squad && complaint.location?.zone !== squad.zone) {
        return false;
      }
    }

    // Zone filter
    if (filters.zone && complaint.location?.zone !== filters.zone) {
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

    // Date range filter
    if (filters.dateRange) {
      const complaintDate = new Date(complaint.createdAt);
      const now = new Date();
      const daysDiff = Math.ceil((now - complaintDate) / (1000 * 60 * 60 * 24));
      
      switch (filters.dateRange) {
        case 'today':
          if (daysDiff !== 0) return false;
          break;
        case 'week':
          if (daysDiff > 7) return false;
          break;
        case 'month':
          if (daysDiff > 30) return false;
          break;
      }
    }

    // Search filter
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      return (
        complaint.title.toLowerCase().includes(searchTerm) ||
        complaint.description.toLowerCase().includes(searchTerm) ||
        complaint._id.toLowerCase().includes(searchTerm) ||
        complaint.citizenId?.name?.toLowerCase().includes(searchTerm)
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

  const getSquadColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'standby': return 'bg-yellow-100 text-yellow-800';
      case 'offline': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">All Complaints</h1>
        <p className="text-gray-600">Monitor and manage all complaints across all squads</p>
      </div>

      {/* Squad Overview */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
          <Users className="h-6 w-6 mr-2 text-indigo-600" />
          Squad Overview
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {squads.map((squad) => {
            const squadComplaints = complaints.filter(c => c.location?.zone === squad.zone);
            const pendingComplaints = squadComplaints.filter(c => c.status === 'pending').length;
            
            return (
              <div key={squad.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-gray-900">{squad.name}</h3>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getSquadColor(squad.status)}`}>
                    {squad.status}
                  </span>
                </div>
                <div className="space-y-1 text-sm text-gray-600">
                  <div>Zone: {squad.zone}</div>
                  <div>Members: {squad.members}</div>
                  <div>Vehicle: {squad.vehicle}</div>
                  <div className="font-medium text-red-600">
                    Pending: {pendingComplaints}
                  </div>
                </div>
                <div className="mt-2 text-xs text-gray-500">
                  {squad.supervisor}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Complaints Section - Takes 2/3 of the space */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">All Complaints</h2>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setViewMode('table')}
                    className={`px-3 py-1 text-sm rounded ${
                      viewMode === 'table' 
                        ? 'bg-indigo-600 text-white' 
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <Eye className="h-4 w-4 inline mr-1" />
                    Table
                  </button>
                  <button
                    onClick={() => setViewMode('map')}
                    className={`px-3 py-1 text-sm rounded ${
                      viewMode === 'map' 
                        ? 'bg-indigo-600 text-white' 
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <MapPin className="h-4 w-4 inline mr-1" />
                    Map
                  </button>
                  <button 
                    onClick={() => exportFilteredComplaints(filteredComplaints, filters, 'excel')}
                    className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
                  >
                    <Download className="h-4 w-4 mr-1 inline" />
                    Export Excel
                  </button>
                  <button 
                    onClick={() => exportSquadAssignments(complaints, squads)}
                    className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
                  >
                    <Download className="h-4 w-4 mr-1 inline" />
                    Export Squads
                  </button>
                </div>
              </div>

              {/* Filters */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                <div className="relative">
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
                  value={filters.squad}
                  onChange={(e) => setFilters({ ...filters, squad: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">All Squads</option>
                  {squads.map(squad => (
                    <option key={squad.id} value={squad.id}>{squad.name}</option>
                  ))}
                </select>
                <select
                  value={filters.zone}
                  onChange={(e) => setFilters({ ...filters, zone: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">All Zones</option>
                  <option value="downtown">Downtown</option>
                  <option value="residential">Residential</option>
                  <option value="commercial">Commercial</option>
                  <option value="industrial">Industrial</option>
                </select>
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
                  value={filters.dateRange}
                  onChange={(e) => setFilters({ ...filters, dateRange: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">All Time</option>
                  <option value="today">Today</option>
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
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

            {viewMode === 'table' ? (
              <ComplaintTable
                complaints={filteredComplaints}
                loading={loading}
                onComplaintClick={handleComplaintClick}
              />
                         ) : (
               <div className="p-6">
                 <InteractiveMap
                   complaints={complaints}
                   onZoneClick={handleZoneClick}
                   selectedZone={selectedZone}
                 />
               </div>
             )}
          </div>
        </div>

        {/* Sidebar - Takes 1/3 of the space */}
        <div className="space-y-6">
                     {/* Interactive Map */}
           {viewMode === 'table' && (
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
           )}

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

export default AllComplaints; 