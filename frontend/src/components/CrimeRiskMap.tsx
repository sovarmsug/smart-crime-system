import React, { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet default icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface CrimeHotspot {
  id: string;
  lat: number;
  lng: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  location: string;
  incidentCount: number;
  lastIncident: string;
  description: string;
}

interface CrimeRiskMapProps {
  center?: [number, number];
  zoom?: number;
  height?: string;
}

const CrimeRiskMap: React.FC<CrimeRiskMapProps> = ({ 
  center = [0.3476, 32.5825], // Kampala coordinates
  zoom = 12,
  height = '400px'
}) => {
  const [hotspots, setHotspots] = useState<CrimeHotspot[]>([]);
  const [selectedHotspot, setSelectedHotspot] = useState<CrimeHotspot | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const mapRef = useRef<L.Map | null>(null);

  // Mock data for demonstration - in production, this would come from your API
  useEffect(() => {
    const mockHotspots: CrimeHotspot[] = [
      {
        id: '1',
        lat: 0.3476,
        lng: 32.5825,
        riskLevel: 'critical',
        location: 'Kampala City Center',
        incidentCount: 45,
        lastIncident: '2024-01-15T14:30:00Z',
        description: 'High crime area with frequent theft and assault incidents'
      },
      {
        id: '2',
        lat: 0.3176,
        lng: 32.5725,
        riskLevel: 'high',
        location: 'Nakawa Division',
        incidentCount: 28,
        lastIncident: '2024-01-15T12:15:00Z',
        description: 'Elevated risk of burglary and vehicle theft'
      },
      {
        id: '3',
        lat: 0.3576,
        lng: 32.6025,
        riskLevel: 'medium',
        location: 'Makindye Division',
        incidentCount: 15,
        lastIncident: '2024-01-14T18:45:00Z',
        description: 'Moderate risk with occasional property crimes'
      },
      {
        id: '4',
        lat: 0.3276,
        lng: 32.5525,
        riskLevel: 'medium',
        location: 'Lubaga Division',
        incidentCount: 12,
        lastIncident: '2024-01-15T09:20:00Z',
        description: 'Medium risk area with reported vandalism'
      },
      {
        id: '5',
        lat: 0.3376,
        lng: 32.6325,
        riskLevel: 'low',
        location: 'Kawempe Division',
        incidentCount: 5,
        lastIncident: '2024-01-13T16:30:00Z',
        description: 'Low risk area with minimal incidents'
      },
      {
        id: '6',
        lat: 0.3676,
        lng: 32.5625,
        riskLevel: 'high',
        location: 'Kampala Industrial Area',
        incidentCount: 22,
        lastIncident: '2024-01-15T11:00:00Z',
        description: 'High risk zone for commercial crimes'
      }
    ];

    // Simulate loading delay
    setTimeout(() => {
      setHotspots(mockHotspots);
      setIsLoading(false);
    }, 1000);
  }, []);

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'critical': return '#dc2626';
      case 'high': return '#f97316';
      case 'medium': return '#eab308';
      case 'low': return '#22c55e';
      default: return '#6b7280';
    }
  };

  const getRiskRadius = (riskLevel: string) => {
    switch (riskLevel) {
      case 'critical': return 800;
      case 'high': return 600;
      case 'medium': return 400;
      case 'low': return 200;
      default: return 200;
    }
  };

  const getRiskOpacity = (riskLevel: string) => {
    switch (riskLevel) {
      case 'critical': return 0.4;
      case 'high': return 0.3;
      case 'medium': return 0.2;
      case 'low': return 0.1;
      default: return 0.1;
    }
  };

  const createCustomIcon = (riskLevel: string) => {
    const color = getRiskColor(riskLevel);
    return L.divIcon({
      html: `
        <div style="
          background-color: ${color};
          width: 20px;
          height: 20px;
          border-radius: 50%;
          border: 3px solid white;
          box-shadow: 0 2px 4px rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: bold;
          font-size: 10px;
        ">
          ${riskLevel.charAt(0).toUpperCase()}
        </div>
      `,
      className: 'custom-div-icon',
      iconSize: [20, 20],
      iconAnchor: [10, 10],
    });
  };

  const MapController = () => {
    const map = useMap();
    
    useEffect(() => {
      mapRef.current = map;
    }, [map]);

    return null;
  };

  if (isLoading) {
    return (
      <div className="w-full h-96 bg-gray-100 rounded-lg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading crime risk map...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full rounded-lg overflow-hidden shadow-lg">
      <div className="bg-white p-4 border-b">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Live Crime Risk Map</h3>
          <div className="flex items-center space-x-4 text-sm">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-red-600 rounded-full mr-1"></div>
              <span>Critical</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-orange-500 rounded-full mr-1"></div>
              <span>High</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-yellow-500 rounded-full mr-1"></div>
              <span>Medium</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-1"></div>
              <span>Low</span>
            </div>
          </div>
        </div>
      </div>
      
      <div style={{ height }}>
        <MapContainer
          center={center}
          zoom={zoom}
          style={{ height: '100%', width: '100%' }}
          className="z-10"
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          
          <MapController />
          
          {/* Risk zones (circles) */}
          {hotspots.map((hotspot) => (
            <Circle
              key={`circle-${hotspot.id}`}
              center={[hotspot.lat, hotspot.lng]}
              radius={getRiskRadius(hotspot.riskLevel)}
              pathOptions={{
                color: getRiskColor(hotspot.riskLevel),
                fillColor: getRiskColor(hotspot.riskLevel),
                fillOpacity: getRiskOpacity(hotspot.riskLevel),
                weight: 2,
              }}
            />
          ))}
          
          {/* Risk markers */}
          {hotspots.map((hotspot) => (
            <Marker
              key={`marker-${hotspot.id}`}
              position={[hotspot.lat, hotspot.lng]}
              icon={createCustomIcon(hotspot.riskLevel)}
              eventHandlers={{
                click: () => setSelectedHotspot(hotspot),
              }}
            >
              <Popup>
                <div className="p-2 min-w-48">
                  <h4 className="font-semibold text-gray-900 mb-2">{hotspot.location}</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex items-center">
                      <span className="font-medium">Risk Level:</span>
                      <span className={`ml-2 px-2 py-1 rounded text-xs text-white`} style={{ backgroundColor: getRiskColor(hotspot.riskLevel) }}>
                        {hotspot.riskLevel.toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium">Incidents:</span> {hotspot.incidentCount} in last 30 days
                    </div>
                    <div>
                      <span className="font-medium">Last Incident:</span> {new Date(hotspot.lastIncident).toLocaleDateString()}
                    </div>
                    <div className="pt-2 border-t">
                      <p className="text-gray-600 text-xs">{hotspot.description}</p>
                    </div>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
      
      {selectedHotspot && (
        <div className="bg-gray-50 p-4 border-t">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold text-gray-900">{selectedHotspot.location}</h4>
              <p className="text-sm text-gray-600">{selectedHotspot.description}</p>
              <div className="flex items-center space-x-4 mt-2 text-sm">
                <span className="font-medium">Risk:</span>
                <span className={`px-2 py-1 rounded text-xs text-white`} style={{ backgroundColor: getRiskColor(selectedHotspot.riskLevel) }}>
                  {selectedHotspot.riskLevel.toUpperCase()}
                </span>
                <span className="font-medium">Incidents:</span> {selectedHotspot.incidentCount}
              </div>
            </div>
            <button
              onClick={() => setSelectedHotspot(null)}
              className="text-gray-400 hover:text-gray-600"
            >
              ×
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CrimeRiskMap;
