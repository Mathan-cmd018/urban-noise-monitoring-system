import React, { useEffect, useState } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldCheck, 
  Clock, 
  Activity,
  Layers
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
  CartesianGrid, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import api from '../services/api';
import { useToast } from '../context/ToastContext';

const PIE_COLORS = ['#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export const AnalyticsPage: React.FC = () => {
  const [noiseData, setNoiseData] = useState<any>(null);
  const [complaintData, setComplaintData] = useState<any>(null);
  const [complianceData, setComplianceData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    const fetchAllAnalytics = async () => {
      try {
        const [nRes, cRes, compRes] = await Promise.all([
          api.get('/analytics/noise'),
          api.get('/analytics/complaints'),
          api.get('/analytics/compliance'),
        ]);
        setNoiseData(nRes.data.data);
        setComplaintData(cRes.data.data);
        setComplianceData(compRes.data.data);
      } catch (err) {
        showToast('Failed to load comprehensive analytics', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchAllAnalytics();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-sky-400" />
          Acoustic &amp; Regulatory Analytics Dashboard
        </h2>
        <p className="text-xs text-slate-400">
          In-depth cross-sectional analysis of sensor telemetry trends, complaint resolution metrics, and zone compliance.
        </p>
      </div>

      {/* Top Level Metric KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase mb-1">
            <span>Citywide Mean Noise</span>
            <Activity className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-2xl font-bold text-white">
            {noiseData?.summary?.averageNoise ? `${noiseData.summary.averageNoise} dB` : '--'}
          </div>
          <span className="text-[10px] text-slate-400">Across active telemetry nodes</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase mb-1">
            <span>Peak Amplitude</span>
            <TrendingUp className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-bold text-rose-400">
            {noiseData?.summary?.maximumNoise ? `${noiseData.summary.maximumNoise} dB` : '--'}
          </div>
          <span className="text-[10px] text-slate-400">Maximum recorded surge</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase mb-1">
            <span>Resolution Rate</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-400">
            {complaintData?.resolutionRate ? `${complaintData.resolutionRate}%` : '--'}
          </div>
          <span className="text-[10px] text-slate-400">Complaints closed successfully</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase mb-1">
            <span>Overall Compliance</span>
            <ShieldCheck className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-2xl font-bold text-sky-400">
            {complianceData?.overallCompliancePercentage ? `${complianceData.overallCompliancePercentage}%` : '--'}
          </div>
          <span className="text-[10px] text-slate-400">Station readings within limit</span>
        </div>
      </div>

      {/* Chart Section 1: Area-wise Averages & Categories */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Area Averages Bar Chart */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800">
          <h3 className="text-sm font-bold text-white mb-1">Mean Acoustic Level by Area Type</h3>
          <p className="text-xs text-slate-400 mb-4">Average decibel comparison across municipal land-use zones</p>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={noiseData?.areaAverages || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="area" stroke="#64748b" tick={{ fontSize: 10 }} />
                <YAxis stroke="#64748b" domain={[30, 90]} tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
                />
                <Bar dataKey="avgDb" fill="#0ea5e9" name="Average dB" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Complaint Status Distribution */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800">
          <h3 className="text-sm font-bold text-white mb-1">Complaints by Status</h3>
          <p className="text-xs text-slate-400 mb-4">Triage progression across the municipal resolution pipeline</p>

          <div className="h-64 w-full flex items-center justify-center">
            {complaintData?.byStatus?.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={complaintData.byStatus}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={4}
                    dataKey="count"
                    nameKey="status"
                    label={(entry) => `${entry.status}: ${entry.count}`}
                  >
                    {complaintData.byStatus.map((_: any, idx: number) => (
                      <Cell key={`status-cell-${idx}`} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-xs text-slate-500">No complaint status data recorded</div>
            )}
          </div>
        </div>
      </div>

      {/* Compliance Detailed Table */}
      <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800">
        <h3 className="text-sm font-bold text-white mb-1">Station Compliance Status Ledger</h3>
        <p className="text-xs text-slate-400 mb-4">
          Real-time check of each monitoring station against current legal caps for its area type
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/60 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Station ID</th>
                <th className="py-3 px-4">Station Name</th>
                <th className="py-3 px-4">Zone Type</th>
                <th className="py-3 px-4">Current Noise</th>
                <th className="py-3 px-4">Cap Limit</th>
                <th className="py-3 px-4">Delta / Excess</th>
                <th className="py-3 px-4">Compliance Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {complianceData?.stationComplianceList?.map((s: any) => (
                <tr key={s.stationId} className="hover:bg-slate-800/40">
                  <td className="py-3 px-4 font-mono font-bold text-sky-400">{s.stationId}</td>
                  <td className="py-3 px-4 font-semibold text-white">{s.name}</td>
                  <td className="py-3 px-4">{s.areaType}</td>
                  <td className="py-3 px-4 font-mono font-bold">{s.currentNoiseLevel} dB</td>
                  <td className="py-3 px-4 font-mono text-slate-400">{s.permissibleLimit} dB</td>
                  <td className="py-3 px-4 font-mono">
                    {s.excess > 0 ? (
                      <span className="text-rose-400 font-bold">+{s.excess} dB</span>
                    ) : (
                      <span className="text-emerald-400">Within Limit</span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                        s.status === 'Compliant'
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                          : s.status === 'Warning'
                          ? 'bg-amber-950 text-amber-300 border border-amber-800'
                          : 'bg-rose-950 text-rose-300 border border-rose-800'
                      }`}
                    >
                      {s.status}
                    </span>
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
