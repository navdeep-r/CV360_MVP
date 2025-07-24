import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.heat';

// Fix for default markers in React Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const InteractiveMap = ({ complaints, onZoneClick, selectedZone }) => {
  const mapRef = useRef();
  const heatmapLayerRef = useRef();

  // Define zone boundaries and centers (India locations)
  const zones = {
    downtown: {
      center: [19.0760, 72.8777], // Mumbai downtown
      bounds: [[19.0690, 72.8687], [19.0830, 72.8867]],
      name: 'Downtown Mumbai',
      squad: 'Alpha'
    },
    residential: {
      center: [19.2183, 72.9781], // Mumbai residential
      bounds: [[19.2093, 72.9691], [19.2273, 72.9871]],
      name: 'Residential Mumbai',
      squad: 'Beta'
    },
    commercial: {
      center: [19.0170, 72.8476], // Mumbai commercial
      bounds: [[19.0080, 72.8386], [19.0260, 72.8566]],
      name: 'Commercial Mumbai',
      squad: 'Gamma'
    },
    industrial: {
      center: [19.0760, 72.8777], // Mumbai industrial
      bounds: [[19.0670, 72.8687], [19.0850, 72.8867]],
      name: 'Industrial Mumbai',
      squad: 'Alpha'
    },
    suburban: {
      center: [19.2183, 72.9781], // Mumbai suburban
      bounds: [[19.2093, 72.9691], [19.2273, 72.9871]],
      name: 'Suburban Mumbai',
      squad: 'Beta'
    }
  };

  // Generate heatmap data from complaints
  const generateHeatmapData = () => {
    const heatmapData = [];
    
    complaints.forEach(complaint => {
      const intensity = getComplaintIntensity(complaint);
      
      // Use precise coordinates if available
      if (complaint.location?.coordinates) {
        const { lat, lng } = complaint.location.coordinates;
        heatmapData.push([lat, lng, intensity]);
      } 
      // Fall back to zone-based distribution if no precise coordinates
      else if (complaint.location?.zone && zones[complaint.location.zone]) {
        const zone = zones[complaint.location.zone];
        
        // Add multiple points around the zone center for better heatmap visualization
        for (let i = 0; i < intensity; i++) {
          const lat = zone.center[0] + (Math.random() - 0.5) * 0.01;
          const lng = zone.center[1] + (Math.random() - 0.5) * 0.01;
          heatmapData.push([lat, lng, intensity]);
        }
      }
    });
    
    return heatmapData;
  };

  // Calculate complaint intensity based on severity and status
  const getComplaintIntensity = (complaint) => {
    let intensity = 1;
    
    // Severity multiplier
    switch (complaint.severity) {
      case 'low': intensity *= 1; break;
      case 'medium': intensity *= 2; break;
      case 'high': intensity *= 3; break;
      case 'critical': intensity *= 4; break;
      default: intensity *= 1;
    }
    
    // Status multiplier (pending complaints get higher intensity)
    if (complaint.status === 'pending') {
      intensity *= 1.5;
    }
    
    return intensity;
  };

  // Get zone color based on complaint count
  const getZoneColor = (zoneId) => {
    const zoneComplaints = complaints.filter(c => c.location?.zone === zoneId);
    const count = zoneComplaints.length;
    
    if (count === 0) return '#e5e7eb';
    if (count <= 2) return '#10b981';
    if (count <= 5) return '#f59e0b';
    if (count <= 10) return '#f97316';
    return '#ef4444';
  };

  // Handle zone click
  const handleZoneClick = (zoneId) => {
    if (onZoneClick) {
      onZoneClick(zoneId);
    }
  };

  useEffect(() => {
    if (mapRef.current && complaints.length > 0) {
      // Remove existing heatmap layer
      if (heatmapLayerRef.current) {
        mapRef.current.removeLayer(heatmapLayerRef.current);
        heatmapLayerRef.current = null;
      }

      // Create new heatmap layer
      const heatmapData = generateHeatmapData();
      if (heatmapData.length > 0) {
        heatmapLayerRef.current = L.heatLayer(heatmapData, {
          radius: 25,
          blur: 15,
          maxZoom: 10,
          gradient: {
            0.4: '#10b981',
            0.6: '#f59e0b',
            0.8: '#f97316',
            1.0: '#ef4444'
          }
        });
        heatmapLayerRef.current.addTo(mapRef.current);
      }
    }
    // Clean up heatmap layer on unmount
    return () => {
      if (mapRef.current && heatmapLayerRef.current) {
        mapRef.current.removeLayer(heatmapLayerRef.current);
        heatmapLayerRef.current = null;
      }
    };
  }, [complaints]);

  return (
    <div className="w-full h-96 rounded-lg overflow-hidden" style={{zIndex: 0}}>
      <MapContainer
        center={[19.0760, 72.8777]}
        zoom={12}
        style={{ height: '100%', width: '100%' }}
        ref={mapRef}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        
        {/* Zone Boundaries */}
        {Object.entries(zones).map(([zoneId, zone]) => {
          const zoneComplaints = complaints.filter(c => c.location?.zone === zoneId);
          const isSelected = selectedZone === zoneId;
          
          return (
            <Circle
              key={zoneId}
              center={zone.center}
              radius={500}
              pathOptions={{
                color: isSelected ? '#3b82f6' : getZoneColor(zoneId),
                fillColor: getZoneColor(zoneId),
                fillOpacity: 0.3,
                weight: isSelected ? 3 : 2
              }}
              eventHandlers={{
                click: () => handleZoneClick(zoneId)
              }}
            >
              <Popup>
                <div className="p-2">
                  <h3 className="font-semibold text-gray-900">{zone.name}</h3>
                  <p className="text-sm text-gray-600">
                    Complaints: {zoneComplaints.length}
                  </p>
                  <div className="mt-2 space-y-1">
                    {zoneComplaints.slice(0, 3).map(complaint => (
                      <div key={complaint._id} className="text-xs">
                        • {complaint.title}
                      </div>
                    ))}
                    {zoneComplaints.length > 3 && (
                      <div className="text-xs text-gray-500">
                        +{zoneComplaints.length - 3} more...
                      </div>
                    )}
                  </div>
                </div>
              </Popup>
            </Circle>
          );
        })}

        {/* Complaint Markers with Precise Coordinates */}
        {complaints.map(complaint => {
          // Use precise coordinates if available, otherwise fall back to zone center
          const coordinates = complaint.location?.coordinates 
            ? [complaint.location.coordinates.lat, complaint.location.coordinates.lng]
            : (complaint.location?.zone && zones[complaint.location.zone] 
                ? zones[complaint.location.zone].center 
                : null);

          if (!coordinates) return null;
          
          const getMarkerColor = () => {
            switch (complaint.severity) {
              case 'low': return '#10b981';
              case 'medium': return '#f59e0b';
              case 'high': return '#f97316';
              case 'critical': return '#ef4444';
              default: return '#6b7280';
            }
          };

          const getMarkerSize = () => {
            switch (complaint.severity) {
              case 'low': return 8;
              case 'medium': return 12;
              case 'high': return 16;
              case 'critical': return 20;
              default: return 10;
            }
          };

          const getMarkerOpacity = () => {
            // Higher opacity for pending complaints
            return complaint.status === 'pending' ? 0.9 : 0.7;
          };

          return (
            <Circle
              key={complaint._id}
              center={coordinates}
              radius={getMarkerSize()}
              pathOptions={{
                color: getMarkerColor(),
                fillColor: getMarkerColor(),
                fillOpacity: getMarkerOpacity(),
                weight: 2
              }}
            >
              <Popup>
                <div className="p-3 min-w-64">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-gray-900 text-sm">{complaint.title}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      complaint.severity === 'low' ? 'bg-green-100 text-green-800' :
                      complaint.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      complaint.severity === 'high' ? 'bg-orange-100 text-orange-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {complaint.severity.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">{complaint.description}</p>
                  <div className="space-y-1 text-xs text-gray-700">
                    <div className="flex justify-between">
                      <span><strong>Category:</strong></span>
                      <span>{complaint.category}</span>
                    </div>
                    <div className="flex justify-between">
                      <span><strong>Status:</strong></span>
                      <span className={`${
                        complaint.status === 'pending' ? 'text-red-600' :
                        complaint.status === 'in_progress' ? 'text-blue-600' :
                        'text-green-600'
                      }`}>
                        {complaint.status.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span><strong>Zone:</strong></span>
                      <span>{complaint.location?.zone || 'Unknown'}</span>
                    </div>
                    {complaint.location?.coordinates && (
                      <div className="flex justify-between">
                        <span><strong>Coordinates:</strong></span>
                        <span className="font-mono text-xs">
                          {complaint.location.coordinates.lat.toFixed(6)}, {complaint.location.coordinates.lng.toFixed(6)}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span><strong>Created:</strong></span>
                      <span>{new Date(complaint.createdAt).toLocaleDateString()}</span>
                    </div>
                    {complaint.citizenId?.name && (
                      <div className="flex justify-between">
                        <span><strong>Citizen:</strong></span>
                        <span>{complaint.citizenId.name}</span>
                      </div>
                    )}
                  </div>
                </div>
              </Popup>
            </Circle>
          );
        })}
      </MapContainer>
    </div>
  );
};

export default InteractiveMap; 