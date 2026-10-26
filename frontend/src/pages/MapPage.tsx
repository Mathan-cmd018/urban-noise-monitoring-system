import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import L from 'leaflet';
import { Radio, Flame, AlertTriangle, Layers, Info } from 'lucide-react';
import api from '../services/api';
import { getSeverity, SEVERITY_COLORS } from '../utils/constants';

// Create Leaflet HTML div icon helper
const createCustomIcon = (color: string, label: string) => {
  return L.divIcon({
    className: 'custom-map-marker',
    html: `
      <div style="
        background-color: ${color};
        width: 24px;
        height: 24px;
        border-radius: 50%;
        border: 2px solid #ffffff;
        box-shadow: 0 0 10px ${color};
        display: flex;
        align-items: center;
        justify-content: center;
        color: #ffffff;
        font-size: 10px;
        font-weight: bold;
      ">
        ${label}
      </div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -12],
  });
};

export const MapPage: React.FC = () => {
  const [stations, setStations] = useState<any[]>([]);
  const [hotspots, setHotspots] = useState<any[]>([]);
  const [complaints, setComplaints] = useState<any[]>([]);
  const [showStations, setShowStations] = useState(true);
  const [showHotspots, setShowHotspots] = useState(true);
  const [showComplaints, setShowComplaints] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [stRes, hotRes, cmpRes] = await Promise.all([
          api.get('/stations'),
          api.get('/hotspots'),
          api.get('/complaints'),
        ]);
        setStations(stRes.data.data);
        setHotspots(hotRes.data.data);
        setComplaints(cmpRes.data.data.filter((c: any) => c.latitude && c.longitude));
      } catch (e) {
        console.error('Failed to load geospatial data', e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const defaultCenter: [number, number] = [40.725, -74.005];

  return (
    <div className="space-y-4 h-[calc(100vh-7rem)] flex flex-col">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            Acoustic Geospatial Map
          </h2>
          <p className="text-xs text-slate-400">
            OpenStreetMap GIS visualization of monitoring nodes, high-risk hotspot buffers, and citizen grievances.
          </p>
        </div>

        {/* Layer Filters */}
        <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 p-1.5 rounded-xl text-xs">
          <span className="text-slate-400 text-[11px] px-2 flex items-center gap-1 font-semibold">
            <Layers className="w-3.5 h-3.5" /> Layers:
          </span>
          <button
            onClick={() => setShowStations(!showStations)}
            className={`px-2.5 py-1 rounded-lg transition-all ${
              showStations ? 'bg-sky-500/20 text-sky-400 border border-sky-500/40' : 'text-slate-500'
            }`}
          >
            Stations ({stations.length})
          </button>
          <button
            onClick={() => setShowHotspots(!showHotspots)}
            className={`px-2.5 py-1 rounded-lg transition-all ${
              showHotspots ? 'bg-orange-500/20 text-orange-400 border border-orange-500/40' : 'text-slate-500'
            }`}
          >
            Hotspots ({hotspots.length})
          </button>
          <button
            onClick={() => setShowComplaints(!showComplaints)}
            className={`px-2.5 py-1 rounded-lg transition-all ${
              showComplaints ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40' : 'text-slate-500'
            }`}
          >
            Complaints ({complaints.length})
          </button>
        </div>
      </div>

      {/* Interactive Map */}
      <div className="flex-1 rounded-2xl overflow-hidden border border-slate-800 relative z-0 shadow-2xl">
        <MapContainer center={defaultCenter} zoom={13} style={{ height: '100%', width: '100%' }}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* Monitoring Stations */}
          {showStations &&
            stations.map((station) => {
              const severity = getSeverity(station.currentNoiseLevel);
              const color =
                severity === 'Safe'
                  ? '#10b981'
                  : severity === 'Moderate'
                  ? '#f59e0b'
                  : severity === 'High'
                  ? '#f97316'
                  : '#ef4444';

              return (
                <Marker
                  key={`st-${station.stationId}`}
                  position={[station.latitude, station.longitude]}
                  icon={createCustomIcon(color, 'S')}
                >
                  <Popup>
                    <div className="p-1 text-slate-900">
                      <div className="font-bold text-sm">{station.name}</div>
                      <div className="text-xs text-slate-600 mb-2">{station.location}</div>
                      <div className="flex items-center justify-between text-xs py-1 border-t border-slate-200">
                        <span>Current Noise:</span>
                        <span className="font-bold font-mono" style={{ color }}>
                          {station.currentNoiseLevel} dB
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs py-0.5">
                        <span>Area Type:</span>
                        <span className="font-medium">{station.areaType}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs py-0.5">
                        <span>Status:</span>
                        <span className="font-medium text-emerald-600">{station.status}</span>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              );
            })}

          {/* Hotspot Risk Buffers */}
          {showHotspots &&
            hotspots.map((hotspot) => {
              const bufferColor =
                hotspot.riskLevel === 'Severe'
                  ? '#ef4444'
                  : hotspot.riskLevel === 'High'
                  ? '#f97316'
                  : hotspot.riskLevel === 'Moderate'
                  ? '#f59e0b'
                  : '#10b981';

              return (
                <React.Fragment key={`hot-${hotspot.stationId}`}>
                  <Circle
                    center={[hotspot.latitude, hotspot.longitude]}
                    radius={500}
                    pathOptions={{
                      color: bufferColor,
                      fillColor: bufferColor,
                      fillOpacity: 0.25,
                      weight: 1.5,
                    }}
                  />
                  <Marker
                    position={[hotspot.latitude, hotspot.longitude]}
                    icon={createCustomIcon(bufferColor, 'H')}
                  >
                    <Popup>
                      <div className="p-1 text-slate-900">
                        <div className="font-bold text-sm text-red-600 flex items-center gap-1">
                          Hotspot: {hotspot.area}
                        </div>
                        <div className="text-xs text-slate-600 mb-1">{hotspot.location}</div>
                        <div className="text-xs py-1 border-t border-slate-200">
                          <div>Risk Level: <b>{hotspot.riskLevel}</b></div>
                          <div>Avg dB: <b>{hotspot.averageDb} dB</b> (Max: {hotspot.maxDb} dB)</div>
                          <div>Threshold Violations: <b>{hotspot.violationCount}</b></div>
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                </React.Fragment>
              );
            })}

          {/* Citizen Complaints */}
          {showComplaints &&
            complaints.map((c) => (
              <Marker
                key={`cmp-${c.complaintId}`}
                position={[c.latitude, c.longitude]}
                icon={createCustomIcon('#8b5cf6', 'C')}
              >
                <Popup>
                  <div className="p-1 text-slate-900">
                    <div className="font-bold text-sm text-purple-700">{c.complaintId}</div>
                    <div className="text-xs font-semibold">{c.category}</div>
                    <div className="text-xs text-slate-600 my-1">{c.description}</div>
                    <div className="flex items-center justify-between text-xs py-1 border-t border-slate-200">
                      <span>Status:</span>
                      <span className="font-bold">{c.status}</span>
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}
        </MapContainer>
      </div>
    </div>
  );
};
