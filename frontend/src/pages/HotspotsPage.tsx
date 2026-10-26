import React, { useEffect, useState } from 'react';
import { Flame, AlertTriangle, ShieldAlert, MapPin, RefreshCw, Activity } from 'lucide-react';
import api from '../services/api';
import { useToast } from '../context/ToastContext';

export const HotspotsPage: React.FC = () => {
  const [hotspots, setHotspots] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  const fetchHotspots = async () => {
    try {
      const res = await api.get('/hotspots');
      setHotspots(res.data.data);
    } catch (err) {
      showToast('Failed to load hotspot intelligence', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHotspots();
    const interval = setInterval(fetchHotspots, 8000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Flame className="w-6 h-6 text-orange-500" />
            Noise Hotspot Intelligence &amp; Risk Ranking
          </h2>
          <p className="text-xs text-slate-400">
            Algorithmic spatial detection of persistent noise violators, regulatory breaches, and community friction.
          </p>
        </div>

        <button
          onClick={fetchHotspots}
          className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {hotspots.map((spot, idx) => {
          const isHighOrSevere = spot.riskLevel === 'Severe' || spot.riskLevel === 'High';

          return (
            <div
              key={spot.stationId}
              className={`p-5 rounded-2xl bg-slate-900/80 border transition-all flex flex-col justify-between ${
                spot.riskLevel === 'Severe'
                  ? 'border-rose-700/80 shadow-rose-950/20 shadow-lg'
                  : spot.riskLevel === 'High'
                  ? 'border-orange-700/80 shadow-orange-950/20 shadow-lg'
                  : 'border-slate-800'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-400">
                    Rank #{idx + 1}
                  </span>
                  <span
                    className={`text-xs px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                      spot.riskLevel === 'Severe'
                        ? 'bg-rose-950 text-rose-300 border border-rose-800'
                        : spot.riskLevel === 'High'
                        ? 'bg-orange-950 text-orange-300 border border-orange-800'
                        : spot.riskLevel === 'Moderate'
                        ? 'bg-amber-950 text-amber-300 border border-amber-800'
                        : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                    }`}
                  >
                    {spot.riskLevel} Risk
                  </span>
                </div>

                <h3 className="text-base font-bold text-white mb-1">{spot.area}</h3>
                <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-4">
                  <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  <span className="truncate">{spot.location}</span>
                </div>

                {/* Hotspot Metrics Grid */}
                <div className="grid grid-cols-2 gap-2 text-xs bg-slate-950/60 p-3 rounded-xl border border-slate-800/80 mb-4">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase block">Average Level</span>
                    <span className="font-extrabold text-white text-sm">{spot.averageDb} dB</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase block">Peak Level</span>
                    <span className="font-extrabold text-rose-400 text-sm">{spot.maxDb} dB</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase block">24h Violations</span>
                    <span className="font-semibold text-orange-400">{spot.violationCount} breaches</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase block">Community Complaints</span>
                    <span className="font-semibold text-sky-400">{spot.complaintCount} filed</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                <span>Zone: <b className="text-slate-300">{spot.areaType}</b></span>
                <span className="font-mono text-[11px]">Score: {spot.riskScore}/9</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
