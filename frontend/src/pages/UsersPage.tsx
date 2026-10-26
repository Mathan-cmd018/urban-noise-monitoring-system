import React, { useEffect, useState } from 'react';
import { Users, Search, Shield, UserCheck, Trash2, Edit2, X } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { User, UserRole } from '../types';

export const UsersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editRole, setEditRole] = useState<UserRole>('Citizen');
  const [loading, setLoading] = useState(true);

  const { showToast } = useToast();

  const fetchUsers = async () => {
    try {
      const res = await api.get('/users');
      setUsers(res.data.data);
    } catch (err) {
      showToast('Failed to load user directory', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleUpdateRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    try {
      await api.put(`/users/${editingUser.id || (editingUser as any)._id}`, { role: editRole });
      showToast(`User role updated to ${editRole}`, 'success');
      setEditingUser(null);
      fetchUsers();
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to update role', 'error');
    }
  };

  const filteredUsers = users.filter((u) => {
    const matchesRole = roleFilter === 'All' || u.role === roleFilter;
    const matchesSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    return matchesRole && matchesSearch;
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          <Users className="w-6 h-6 text-sky-400" />
          Municipal User Directory &amp; RBAC Access
        </h2>
        <p className="text-xs text-slate-400">
          Admin oversight for municipal personnel, environmental field authorities, and citizen accounts.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-100 placeholder-slate-500"
          />
        </div>

        <div className="flex items-center gap-2">
          {['All', 'Admin', 'Authority', 'Citizen'].map((role) => (
            <button
              key={role}
              onClick={() => setRoleFilter(role)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                roleFilter === role
                  ? 'bg-sky-500/20 text-sky-400 border border-sky-500/40'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              {role}
            </button>
          ))}
        </div>
      </div>

      <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/60 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Name</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4">Phone</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Registered Date</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredUsers.map((u) => (
                <tr key={u.id || (u as any)._id} className="hover:bg-slate-800/40">
                  <td className="py-3 px-4 font-semibold text-white">{u.name}</td>
                  <td className="py-3 px-4 text-slate-400">{u.email}</td>
                  <td className="py-3 px-4 text-slate-400">{u.phone || '--'}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                        u.role === 'Admin'
                          ? 'bg-purple-950 text-purple-300 border border-purple-800'
                          : u.role === 'Authority'
                          ? 'bg-sky-950 text-sky-300 border border-sky-800'
                          : 'bg-slate-800 text-slate-300 border border-slate-700'
                      }`}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-400">
                    {new Date(u.createdAt).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => {
                        setEditingUser(u);
                        setEditRole(u.role);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 font-semibold text-xs"
                    >
                      Change Role
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Role Change Modal */}
      {editingUser && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Shield className="w-5 h-5 text-sky-400" />
                Change Access Role
              </h3>
              <button onClick={() => setEditingUser(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateRole} className="space-y-4 text-xs">
              <div>
                <span className="text-slate-400 block mb-1">User:</span>
                <span className="text-sm font-bold text-white block">{editingUser.name}</span>
                <span className="text-xs text-slate-500">{editingUser.email}</span>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Select Role</label>
                <select
                  value={editRole}
                  onChange={(e) => setEditRole(e.target.value as UserRole)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100"
                >
                  <option value="Citizen">Citizen</option>
                  <option value="Authority">Authority</option>
                  <option value="Admin">Admin</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold"
                >
                  Update Role
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
