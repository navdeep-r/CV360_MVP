import React from 'react';
import { 
  Eye, 
  Clock, 
  AlertTriangle, 
  CheckCircle,
  MapPin,
  Calendar,
  FileText
} from 'lucide-react';
import formatDate from '../../utils/formatDate';

const ComplaintTable = ({ complaints, loading, onComplaintClick }) => {
  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'in_progress':
        return <AlertTriangle className="h-4 w-4 text-blue-500" />;
      case 'resolved':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'low':
        return 'bg-green-100 text-green-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'critical':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'resolved':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getDaysOpen = (createdAt) => {
    const created = new Date(createdAt);
    const now = new Date();
    const diffTime = Math.abs(now - created);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getEscalationStatus = (complaint) => {
    const daysOpen = getDaysOpen(complaint.createdAt);
    if (daysOpen > 7) return 'red';
    if (daysOpen > 3) return 'yellow';
    return 'green';
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          <span className="ml-2 text-gray-600">Loading complaints...</span>
        </div>
      </div>
    );
  }

  if (complaints.length === 0) {
    return (
      <div className="p-6">
        <div className="text-center py-8">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No complaints found matching your filters.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Title
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Category
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Severity
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Location
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Days Open
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {complaints.map((complaint) => {
            const daysOpen = getDaysOpen(complaint.createdAt);
            const escalationStatus = getEscalationStatus(complaint);
            
            return (
              <tr 
                key={complaint._id} 
                className="hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() => onComplaintClick(complaint)}
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                        <span className="text-sm font-medium text-indigo-600">
                          {complaint.title.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {complaint.title}
                      </div>
                      <div className="text-sm text-gray-500">
                        ID: {complaint._id.slice(-8)}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full capitalize">
                    {complaint.category}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getSeverityColor(complaint.severity)}`}>
                    {complaint.severity}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center text-sm text-gray-900">
                    <MapPin className="h-4 w-4 mr-1 text-gray-400" />
                    {complaint.location?.address || 'No location'}
                  </div>
                  {complaint.location?.zone && (
                    <div className="text-xs text-gray-500">
                      Zone: {complaint.location.zone}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    {getStatusIcon(complaint.status)}
                    <span className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(complaint.status)}`}>
                      {complaint.status.replace('_', ' ')}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1 text-gray-400" />
                    <span className={`text-sm font-medium ${
                      escalationStatus === 'red' ? 'text-red-600' :
                      escalationStatus === 'yellow' ? 'text-yellow-600' :
                      'text-gray-900'
                    }`}>
                      {daysOpen} day{daysOpen !== 1 ? 's' : ''}
                    </span>
                    {escalationStatus !== 'green' && (
                      <span className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${
                        escalationStatus === 'red' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {escalationStatus === 'red' ? 'Overdue' : 'Warning'}
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onComplaintClick(complaint);
                    }}
                    className="text-indigo-600 hover:text-indigo-900 flex items-center"
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    View
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default ComplaintTable; 