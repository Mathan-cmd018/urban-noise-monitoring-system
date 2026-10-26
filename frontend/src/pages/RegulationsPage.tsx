import React, { useEffect, useState } from 'react';
import { Scale, Edit3, ShieldAlert, CheckCircle, Clock, AlertTriangle, Save, X } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Regulation, AreaType } from '../types';

export const RegulationsPage: React.FC = () => {
  const [regulations, setRegulations] = useState<Regulation[]>([]);
  const [complianceData, setComplianceData] = useState<any>(null);
  const [editingReg, setEditingReg] = useState<Regulation | null>(null);
  const [form, setForm] = useState({ dayLimit: 55, nightLimit: 45 });
  const [loading, setLoading] = useState(true);

  const { user } = useAuth();
  const { showToast } = useToast();
  const isAdmin = user?.role === 'Admin';

  const fetchData = async () => {
    try {
      const [regRes, compRes] = await Promise.all([
        api.get('/regulations'),
        api.get('/analytics/compliance'),
      ]);
      setRegulations(regRes.data.data);
      setComplianceData(compRes.data.data);
    } catch (err) {
      showToast('Failed to load regulations', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleStartEdit = (reg: Regulation) => {
    setEditingReg(reg);
    setForm({ dayLimit: reg.dayLimit, nightLimit: reg.nightLimit });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingReg) return;
    try {
      await api.put(`/regulations/${editingReg.id || (editingReg as any)._id}`, {
        areaType: editingReg.areaType,
        dayLimit: Number(form.dayLimit),
        nightLimit: Number(form.nightLimit),
      });
      showToast(`Updated decibel thresholds for ${editingReg.areaType}`, 'success');
      setEditingReg(null);
      fetchData();
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to update regulation', 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          <Scale className="w-6 h-6 text-sky-400" />
          Regulatory Noise Standards &amp; Permissible Thresholds
        </h2>
        <p className="text-xs text-slate-400">
          Configurable day/night decibel maximums dynamically enforced across all telemetry monitoring zones.
        </p>
      </div>

      {/* Compliance Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-800/60 flex items-center gap-4">
          <CheckCircle className="w-8 h-8 text-emerald-400 shrink-0" />
          <div>
            <span className="text-[10px] text-emerald-300 font-semibold uppercase tracking-wider block">
              Compliant Stations
            </span>
            <span className="text-2xl font-black text-white">
              {complianceData?.breakdown?.compliant ?? '--'}
            </span>
            <span className="text-xs text-emerald-400/80 ml-2">Under legal limits</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-800/60 flex items-center gap-4">
          <AlertTriangle className="w-8 h-8 text-amber-400 shrink-0" />
          <div>
            <span className="text-[10px] text-amber-300 font-semibold uppercase tracking-wider block">
              Warning Band
            </span>
            <span className="text-2xl font-black text-white">
              {complianceData?.breakdown?.warning ?? '--'}
            </span>
            <span className="text-xs text-amber-400/80 ml-2">Within 5 dB of cap</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-800/60 flex items-center gap-4">
          <ShieldAlert className="w-8 h-8 text-rose-400 shrink-0" />
          <div>
            <span className="text-[10px] text-rose-300 font-semibold uppercase tracking-wider block">
              Violations
            </span>
            <span className="text-2xl font-black text-white">
              {complianceData?.breakdown?.nonCompliant ?? '--'}
            </span>
            <span className="text-xs text-rose-400/80 ml-2">Exceeding limits</span>
          </div>
        </div>
      </div>

      {/* Regulations Table */}
      <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800">
        <h3 className="text-sm font-bold text-white mb-1">Municipal Noise Standards by Zone</h3>
        <p className="text-xs text-slate-400 mb-4">
          Daytime (06:00 - 22:00) vs Nighttime (22:00 - 06:00) maximum sound pressure levels.
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/60 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Area Category</th>
                <th className="py-3 px-4">Day Limit (06:00–22:00)</th>
                <th className="py-3 px-4">Night Limit (22:00–06:00)</th>
                <th className="py-3 px-4">Effective Date</th>
                {isAdmin && <th className="py-3 px-4 text-right">Action</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {regulations.map((reg) => (
                <tr key={reg.areaType} className="hover:bg-slate-800/40">
                  <td className="py-3 px-4 font-semibold text-white">{reg.areaType}</td>
                  <td className="py-3 px-4 font-mono font-bold text-amber-400">{reg.dayLimit} dB(A)</td>
                  <td className="py-3 px-4 font-mono font-bold text-sky-400">{reg.nightLimit} dB(A)</td>
                  <td className="py-3 px-4 text-slate-400">
                    {new Date(reg.effectiveFrom).toLocaleDateString()}
                  </td>
                  {isAdmin && (
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleStartEdit(reg)}
                        className="px-3 py-1 rounded-lg bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 font-semibold flex items-center gap-1.5 ml-auto text-xs"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        Modify
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Threshold Modal */}
      {editingReg && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-sky-400" />
                Configure Decibel Cap: {editingReg.areaType}
              </h3>
              <button onClick={() => setEditingReg(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Daytime Threshold (06:00 - 22:00) in dB
                </label>
                <input
                  type="number"
                  min="30"
                  max="120"
                  required
                  value={form.dayLimit}
                  onChange={(e) => setForm({ ...form, dayLimit: Number(e.target.value) })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Nighttime Threshold (22:00 - 06:00) in dB
                </label>
                <input
                  type="number"
                  min="30"
                  max="120"
                  required
                  value={form.nightLimit}
                  onChange={(e) => setForm({ ...form, nightLimit: Number(e.target.value) })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingReg(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  Save Regulations
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
