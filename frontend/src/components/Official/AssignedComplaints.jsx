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
  Mail
} from 'lucide-react';
import ComplaintTable from './ComplaintTable';
import ComplaintDetailModal from './ComplaintDetailModal';
import { useComplaintsContext } from '../../context/ComplaintsContext';
import squads from '../../utils/squads';

const AssignedComplaints = () => {
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [filters, setFilters] = useState({
    severity: '',
    status: '',
    priority: '',
    search: ''
  });
  const [selectedSquadId, setSelectedSquadId] = useState('alpha');
  const squadInfo = squads.find(s => s.id === selectedSquadId);

  const { 
    complaints, 
    loading, 
    error, 
    stats,
    updateComplaintStatus
  } = useComplaintsContext();

  // Filter complaints assigned to this squad (based on proximity/zone)
  const assignedComplaints = complaints.filter(complaint => {
    // In a real system, this would be based on actual squad assignments
    // For demo, we'll assign based on zone proximity
    const squadZone = squadInfo.assignedZone;
    return complaint.location?.zone === squadZone || 
           complaint.location?.address?.toLowerCase().includes(squadZone);
  });

  // Filter assigned complaints based on current filters
  const filteredComplaints = assignedComplaints.filter(complaint => {
    // Severity filter
    if (filters.severity && complaint.severity !== filters.severity) {
      return false;
    }

    // Status filter
    if (filters.status && complaint.status !== filters.status) {
      return false;
    }

    // Priority filter (based on severity and days open)
    if (filters.priority) {
      const daysOpen = getDaysOpen(complaint.createdAt);
      if (filters.priority === 'high' && (complaint.severity !== 'critical' && complaint.severity !== 'high')) {
        return false;
      }
      if (filters.priority === 'urgent' && daysOpen <= 3) {
        return false;
      }
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

  const getDaysOpen = (createdAt) => {
    const created = new Date(createdAt);
    const now = new Date();
    const diffTime = Math.abs(now - created);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800';
      case 'busy': return 'bg-yellow-100 text-yellow-800';
      case 'off-duty': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

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

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Assigned Complaints</h1>
        <p className="text-gray-600">Manage complaints assigned to your squad</p>
      </div>

      {/* Squad Selector */}
      <div className="mb-4">
        <label className="mr-2 font-medium">Select Squad:</label>
        <select
          value={selectedSquadId}
          onChange={e => setSelectedSquadId(e.target.value)}
          className="border rounded px-2 py-1"
        >
          {squads.map(squad => (
            <option key={squad.id} value={squad.id}>{squad.name}</option>
          ))}
        </select>
      </div>

      {/* Squad Information Panel */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center">
            <Users className="h-6 w-6 mr-2 text-indigo-600" />
            {squadInfo.name}
          </h2>
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-600">
              <span className="font-medium">Zone:</span> {squadInfo.assignedZone}
            </div>
            <div className="text-sm text-gray-600">
              <span className="font-medium">Vehicle:</span> {squadInfo.vehicle}
            </div>
          </div>
        </div>

        {/* Squad Members */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {squadInfo.members.map((member) => (
            <div key={member.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium text-gray-900">{member.name}</h3>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(member.status)}`}>
                  {member.status.replace('-', ' ')}
                </span>
              </div>
              <div className="space-y-1 text-sm text-gray-600">
                <div className="flex items-center">
                  <Phone className="h-3 w-3 mr-1" />
                  {member.phone}
                </div>
                <div className="flex items-center">
                  <Mail className="h-3 w-3 mr-1" />
                  {member.email}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-sm text-gray-600">
            <span className="font-medium">Supervisor:</span> {squadInfo.supervisor}
          </p>
        </div>
      </div>

      {/* Assignment Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Assigned</p>
              <p className="text-2xl font-bold text-gray-900">{assignedComplaints.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-gray-900">
                {assignedComplaints.filter(c => c.status === 'pending').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <AlertTriangle className="h-6 w-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">In Progress</p>
              <p className="text-2xl font-bold text-gray-900">
                {assignedComplaints.filter(c => c.status === 'in_progress').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-gray-900">
                {assignedComplaints.filter(c => c.status === 'resolved').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Complaints Table */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Assigned Complaints</h2>
          </div>

          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search assigned complaints..."
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
              value={filters.priority}
              onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">All Priorities</option>
              <option value="high">High Priority</option>
              <option value="urgent">Urgent (&gt;3 days)</option>
            </select>
          </div>
        </div>

        <ComplaintTable
          complaints={filteredComplaints}
          loading={loading}
          onComplaintClick={handleComplaintClick}
        />
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

export default AssignedComplaints; 