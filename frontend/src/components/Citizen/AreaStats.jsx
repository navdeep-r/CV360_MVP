import React from 'react';
import { MapPin, AlertTriangle, Users } from 'lucide-react';

const AreaStats = ({ complaints }) => {
  // Group complaints by area
  const areaStats = complaints.reduce((acc, complaint) => {
    const area = complaint.location?.address || 'Unknown Area';
    if (!acc[area]) {
      acc[area] = {
        total: 0,
        upvotes: 0,
        highSeverity: 0,
        pending: 0
      };
    }
    
    acc[area].total += 1;
    acc[area].upvotes += complaint.upvotes?.length || 0;
    if (complaint.severity === 'high' || complaint.severity === 'critical') {
      acc[area].highSeverity += 1;
    }
    if (complaint.status === 'pending') {
      acc[area].pending += 1;
    }
    
    return acc;
  }, {});

  // Convert to array and sort by total complaints
  const sortedAreas = Object.entries(areaStats)
    .map(([area, stats]) => ({ area, ...stats }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 5); // Show top 5 areas

  if (sortedAreas.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-semibold mb-4 text-gray-900 flex items-center">
        <MapPin className="h-5 w-5 mr-2 text-blue-600" />
        Issues by Area
      </h2>
      <div className="space-y-4">
        {sortedAreas.map(({ area, total, upvotes, highSeverity, pending }) => (
          <div key={area} className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium text-gray-900">{area}</h3>
              <span className="text-sm text-gray-500">{total} issues</span>
            </div>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-lg font-bold text-blue-600">{upvotes}</div>
                <div className="text-xs text-gray-500">People Affected</div>
              </div>
              <div>
                <div className="text-lg font-bold text-red-600">{highSeverity}</div>
                <div className="text-xs text-gray-500">High Priority</div>
              </div>
              <div>
                <div className="text-lg font-bold text-yellow-600">{pending}</div>
                <div className="text-xs text-gray-500">Pending</div>
              </div>
            </div>
            <div className="mt-2 text-xs text-gray-500">
              {upvotes > 0 ? `${upvotes} people affected by issues in this area` : 'No community impact yet'}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 text-xs text-gray-600 text-center">
        💡 Areas with more upvotes indicate higher community impact and priority
      </div>
    </div>
  );
};

export default AreaStats; 