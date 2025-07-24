import React from 'react';
import { MapPin } from 'lucide-react';

const HeatmapVisualization = ({ complaints, onZoneClick, selectedZone }) => {
  // Define zones and their coordinates for the heatmap (India locations)
  const zones = [
    { id: 'downtown', name: 'Downtown Mumbai', x: 20, y: 30, width: 60, height: 40, squad: 'Alpha' },
    { id: 'residential', name: 'Residential Mumbai', x: 10, y: 10, width: 40, height: 30, squad: 'Beta' },
    { id: 'commercial', name: 'Commercial Mumbai', x: 60, y: 10, width: 30, height: 30, squad: 'Gamma' },
    { id: 'industrial', name: 'Industrial Mumbai', x: 10, y: 70, width: 80, height: 20, squad: 'Alpha' },
    { id: 'suburban', name: 'Suburban Mumbai', x: 70, y: 40, width: 20, height: 30, squad: 'Beta' }
  ];

  // Calculate complaint count for each zone
  const getZoneComplaintCount = (zoneId) => {
    return complaints.filter(complaint => 
      complaint.location?.zone === zoneId || 
      (complaint.location?.address && complaint.location.address.toLowerCase().includes(zoneId))
    ).length;
  };

  // Get color intensity based on complaint count
  const getZoneColor = (count) => {
    if (count === 0) return 'bg-gray-100';
    if (count <= 2) return 'bg-green-200';
    if (count <= 5) return 'bg-yellow-200';
    if (count <= 10) return 'bg-orange-200';
    return 'bg-red-200';
  };

  // Get text color based on background
  const getTextColor = (count) => {
    if (count === 0) return 'text-gray-500';
    if (count <= 2) return 'text-green-800';
    if (count <= 5) return 'text-yellow-800';
    if (count <= 10) return 'text-orange-800';
    return 'text-red-800';
  };

  const totalComplaints = complaints.length;

  return (
    <div className="space-y-4">
      {/* Heatmap */}
      <div className="relative bg-gray-50 rounded-lg p-4" style={{ height: '200px' }}>
        {zones.map((zone) => {
          const count = getZoneComplaintCount(zone.id);
          const isSelected = selectedZone === zone.id;
          
          return (
            <div
              key={zone.id}
              className={`absolute border-2 cursor-pointer transition-all duration-200 rounded ${
                getZoneColor(count)
              } ${isSelected ? 'border-blue-500 shadow-lg' : 'border-gray-300'}`}
              style={{
                left: `${zone.x}%`,
                top: `${zone.y}%`,
                width: `${zone.width}%`,
                height: `${zone.height}%`
              }}
              onClick={() => onZoneClick(zone.id)}
            >
              <div className="flex flex-col items-center justify-center h-full p-2">
                <span className={`text-xs font-bold ${getTextColor(count)}`}>
                  {count}
                </span>
                <span className={`text-xs ${getTextColor(count)}`}>
                  {zone.name}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-gray-600">
          <span>Complaint Density</span>
          <span>Total: {totalComplaints}</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-gray-100 rounded"></div>
            <span className="text-xs text-gray-600">0</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-green-200 rounded"></div>
            <span className="text-xs text-gray-600">1-2</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-yellow-200 rounded"></div>
            <span className="text-xs text-gray-600">3-5</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-orange-200 rounded"></div>
            <span className="text-xs text-gray-600">6-10</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-red-200 rounded"></div>
            <span className="text-xs text-gray-600">10+</span>
          </div>
        </div>
      </div>

      {/* Zone Details */}
      <div className="space-y-2">
        <h4 className="text-sm font-medium text-gray-900">Zone Details</h4>
        <div className="space-y-1">
          {zones.map((zone) => {
            const count = getZoneComplaintCount(zone.id);
            const percentage = totalComplaints > 0 ? ((count / totalComplaints) * 100).toFixed(1) : 0;
            
            return (
              <div
                key={zone.id}
                className={`flex items-center justify-between p-2 rounded text-xs cursor-pointer transition-colors ${
                  selectedZone === zone.id ? 'bg-blue-50 text-blue-800' : 'hover:bg-gray-50'
                }`}
                onClick={() => onZoneClick(zone.id)}
              >
                <div className="flex items-center">
                  <MapPin className="h-3 w-3 mr-1" />
                  <span className="font-medium">{zone.name}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getZoneColor(count)} ${getTextColor(count)}`}>
                    {count}
                  </span>
                  <span className="text-gray-500">{percentage}%</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Instructions */}
      <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
        💡 Click on any zone to filter complaints by location. Click again to clear the filter.
      </div>
    </div>
  );
};

export default HeatmapVisualization; 