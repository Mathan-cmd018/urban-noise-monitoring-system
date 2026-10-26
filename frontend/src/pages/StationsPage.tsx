import React, { useEffect, useState } from 'react';
import { Radio, Plus, MapPin, Activity, AlertCircle, RefreshCw, X } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { getSeverity, SEVERITY_COLORS } from '../utils/constants';
import { MonitoringStation, AreaType } from '../types';

export const StationsPage: React.FC = () => {
  const [stations, setStations] = useState<MonitoringStation[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterArea, setFilterArea] = useState<string>('All');
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    stationId: '',
    name: '',
    location: '',
    latitude: 40.7128,
    longitude: -74.006,
    areaType: 'Residential' as AreaType,
    status: 'Active' as const,
  });

  const { user } = useAuth();
  const { showToast } = useToast();
  const isAdmin = user?.role === 'Admin';

  const fetchStations = async () => {
    try {
      const res = await api.get('/stations');
      setStations(res.data.data);
    } catch (err) {
      showToast('Failed to load stations', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStations();
    const interval = setInterval(fetchStations, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleCreateStation = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/stations', formData);
      showToast('Monitoring station provisioned successfully', 'success');
      setShowModal(false);
      fetchStations();
      setFormData({
        stationId: '',
        name: '',
        location: '',
        latitude: 40.7128,
        longitude: -74.006,
        areaType: 'Residential',
        status: 'Active',
      });
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Error creating station', 'error');
    }
  };

  const filteredStations =
    filterArea === 'All'
      ? stations
      : stations.filter((s) => s.areaType === filterArea);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Monitoring Stations</h2>
          <p className="text-xs text-slate-400">
            Acoustic sensor nodes deployed across municipal zones with simulated telemetry.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchStations}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          {isAdmin && (
            <button
              onClick={() => setShowModal(true)}
              className="px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs flex items-center gap-2 transition-all shadow-lg shadow-sky-500/20"
            >
              <Plus className="w-4 h-4" />
              Provision New Station
            </button>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-800 text-xs">
        {['All', 'Residential', 'Commercial', 'Industrial', 'Silent Zone', 'Mixed Zone'].map(
          (area) => (
            <button
              key={area}
              onClick={() => setFilterArea(area)}
              className={`px-3.5 py-1.5 rounded-lg font-medium transition-colors ${
                filterArea === area
                  ? 'bg-sky-500/20 text-sky-400 border border-sky-500/40'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              {area}
            </button>
          )
        )}
      </div>

      {/* Station Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredStations.map((station) => {
          const severity = getSeverity(station.currentNoiseLevel);
          const badgeStyle = SEVERITY_COLORS[severity];

          return (
            <div
              key={station.stationId}
              className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                      {station.stationId}
                    </span>
                    <h3 className="text-base font-bold text-white mt-1.5">{station.name}</h3>
                  </div>
                  <span className={`text-xs px-2.5 py-1 rounded-lg border font-semibold ${badgeStyle}`}>
                    {severity}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-4">
                  <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  <span className="truncate">{station.location}</span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs bg-slate-950/60 p-3 rounded-xl border border-slate-800/80 mb-4">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase block">Area Type</span>
                    <span className="font-medium text-slate-300">{station.areaType}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase block">Node Status</span>
                    <span className="font-semibold text-emerald-400 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                      {station.status}
                    </span>
                  </div>
                  <div className="col-span-2 pt-1 border-t border-slate-900 flex justify-between text-[10px] text-slate-400">
                    <span>Lat: {station.latitude}</span>
                    <span>Lng: {station.longitude}</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800/80 flex items-baseline justify-between">
                <div>
                  <span className="text-xs text-slate-400 block">Current Telemetry</span>
                  <span className="text-2xl font-black text-white">{station.currentNoiseLevel}</span>
                  <span className="text-xs text-slate-500 ml-1 font-mono">dB</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-500 block">Last packet</span>
                  <span className="text-[11px] text-slate-400 font-mono">
                    {new Date(station.lastUpdated).toLocaleTimeString()}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Provision Station Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-5">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Radio className="w-5 h-5 text-sky-400" />
                Provision Acoustic Monitoring Station
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateStation} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Station ID</label>
                  <input
                    type="text"
                    required
                    value={formData.stationId}
                    onChange={(e) => setFormData({ ...formData, stationId: e.target.value.toUpperCase() })}
                    placeholder="STA-RES-03"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-100 uppercase"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Area Type</label>
                  <select
                    value={formData.areaType}
                    onChange={(e) => setFormData({ ...formData, areaType: e.target.value as AreaType })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-100"
                  >
                    <option value="Residential">Residential</option>
                    <option value="Commercial">Commercial</option>
                    <option value="Industrial">Industrial</option>
                    <option value="Silent Zone">Silent Zone</option>
                    <option value="Mixed Zone">Mixed Zone</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Station Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Highland Community Center Sensor"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Location Address</label>
                <input
                  type="text"
                  required
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="24 Highland Ave, Sector 9"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Latitude</label>
                  <input
                    type="number"
                    step="0.0001"
                    required
                    value={formData.latitude}
                    onChange={(e) => setFormData({ ...formData, latitude: parseFloat(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Longitude</label>
                  <input
                    type="number"
                    step="0.0001"
                    required
                    value={formData.longitude}
                    onChange={(e) => setFormData({ ...formData, longitude: parseFloat(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-100"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-bold shadow-lg shadow-sky-500/20"
                >
                  Deploy Station
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
