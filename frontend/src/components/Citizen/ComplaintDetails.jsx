// ComplaintDetails.jsx
import React from 'react';
import Timeline from './Timeline';
import UpvoteButton from './UpvoteButton';
import RelatedComplaints from './RelatedComplaints';
import formatDate from '../../utils/formatDate';
import { AlertCircle, MapPin, Camera, FileText } from 'lucide-react';

const ComplaintDetails = ({ complaint, onUpvote, onBack, allComplaints, onViewComplaint }) => {
  if (!complaint) return <div className="text-gray-400 text-center py-8">No complaint selected.</div>;

  return (
    <div className="p-6 bg-white rounded shadow max-w-2xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-4">
          {onBack && (
            <button
              onClick={onBack}
              className="text-gray-500 hover:text-gray-700 transition-colors"
            >
              ← Back
            </button>
          )}
          <h2 className="text-2xl font-bold text-indigo-700">{complaint.title}</h2>
        </div>
        {complaint.escalationStatus?.level !== 'green' && (
          <AlertCircle className={`h-6 w-6 ${complaint.escalationStatus.level === 'red' ? 'text-red-500' : 'text-yellow-500'}`} title={complaint.escalationStatus.level + ' flag'} />
        )}
      </div>
      <div className="mb-2 text-gray-600">{complaint.description}</div>
      <div className="flex flex-wrap gap-2 mb-4">
        <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">{complaint.category}</span>
        <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">{complaint.severity}</span>
        <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">{complaint.status.replace('_', ' ')}</span>
        <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">{formatDate(complaint.createdAt)}</span>
      </div>
      {complaint.location?.address && (
        <div className="flex items-center text-sm text-gray-500 mb-2">
          <MapPin className="h-4 w-4 mr-1" />
          {complaint.location.address}
        </div>
      )}
      {/* Attachments */}
      {complaint.attachments?.length > 0 && (
        <div className="mb-4">
          <div className="font-medium text-gray-700 mb-1 flex items-center"><Camera className="h-4 w-4 mr-1" /> Attachments:</div>
          <div className="flex flex-wrap gap-2">
            {complaint.attachments.map((file, idx) => (
              <a key={idx} href={`/${file.path}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center px-2 py-1 bg-gray-100 rounded text-sm text-indigo-700 hover:underline">
                <FileText className="h-4 w-4 mr-1" />{file.originalName || file.filename}
              </a>
            ))}
          </div>
        </div>
      )}
      {/* Community Impact */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Community Impact</h3>
        <div className="flex items-center gap-4 mb-3">
          <UpvoteButton 
            count={complaint.upvotes?.length || 0} 
            upvoted={complaint.upvoted} 
            onClick={() => onUpvote?.(complaint._id)} 
          />
          <div className="text-sm text-gray-600">
            <div className="font-medium">
              {complaint.upvotes?.length || 0} {complaint.upvotes?.length === 1 ? 'person' : 'people'} facing the same issue
            </div>
            <div className="text-gray-500">
              {complaint.upvoted ? 'You have indicated this affects you too' : 'Click to indicate this affects you too'}
            </div>
          </div>
        </div>
        {complaint.location?.address && (
          <div className="text-sm text-gray-600">
            <span className="font-medium">Location:</span> {complaint.location.address}
          </div>
        )}
      </div>
      {/* Timeline */}
      <Timeline timeline={complaint.timeline || []} />
      
      {/* Related Complaints */}
      {allComplaints && (
        <RelatedComplaints 
          complaints={allComplaints} 
          currentComplaintId={complaint._id}
          onViewComplaint={onViewComplaint}
        />
      )}
    </div>
  );
};

export default ComplaintDetails; 