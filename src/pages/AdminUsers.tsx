import { useState } from 'react';
import { useAPI, useAPIMutation } from '../hooks/useApi';
import { useAuth } from '../hooks/useAuth';
import { Card, CardContent } from '../components/ui/card';
import { Users, Plus, Edit2, Trash2, X, Save, Key } from 'lucide-react';

const ROLE_OPTIONS = [
  { value: 'admin', label: 'System Admin', desc: 'Full access' },
  { value: 'manager', label: 'Manager', desc: 'Manage all data' },
  { value: 'therapist', label: 'Therapist', desc: 'Service records only' },
  { value: 'reception', label: 'Reception', desc: 'Customers & sales' },
];

export default function AdminUsers() {
  const { user: me } = useAuth();
  const { data, isLoading, refetch } = useAPI('/users');
  const createMut = useAPIMutation('/users');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [pwdForm, setPwdForm] = useState<{id:number, name:string} | null>(null);
  const [newPwd, setNewPwd] = useState('');
  const [form, setForm] = useState({ username: '', password: '', name: '', role: 'therapist', phone: '' });

  const resetForm = () => { setForm({ username: '', password: '', name: '', role: 'therapist', phone: '' }); setEditing(null); };
  const openCreate = () => { resetForm(); setShowForm(true); };
  const openEdit = (u: any) => { setEditing(u); setForm({ username: u.username, password: '', name: u.name, role: u.role, phone: u.phone || '' }); setShowForm(true); };
  const openPwd = (u: any) => { setPwdForm({ id: u.id, name: u.name }); setNewPwd(''); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editing) {
      await fetch(`http://localhost:3001/api/users/${editing.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('wellness_token')}` }, body: JSON.stringify({ name: form.name, role: form.role, status: editing.status, phone: form.phone }) });
    } else {
      if (!form.password) return alert('Password required');
      await createMut.post({ username: form.username, password: form.password, name: form.name, role: form.role, phone: form.phone });
    }
    setShowForm(false); resetForm(); refetch();
  };

  const handlePwd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPwd || !pwdForm) return;
    await fetch(`http://localhost:3001/api/users/${pwdForm.id}/password`, { method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('wellness_token')}` }, body: JSON.stringify({ password: newPwd }) });
    setPwdForm(null); setNewPwd(''); alert('Password updated');
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this user?')) return;
    await fetch(`http://localhost:3001/api/users/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${localStorage.getItem('wellness_token')}` } });
    refetch();
  };

  if (isLoading) return <div className="text-center py-8 text-gray-500">Loading...</div>;
  const users = (data || []).filter((u: any) => u.id !== me?.id);

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <div className="text-xs text-gray-500">{users.length + 1} users (including you)</div>
        <button onClick={openCreate} className="bg-blue-600 text-white px-3 py-2 rounded-lg text-sm flex items-center gap-1 hover:bg-blue-700"><Plus size={16} /> Add User</button>
      </div>

      <div className="space-y-2">{users.map((u: any) =>
        <Card key={u.id}><CardContent className="p-3">
          <div className="flex justify-between items-start">
            <div className="flex gap-2 items-center">
              <Users size={16} className="text-blue-500" />
              <span className="font-medium text-sm">{u.name}</span>
              <span className="text-xs text-gray-400">@{u.username}</span>
              <span className={'text-xs px-1.5 py-0.5 rounded ' + (u.role === 'admin' ? 'bg-red-100 text-red-700' : u.role === 'manager' ? 'bg-purple-100 text-purple-700' : u.role === 'reception' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700')}>
                {ROLE_OPTIONS.find(r => r.value === u.role)?.label || u.role}
              </span>
              {u.status !== 'active' && <span className="text-xs px-1.5 py-0.5 rounded bg-gray-100 text-gray-500">Disabled</span>}
            </div>
            <div className="flex gap-1">
              <button onClick={() => openPwd(u)} className="p-1 text-orange-600 hover:bg-orange-50 rounded" title="Reset Password"><Key size={14} /></button>
              <button onClick={() => openEdit(u)} className="p-1 text-blue-600 hover:bg-blue-50 rounded"><Edit2 size={14} /></button>
              <button onClick={() => handleDelete(u.id)} className="p-1 text-red-600 hover:bg-red-50 rounded"><Trash2 size={14} /></button>
            </div>
          </div>
          {u.phone && <p className="text-xs text-gray-400 mt-1">Phone: {u.phone}</p>}
        </CardContent></Card>
      )}</div>

      {/* User Form Modal */}
      {showForm && <div className="fixed inset-0 bg-black/40 z-50 flex items-end md:items-center justify-center" onClick={() => setShowForm(false)}>
        <div className="bg-white rounded-t-xl md:rounded-xl w-full md:w-[500px] max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
          <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
            <h3 className="font-bold">{editing ? 'Edit User' : 'New User'}</h3><button onClick={() => setShowForm(false)} className="text-gray-400"><X size={18} /></button>
          </div>
          <form onSubmit={handleSubmit} className="p-4 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div><label className="text-xs text-gray-500">Username {!editing && '*'}</label><input required={!editing} value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm" disabled={!!editing} /></div>
              <div><label className="text-xs text-gray-500">Name *</label><input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm" /></div>
            </div>
            {!editing && <div><label className="text-xs text-gray-500">Password *</label><input type="password" required={!editing} value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm" /></div>}
            <div className="grid grid-cols-2 gap-3">
              <div><label className="text-xs text-gray-500">Role</label>
                <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm">
                  {ROLE_OPTIONS.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                </select>
              </div>
              <div><label className="text-xs text-gray-500">Phone</label><input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm" /></div>
            </div>
            <div className="flex gap-2 pt-2">
              <button type="submit" className="flex-1 bg-blue-600 text-white py-2 rounded-lg text-sm flex items-center justify-center gap-1 hover:bg-blue-700"><Save size={16} /> {editing ? 'Save' : 'Create'}</button>
              <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 border rounded-lg text-sm text-gray-600">Cancel</button>
            </div>
          </form>
        </div>
      </div>}

      {/* Password Reset Modal */}
      {pwdForm && <div className="fixed inset-0 bg-black/40 z-50 flex items-end md:items-center justify-center" onClick={() => setPwdForm(null)}>
        <div className="bg-white rounded-t-xl md:rounded-xl w-full md:w-[400px]" onClick={e => e.stopPropagation()}>
          <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
            <h3 className="font-bold">Reset Password - {pwdForm.name}</h3><button onClick={() => setPwdForm(null)} className="text-gray-400"><X size={18} /></button>
          </div>
          <form onSubmit={handlePwd} className="p-4 space-y-3">
            <div><label className="text-xs text-gray-500">New Password *</label><input type="password" required value={newPwd} onChange={e => setNewPwd(e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm" /></div>
            <div className="flex gap-2">
              <button type="submit" className="flex-1 bg-orange-600 text-white py-2 rounded-lg text-sm flex items-center justify-center gap-1 hover:bg-orange-700"><Key size={16} /> Reset Password</button>
              <button type="button" onClick={() => setPwdForm(null)} className="px-4 py-2 border rounded-lg text-sm text-gray-600">Cancel</button>
            </div>
          </form>
        </div>
      </div>}
    </div>
  );
}
