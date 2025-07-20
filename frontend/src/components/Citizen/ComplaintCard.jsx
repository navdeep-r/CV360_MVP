// ComplaintCard.jsx
import React from 'react';
import UpvoteButton from './UpvoteButton';
import { AlertCircle, Calendar } from 'lucide-react';
import formatDate from '../../utils/formatDate';

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  in_progress: 'bg-blue-100 text-blue-800',
  resolved: 'bg-green-100 text-green-800',
  closed: 'bg-gray-100 text-gray-800',
};
const severityColors = {
  low: 'bg-green-100 text-green-800',
  medium: 'bg-yellow-100 text-yellow-800',
  high: 'bg-orange-100 text-orange-800',
  critical: 'bg-red-100 text-red-800',
};

const ComplaintCard = ({ complaint, onUpvote, onView }) => {
  return (
    <div className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow flex flex-col gap-2">
      <div className="flex justify-between items-start mb-2">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">{complaint.title}</h3>
          <div className="flex flex-wrap gap-2 mb-1">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[complaint.status]}`}>{complaint.status.replace('_', ' ')}</span>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${severityColors[complaint.severity]}`}>{complaint.severity}</span>
            <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">{complaint.category}</span>
          </div>
          <div className="flex items-center text-sm text-gray-500">
            <Calendar className="h-4 w-4 mr-1" />
            {formatDate(complaint.createdAt)}
          </div>
        </div>
        {complaint.escalationStatus && complaint.escalationStatus.level && complaint.escalationStatus.level !== 'green' && (
          <div className="ml-4">
            <AlertCircle className={`h-5 w-5 ${complaint.escalationStatus.level === 'red' ? 'text-red-500' : 'text-yellow-500'}`} />
          </div>
        )}
      </div>
      <p className="text-gray-600 text-sm line-clamp-2 mb-3">{complaint.description}</p>
      
      {complaint.location?.address && (
        <div className="text-sm text-gray-500 mb-3">
          📍 {complaint.location.address}
        </div>
      )}
      
      <div className="flex items-center justify-between mt-auto">
        <div className="flex items-center gap-3">
          <UpvoteButton 
            count={complaint.upvotes?.length || 0} 
            upvoted={complaint.upvoted} 
            onClick={() => onUpvote?.(complaint._id)} 
          />
          <div className="text-xs text-gray-500">
            {complaint.upvotes?.length || 0} {complaint.upvotes?.length === 1 ? 'person' : 'people'} facing same issue
            {complaint.location?.address && (
              <span className="block text-gray-400">
                📍 {complaint.location.address}
              </span>
            )}
          </div>
        </div>
        <button
          onClick={() => onView?.(complaint)}
          className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
        >
          View Details
        </button>
      </div>
    </div>
  );
};

export default ComplaintCard; 