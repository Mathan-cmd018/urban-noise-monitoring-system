import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Radio, 
  AlertTriangle, 
  CheckCircle2, 
  Flame, 
  Scale, 
  Volume2, 
  TrendingUp, 
  RefreshCw,
  ExternalLink,
  ShieldAlert
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell, 
  CartesianGrid 
} from 'recharts';
import api from '../services/api';
import { getSeverity, SEVERITY_COLORS } from '../utils/constants';

const COLORS = ['#0ea5e9', '#f59e0b', '#ef4444', '#10b981', '#8b5cf6', '#ec4899'];

export const DashboardPage: React.FC = () => {
  const [overview, setOverview] = useState<any>(null);
  const [noiseAnalytics, setNoiseAnalytics] = useState<any>(null);
  const [complaintStats, setComplaintStats] = useState<any>(null);
  const [recentComplaints, setRecentComplaints] = useState<any[]>([]);
  const [latestReadings, setLatestReadings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      const [ovRes, noiseRes, cmpStatsRes, complaintsRes, readingsRes] = await Promise.all([
        api.get('/analytics/overview'),
        api.get('/analytics/noise').catch(() => ({ data: { data: null } })),
        api.get('/analytics/complaints').catch(() => ({ data: { data: null } })),
        api.get('/complaints'),
        api.get('/noise/latest'),
      ]);

      setOverview(ovRes.data.data);
      if (noiseRes.data.data) setNoiseAnalytics(noiseRes.data.data);
      if (cmpStatsRes.data.data) setComplaintStats(cmpStatsRes.data.data);
      setRecentComplaints(complaintsRes.data.data.slice(0, 5));
      setLatestReadings(readingsRes.data.data);
    } catch (err) {
      console.error('Failed to load dashboard telemetry', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    // Poll telemetry every 6 seconds to show dynamic simulation updates
    const interval = setInterval(fetchDashboardData, 6000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      {/* Header & Simulation status banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-3">
            Municipal Environmental Intelligence
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-sky-500/10 border border-sky-500/30 text-sky-400 font-mono">
              v1.0 MERN
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Real-time urban decibel monitoring, automated hotspot triage, and complaint lifecycle management.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            <span className="text-slate-300">Telemetry Engine:</span>
            <span className="text-emerald-400 font-semibold">Simulated Real-Time</span>
          </div>
          <button
            onClick={fetchDashboardData}
            title="Refresh telemetry"
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 relative overflow-hidden group">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Stations</span>
            <Radio className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-2xl font-bold text-white">{overview?.totalStations ?? '--'}</div>
          <div className="text-[11px] text-emerald-400 mt-1 font-medium flex items-center gap-1">
            <span>●</span> 100% Operational
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 relative overflow-hidden group">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Citywide Avg</span>
            <Volume2 className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-amber-400">
            {overview?.currentAverageNoise ? `${overview.currentAverageNoise} dB` : '--'}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Severity: <span className="font-semibold text-amber-300">Moderate</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 relative overflow-hidden group">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Active Cases</span>
            <AlertTriangle className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-bold text-rose-400">{overview?.activeComplaints ?? '--'}</div>
          <div className="text-[11px] text-rose-400/80 mt-1">Action Required</div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 relative overflow-hidden group">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Resolved</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-400">{overview?.resolvedComplaints ?? '--'}</div>
          <div className="text-[11px] text-slate-400 mt-1">Complaints closed</div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 relative overflow-hidden group">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Hotspots</span>
            <Flame className="w-4 h-4 text-orange-400" />
          </div>
          <div className="text-2xl font-bold text-orange-400">{overview?.noiseHotspots ?? '--'}</div>
          <div className="text-[11px] text-orange-400/80 mt-1 font-medium">Elevated risk</div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 relative overflow-hidden group">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Compliance</span>
            <Scale className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-2xl font-bold text-sky-400">
            {overview?.compliancePercentage ? `${overview.compliancePercentage}%` : '--'}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Within limits</div>
        </div>
      </div>

      {/* Live Telemetry Station Feed */}
      <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-sky-400" />
            <h3 className="text-sm font-bold text-white">Live Monitoring Station Telemetry (Redis Cached)</h3>
          </div>
          <Link to="/stations" className="text-xs text-sky-400 hover:underline flex items-center gap-1">
            View All Stations <ExternalLink className="w-3 h-3" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
          {latestReadings.map((st) => {
            const severity = getSeverity(st.noiseLevel);
            const badgeClass = SEVERITY_COLORS[severity];
            return (
              <div
                key={st.stationId}
                className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 hover:border-slate-700 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="text-[10px] font-mono text-slate-400">{st.stationId}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded border font-semibold ${badgeClass}`}>
                      {severity}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-100 truncate" title={st.stationName}>
                    {st.stationName}
                  </h4>
                  <p className="text-[10px] text-slate-400">{st.areaType}</p>
                </div>
                <div className="mt-3 pt-2 border-t border-slate-800 flex items-baseline justify-between">
                  <span className="text-lg font-extrabold text-white">{st.noiseLevel}</span>
                  <span className="text-[10px] text-slate-500 font-mono">dB(A)</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Noise Telemetry Trend */}
        <div className="lg:col-span-2 p-5 rounded-2xl bg-slate-900/70 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white">Recent Decibel Telemetry Stream</h3>
              <p className="text-xs text-slate-400">Chronological readings sampled across monitoring stations</p>
            </div>
            <span className="text-xs text-slate-400 font-mono">dB Level</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={noiseAnalytics?.timeTrend || []}>
                <defs>
                  <linearGradient id="noiseGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="time" stroke="#64748b" tick={{ fontSize: 11 }} />
                <YAxis stroke="#64748b" domain={[30, 100]} tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
                  labelStyle={{ color: '#94a3b8' }}
                />
                <Area
                  type="monotone"
                  dataKey="noiseLevel"
                  stroke="#0ea5e9"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#noiseGradient)"
                  name="Noise (dB)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Complaints Breakdown */}
        <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-white mb-1">Grievances by Category</h3>
            <p className="text-xs text-slate-400">Distribution of citizen reports</p>
          </div>

          <div className="h-48 w-full my-auto flex items-center justify-center">
            {complaintStats?.byCategory?.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={complaintStats.byCategory}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="count"
                    nameKey="category"
                  >
                    {complaintStats.byCategory.map((_: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-xs text-slate-500">No complaint data recorded</div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-400 pt-2 border-t border-slate-800">
            {complaintStats?.byCategory?.slice(0, 4).map((c: any, i: number) => (
              <div key={c.category} className="flex items-center gap-1.5 truncate">
                <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }}></span>
                <span className="truncate">{c.category}:</span>
                <span className="font-semibold text-slate-200">{c.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Complaints Table */}
      <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-white">Recent Noise Complaints</h3>
            <p className="text-xs text-slate-400">Citizen submissions requiring municipal triage or officer review</p>
          </div>
          <Link to="/complaints" className="text-xs text-sky-400 hover:underline flex items-center gap-1">
            Manage All Complaints <ExternalLink className="w-3 h-3" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/60 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Complaint ID</th>
                <th className="py-3 px-4">Citizen</th>
                <th className="py-3 px-4">Location</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Reported dB</th>
                <th className="py-3 px-4">Priority</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {recentComplaints.map((c) => (
                <tr key={c.complaintId} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-4 font-mono font-semibold text-sky-400">{c.complaintId}</td>
                  <td className="py-3 px-4 text-slate-200">{c.userId?.name || 'Citizen'}</td>
                  <td className="py-3 px-4 max-w-xs truncate text-slate-300">{c.location}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300">
                      {c.category}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono">
                    {c.reportedNoiseLevel ? `${c.reportedNoiseLevel} dB` : '--'}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-0.5 rounded font-semibold text-[10px] ${
                        c.priority === 'Critical'
                          ? 'bg-rose-950 text-rose-300 border border-rose-800'
                          : c.priority === 'High'
                          ? 'bg-orange-950 text-orange-300 border border-orange-800'
                          : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {c.priority}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                        c.status === 'Resolved'
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                          : c.status === 'In Progress'
                          ? 'bg-sky-950 text-sky-400 border border-sky-800'
                          : c.status === 'Under Review'
                          ? 'bg-amber-950 text-amber-400 border border-amber-800'
                          : 'bg-slate-800 text-slate-300 border border-slate-700'
                      }`}
                    >
                      {c.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <Link
                      to={`/complaints`}
                      className="px-2.5 py-1 rounded-lg bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 font-medium transition-colors"
                    >
                      Details
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
