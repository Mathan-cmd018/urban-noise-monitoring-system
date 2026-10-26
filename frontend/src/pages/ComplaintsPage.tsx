import React, { useEffect, useState } from 'react';
import { 
  AlertTriangle, 
  Plus, 
  Search, 
  Filter, 
  Clock, 
  User, 
  MapPin, 
  CheckCircle, 
  XCircle, 
  X,
  History,
  ShieldCheck,
  Send
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Complaint, ComplaintCategory, ComplaintPriority, ComplaintStatus } from '../types';

export const ComplaintsPage: React.FC = () => {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [selectedComplaint, setSelectedComplaint] = useState<any>(null);
  const [complaintHistory, setComplaintHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);

  // Form states
  const [submitForm, setSubmitForm] = useState({
    category: 'Loud Music' as ComplaintCategory,
    description: '',
    location: '',
    latitude: 40.7128,
    longitude: -74.006,
    reportedNoiseLevel: 65,
    priority: 'Medium' as ComplaintPriority,
  });

  const [statusForm, setStatusForm] = useState({
    status: 'In Progress' as ComplaintStatus,
    notes: '',
    resolutionNotes: '',
  });

  const { user } = useAuth();
  const { showToast } = useToast();
  const isAuthorityOrAdmin = user?.role === 'Authority' || user?.role === 'Admin';

  const fetchComplaints = async () => {
    try {
      const res = await api.get('/complaints');
      setComplaints(res.data.data);
    } catch (err) {
      showToast('Failed to load complaints', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  const handleOpenDetail = async (complaintId: string) => {
    try {
      const res = await api.get(`/complaints/${complaintId}`);
      setSelectedComplaint(res.data.data.complaint);
      setComplaintHistory(res.data.data.history || []);
    } catch (err) {
      showToast('Failed to load complaint history', 'error');
    }
  };

  const handleSubmitComplaint = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/complaints', submitForm);
      showToast('Complaint lodged successfully and added to city queue', 'success');
      setShowSubmitModal(false);
      fetchComplaints();
      setSubmitForm({
        category: 'Loud Music',
        description: '',
        location: '',
        latitude: 40.7128,
        longitude: -74.006,
        reportedNoiseLevel: 65,
        priority: 'Medium',
      });
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Error submitting complaint', 'error');
    }
  };

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedComplaint) return;
    try {
      await api.patch(`/complaints/${selectedComplaint.complaintId}/status`, statusForm);
      showToast('Status updated and recorded in audit timeline', 'success');
      setShowStatusModal(false);
      fetchComplaints();
      handleOpenDetail(selectedComplaint.complaintId);
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to update status', 'error');
    }
  };

  const filteredComplaints = complaints.filter((c) => {
    const matchesStatus = statusFilter === 'All' || c.status === statusFilter;
    const matchesSearch =
      c.complaintId.toLowerCase().includes(search.toLowerCase()) ||
      c.location.toLowerCase().includes(search.toLowerCase()) ||
      c.description.toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <AlertTriangle className="w-6 h-6 text-amber-500" />
            Citizen Grievance &amp; Redressal Portal
          </h2>
          <p className="text-xs text-slate-400">
            {user?.role === 'Citizen'
              ? 'Your submitted noise grievances, status audits, and municipal resolution updates.'
              : 'Municipal noise triage queue, investigation dispatch, and compliance enforcement.'}
          </p>
        </div>

        <button
          onClick={() => setShowSubmitModal(true)}
          className="px-4 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs flex items-center gap-2 transition-all shadow-lg shadow-sky-500/20"
        >
          <Plus className="w-4 h-4" />
          Lodge Noise Complaint
        </button>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search by ID, location, or description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-100 placeholder-slate-500"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
          {['All', 'Submitted', 'Under Review', 'Assigned', 'In Progress', 'Resolved', 'Rejected'].map(
            (status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                  statusFilter === status
                    ? 'bg-sky-500/20 text-sky-400 border border-sky-500/40'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                {status}
              </button>
            )
          )}
        </div>
      </div>

      {/* Main Grid: Complaints List & Timeline Viewer */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Complaint Cards */}
        <div className="lg:col-span-2 space-y-3">
          {filteredComplaints.length === 0 ? (
            <div className="p-12 text-center bg-slate-900/40 rounded-2xl border border-slate-800 text-slate-400 text-sm">
              No noise complaints match the current filter.
            </div>
          ) : (
            filteredComplaints.map((c) => {
              const isSelected = selectedComplaint?.complaintId === c.complaintId;
              return (
                <div
                  key={c.complaintId}
                  onClick={() => handleOpenDetail(c.complaintId)}
                  className={`p-5 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-slate-900 border-sky-500/60 shadow-lg shadow-sky-950/20'
                      : 'bg-slate-900/70 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-sky-400">{c.complaintId}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300">
                          {c.category}
                        </span>
                      </div>
                      <h4 className="text-sm font-semibold text-white mt-1">{c.location}</h4>
                    </div>

                    <span
                      className={`text-[10px] px-2.5 py-1 rounded-full font-bold uppercase ${
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
                  </div>

                  <p className="text-xs text-slate-400 line-clamp-2 mb-3">{c.description}</p>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-[11px] text-slate-500">
                    <span>Priority: <b className="text-slate-300">{c.priority}</b></span>
                    <span>Reported: {c.reportedNoiseLevel ? `${c.reportedNoiseLevel} dB` : 'N/A'}</span>
                    <span>{new Date(c.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right Column: Timeline & Action Inspector */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 flex flex-col h-fit sticky top-20">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <History className="w-4 h-4 text-sky-400" />
              Complaint Audit Timeline
            </h3>
            {selectedComplaint && isAuthorityOrAdmin && (
              <button
                onClick={() => {
                  setStatusForm({
                    status: selectedComplaint.status,
                    notes: '',
                    resolutionNotes: selectedComplaint.resolutionNotes || '',
                  });
                  setShowStatusModal(true);
                }}
                className="px-2.5 py-1 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-[10px]"
              >
                Update Status
              </button>
            )}
          </div>

          {selectedComplaint ? (
            <div className="space-y-4">
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs">
                <div className="font-mono text-sky-400 font-bold mb-1">{selectedComplaint.complaintId}</div>
                <div className="text-slate-200 font-medium mb-1">{selectedComplaint.location}</div>
                <div className="text-slate-400 text-[11px]">{selectedComplaint.description}</div>
              </div>

              {/* Timeline sequence */}
              <div className="space-y-4 relative pl-4 border-l-2 border-slate-800 my-2">
                {complaintHistory.map((item, idx) => (
                  <div key={item._id || idx} className="relative group">
                    <span className="w-2.5 h-2.5 rounded-full bg-sky-400 absolute -left-[21px] top-1 ring-4 ring-slate-950"></span>
                    <div className="text-[11px] font-bold text-slate-200 flex items-center justify-between">
                      <span>{item.status}</span>
                      <span className="text-[10px] text-slate-500 font-normal">
                        {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">{item.notes}</p>
                    <div className="text-[10px] text-slate-500 mt-1">
                      By: {item.updatedBy?.name || 'System Dispatch'} ({item.updatedBy?.role || 'Authority'})
                    </div>
                  </div>
                ))}
              </div>

              {selectedComplaint.resolutionNotes && (
                <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-800/60 text-xs">
                  <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block mb-1">
                    Official Resolution
                  </span>
                  <p className="text-slate-300">{selectedComplaint.resolutionNotes}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="py-12 text-center text-xs text-slate-500">
              Select a complaint on the left to inspect its complete timeline and authority audits.
            </div>
          )}
        </div>
      </div>

      {/* Lodging Complaint Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-5">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-400" />
                Lodge Citizen Noise Grievance
              </h3>
              <button onClick={() => setShowSubmitModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitComplaint} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Noise Category</label>
                  <select
                    value={submitForm.category}
                    onChange={(e) => setSubmitForm({ ...submitForm, category: e.target.value as any })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100"
                  >
                    <option value="Loud Music">Loud Music</option>
                    <option value="Construction Noise">Construction Noise</option>
                    <option value="Traffic Noise">Traffic Noise</option>
                    <option value="Industrial Noise">Industrial Noise</option>
                    <option value="Event Noise">Event Noise</option>
                    <option value="Vehicle Horn">Vehicle Horn</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Urgency Priority</label>
                  <select
                    value={submitForm.priority}
                    onChange={(e) => setSubmitForm({ ...submitForm, priority: e.target.value as any })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Location / Street Address</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 142 Oakridge Blvd near park entrance"
                  value={submitForm.location}
                  onChange={(e) => setSubmitForm({ ...submitForm, location: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Incident Description</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Describe the sound source, timing, frequency, and severity..."
                  value={submitForm.description}
                  onChange={(e) => setSubmitForm({ ...submitForm, description: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Estimated dB (Optional)</label>
                  <input
                    type="number"
                    min="30"
                    max="140"
                    value={submitForm.reportedNoiseLevel}
                    onChange={(e) => setSubmitForm({ ...submitForm, reportedNoiseLevel: parseFloat(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Approximate Latitude</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={submitForm.latitude}
                    onChange={(e) => setSubmitForm({ ...submitForm, latitude: parseFloat(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowSubmitModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold"
                >
                  Submit Complaint
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Authority Status Update Modal */}
      {showStatusModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-sky-400" />
                Transition Case Status
              </h3>
              <button onClick={() => setShowStatusModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateStatus} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Workflow Status</label>
                <select
                  value={statusForm.status}
                  onChange={(e) => setStatusForm({ ...statusForm, status: e.target.value as any })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100"
                >
                  <option value="Submitted">Submitted</option>
                  <option value="Under Review">Under Review</option>
                  <option value="Assigned">Assigned</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Resolved">Resolved</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Audit Notes / Officer Action</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Record officer actions, inspection results, or field verification..."
                  value={statusForm.notes}
                  onChange={(e) => setStatusForm({ ...statusForm, notes: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100"
                />
              </div>

              {statusForm.status === 'Resolved' && (
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Resolution Summary for Citizen</label>
                  <textarea
                    rows={2}
                    placeholder="Summary of outcome and corrective actions taken..."
                    value={statusForm.resolutionNotes}
                    onChange={(e) => setStatusForm({ ...statusForm, resolutionNotes: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100"
                  />
                </div>
              )}

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowStatusModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold"
                >
                  Commit Status
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
