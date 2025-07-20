import React from 'react';
import { MapPin, AlertTriangle, Users } from 'lucide-react';
import formatDate from '../../utils/formatDate';

const RelatedComplaints = ({ complaints, currentComplaintId, onViewComplaint }) => {
  // Filter out the current complaint and get related ones
  const relatedComplaints = complaints
    .filter(complaint => complaint._id !== currentComplaintId)
    .slice(0, 3); // Show max 3 related complaints

  if (relatedComplaints.length === 0) {
    return null;
  }

  return (
    <div className="mt-6 p-4 bg-blue-50 rounded-lg">
      <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
        <Users className="h-5 w-5 mr-2 text-blue-600" />
        Related Issues in Your Area
      </h3>
      <div className="space-y-3">
        {relatedComplaints.map(complaint => (
          <div 
            key={complaint._id} 
            className="bg-white p-3 rounded-lg border border-blue-200 hover:border-blue-300 transition-colors cursor-pointer"
            onClick={() => onViewComplaint(complaint)}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h4 className="font-medium text-gray-900 text-sm mb-1">{complaint.title}</h4>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span className={`px-2 py-1 rounded-full ${
                    complaint.severity === 'high' ? 'bg-red-100 text-red-800' :
                    complaint.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {complaint.severity}
                  </span>
                  <span className="px-2 py-1 rounded-full bg-gray-100 text-gray-800">
                    {complaint.status.replace('_', ' ')}
                  </span>
                  <span>{formatDate(complaint.createdAt)}</span>
                </div>
                {complaint.location?.address && (
                  <div className="flex items-center text-xs text-gray-500 mt-1">
                    <MapPin className="h-3 w-3 mr-1" />
                    {complaint.location.address}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <AlertTriangle className="h-3 w-3" />
                <span>{complaint.upvotes?.length || 0} affected</span>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-3 text-xs text-gray-600">
        💡 <strong>Tip:</strong> Upvote complaints that affect you too to help prioritize issues in your area.
      </div>
    </div>
  );
};

export default RelatedComplaints; 