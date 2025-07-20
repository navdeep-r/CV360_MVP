import React from 'react';
import { TrendingUp, MapPin, Users } from 'lucide-react';
import formatDate from '../../utils/formatDate';

const TrendingIssues = ({ complaints, onViewComplaint }) => {
  // Get top 5 most upvoted complaints
  const trendingComplaints = complaints
    .filter(complaint => complaint.upvotes?.length > 0)
    .sort((a, b) => (b.upvotes?.length || 0) - (a.upvotes?.length || 0))
    .slice(0, 5);

  if (trendingComplaints.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-semibold mb-4 text-gray-900 flex items-center">
        <TrendingUp className="h-5 w-5 mr-2 text-orange-600" />
        Trending Issues in Your Community
      </h2>
      <div className="space-y-3">
        {trendingComplaints.map((complaint, index) => (
          <div 
            key={complaint._id} 
            className="p-3 border border-gray-200 rounded-lg hover:border-orange-300 transition-colors cursor-pointer"
            onClick={() => onViewComplaint(complaint)}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium text-gray-900">{complaint.title}</span>
                  {index < 3 && (
                    <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded-full">
                      #{index + 1} Trending
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
                  <span className={`px-2 py-1 rounded-full ${
                    complaint.severity === 'high' ? 'bg-red-100 text-red-800' :
                    complaint.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {complaint.severity}
                  </span>
                  <span className="px-2 py-1 rounded-full bg-gray-100 text-gray-800">
                    {complaint.category}
                  </span>
                </div>
                {complaint.location?.address && (
                  <div className="flex items-center text-xs text-gray-500">
                    <MapPin className="h-3 w-3 mr-1" />
                    {complaint.location.address}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2 text-sm text-orange-600 font-medium">
                <Users className="h-4 w-4" />
                <span>{complaint.upvotes?.length || 0}</span>
              </div>
            </div>
            <div className="mt-2 text-xs text-gray-500">
              {formatDate(complaint.createdAt)} • {complaint.upvotes?.length || 0} people affected
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 text-xs text-gray-600 text-center">
        💡 These are the most impactful issues in your community. Upvote if they affect you too!
      </div>
    </div>
  );
};

export default TrendingIssues; 