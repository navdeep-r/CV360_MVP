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
  Car,
  Radio,
  Wifi,
  WifiOff,
  Navigation,
  Target
} from 'lucide-react';
import { useComplaintsContext } from '../../context/ComplaintsContext';
import squads from '../../utils/squads';

const SquadManagement = () => {
  const [selectedSquad, setSelectedSquad] = useState(null);
  const [filters, setFilters] = useState({
    status: '',
    zone: '',
    search: ''
  });

  const { complaints, loading, error } = useComplaintsContext();

  // Filter squads based on current filters
  const filteredSquads = squads.filter(squad => {
    // Status filter
    if (filters.status && squad.status !== filters.status) {
      return false;
    }

    // Zone filter
    if (filters.zone && squad.zone !== filters.zone) {
      return false;
    }

    // Search filter
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      return (
        squad.name.toLowerCase().includes(searchTerm) ||
        squad.supervisor.toLowerCase().includes(searchTerm) ||
        squad.vehicle.toLowerCase().includes(searchTerm) ||
        squad.zone.toLowerCase().includes(searchTerm)
      );
    }

    return true;
  });

  // Calculate proximity-based assignments
  const getProximityAssignments = (squad) => {
    const squadComplaints = complaints.filter(complaint => {
      // In a real system, this would use actual GPS coordinates and distance calculations
      // For demo, we'll use zone-based assignment
      return complaint.location?.zone === squad.zone;
    });

    return {
      total: squadComplaints.length,
      pending: squadComplaints.filter(c => c.status === 'pending').length,
      inProgress: squadComplaints.filter(c => c.status === 'in_progress').length,
      resolved: squadComplaints.filter(c => c.status === 'resolved').length
    };
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800';
      case 'busy': return 'bg-yellow-100 text-yellow-800';
      case 'standby': return 'bg-orange-100 text-orange-800';
      case 'off-duty': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSquadStatusColor = (status) => {
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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Squad Management</h1>
        <p className="text-gray-600">Monitor squad assignments and proximity-based complaint routing</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search squads..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="standby">Standby</option>
            <option value="offline">Offline</option>
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
        </div>
      </div>

      {/* Squad Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredSquads.map((squad) => {
          const assignments = getProximityAssignments(squad);
          
          return (
            <div key={squad.id} className="bg-white rounded-lg shadow">
              {/* Squad Header */}
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <Users className="h-6 w-6 mr-3 text-indigo-600" />
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900">{squad.name}</h2>
                      <p className="text-sm text-gray-600">Zone: {squad.zone}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-3 py-1 text-sm font-medium rounded-full ${getSquadStatusColor(squad.status)}`}>
                      {squad.status}
                    </span>
                    <Radio className={`h-5 w-5 ${squad.status === 'active' ? 'text-green-500' : 'text-gray-400'}`} />
                  </div>
                </div>

                {/* Squad Info */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">Vehicle:</span> {squad.vehicle}
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Supervisor:</span> {squad.supervisor}
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Members:</span> {squad.members.length}
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Coverage:</span> {squad.coverage}
                  </div>
                </div>
              </div>

              {/* Assignment Stats */}
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
                  <Target className="h-5 w-5 mr-2 text-indigo-600" />
                  Proximity Assignments
                </h3>
                <div className="grid grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-indigo-600">{assignments.total}</div>
                    <div className="text-xs text-gray-500">Total</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-600">{assignments.pending}</div>
                    <div className="text-xs text-gray-500">Pending</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{assignments.inProgress}</div>
                    <div className="text-xs text-gray-500">In Progress</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{assignments.resolved}</div>
                    <div className="text-xs text-gray-500">Resolved</div>
                  </div>
                </div>
              </div>

              {/* Squad Members */}
              <div className="p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-3">Squad Members</h3>
                <div className="space-y-3">
                  {squad.members.map((member) => (
                    <div key={member.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                      <div className="flex items-center">
                        <User className="h-4 w-4 mr-2 text-gray-400" />
                        <div>
                          <div className="font-medium text-gray-900">{member.name}</div>
                          <div className="text-xs text-gray-500">{member.location}</div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(member.status)}`}>
                          {member.status.replace('-', ' ')}
                        </span>
                        <div className="flex space-x-1">
                          <Phone className="h-3 w-3 text-gray-400" />
                          <Mail className="h-3 w-3 text-gray-400" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Proximity Assignment Info */}
      <div className="mt-8 bg-blue-50 rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
          <Navigation className="h-5 w-5 mr-2 text-blue-600" />
          Proximity-Based Assignment System
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <h4 className="font-medium text-gray-900 mb-2">How It Works</h4>
            <p className="text-gray-600">
              Complaints are automatically assigned to the nearest squad based on GPS coordinates and zone coverage areas.
            </p>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Coverage Areas</h4>
            <p className="text-gray-600">
              Each squad has designated coverage zones to ensure efficient response times and optimal resource allocation.
            </p>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Real-time Updates</h4>
            <p className="text-gray-600">
              Squad status and member availability are updated in real-time to ensure optimal complaint routing.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SquadManagement; 