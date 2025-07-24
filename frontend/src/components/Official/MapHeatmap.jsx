import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import 'leaflet.heat';

// Mumbai center
const DEFAULT_CENTER = [19.0760, 72.8777];
const DEFAULT_ZOOM = 11;

const HeatLayer = ({ points }) => {
  const map = useMap();
  React.useEffect(() => {
    if (!map || !points.length) return;
    const heat = L.heatLayer(points, { radius: 25, blur: 18, maxZoom: 17 }).addTo(map);
    return () => { map.removeLayer(heat); };
  }, [map, points]);
  return null;
};

const MapHeatmap = ({ complaints }) => {
  // Extract points with coordinates
  const heatPoints = complaints
    .filter(c => c.location && c.location.coordinates && c.location.coordinates.lat && c.location.coordinates.lng)
    .map(c => [c.location.coordinates.lat, c.location.coordinates.lng, 0.7]); // 0.7 intensity

  // Fallback: show markers for complaints without coordinates
  const markerComplaints = complaints.filter(c => !c.location?.coordinates?.lat || !c.location?.coordinates?.lng);

  return (
    <div className="w-full h-[400px] rounded-lg overflow-hidden mb-4">
      <MapContainer center={DEFAULT_CENTER} zoom={DEFAULT_ZOOM} style={{ height: '100%', width: '100%' }} scrollWheelZoom={true}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {heatPoints.length > 0 && <HeatLayer points={heatPoints} />}
        {markerComplaints.map((c, idx) => (
          <Marker key={c._id || idx} position={DEFAULT_CENTER}>
            <Popup>
              <div>
                <strong>{c.title}</strong><br/>
                {c.location?.address}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default MapHeatmap; 