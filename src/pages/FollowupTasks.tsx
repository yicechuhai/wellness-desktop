import { useState } from 'react';
import { useAPI, useAPIMutation } from '../hooks/useApi';
import { useAuth } from '../hooks/useAuth';
import { Card, CardContent } from '../components/ui/card';
import { Phone, CheckCircle, Plus, Trash2, X, Save, Download } from 'lucide-react';

const TYPE_OPTIONS = [
  { value: 'new_experience', label: 'New Customer' },
  { value: 'convert_package', label: 'Convert' },
  { value: 'sleeping_wake', label: 'Re-engage' },
  { value: 'renew_reminder', label: 'Renewal' },
  { value: 'effect_followup', label: 'Follow-up' },
  { value: 'custom', label: 'Custom' },
];

const typeColors: Record<string, string> = { new_experience: 'bg-green-100 text-green-700', convert_package: 'bg-purple-100 text-purple-700', sleeping_wake: 'bg-gray-100 text-gray-700', renew_reminder: 'bg-orange-100 text-orange-700', effect_followup: 'bg-blue-100 text-blue-700', custom: 'bg-gray-100 text-gray-600' };

export default function FollowupTasks() {
  const { can } = useAuth();
  const { data, isLoading, refetch } = useAPI('/followups');
  const createMut = useAPIMutation('/followups');
  const [filter, setFilter] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ customer_name: '', task_type: 'new_experience', due_date: new Date().toISOString().slice(0, 10), reason: '', suggested_message: '', owner_staff: '' });
  const tasks = (data || []).filter((t: any) => filter === 'all' || t.status === filter);

  const handleDone = async (id: number) => { await fetch(`http://localhost:3001/api/followups/${id}/done`, { method: 'PUT', headers: { Authorization: `Bearer ${localStorage.getItem('wellness_token')}` } }); refetch(); };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.customer_name.trim()) return alert('Enter customer name');
    await createMut.post(form);
    setShowForm(false);
    setForm({ customer_name: '', task_type: 'new_experience', due_date: new Date().toISOString().slice(0, 10), reason: '', suggested_message: '', owner_staff: '' });
    refetch();
  };
  const handleDelete = async (id: number) => { if (!confirm('Delete?')) return; await fetch(`http://localhost:3001/api/followups/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${localStorage.getItem('wellness_token')}` } }); refetch(); };
  const doExport = () => { const t = localStorage.getItem('wellness_token'); fetch('http://localhost:3001/api/export/followup_task', { headers: { Authorization: `Bearer ${t}` } }).then(r => r.blob()).then(b => { const u = URL.createObjectURL(b); const a = document.createElement('a'); a.href = u; a.download = `followups_${new Date().toISOString().slice(0,10)}.xlsx`; a.click(); URL.revokeObjectURL(u); }); };

  if (isLoading) return <div className="text-center py-8 text-gray-500">Loading...</div>;

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        {[{ k: 'all', l: 'All' }, { k: 'pending', l: 'Pending' }, { k: 'done', l: 'Done' }].map(t => <button key={t.k} onClick={() => setFilter(t.k)} className={'px-3 py-1.5 rounded-lg text-xs ' + (filter === t.k ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600')}>{t.l}</button>)}
        {can('followup.create') && <button onClick={() => setShowForm(true)} className="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-sm flex items-center gap-1 hover:bg-blue-700 ml-auto"><Plus size={14} /> Add</button>}
        {can('export') && <button onClick={doExport} className="bg-green-600 text-white px-3 py-1.5 rounded-lg text-sm flex items-center gap-1 hover:bg-green-700" title="Export"><Download size={14} /></button>}
      </div>
      <div className="text-xs text-gray-500">{tasks.length} tasks</div>
      <div className="space-y-2">{tasks.map((t: any) =>
        <Card key={t.id} className={t.status === 'done' ? 'opacity-60' : ''}><CardContent className="p-3">
          <div className="flex justify-between items-start">
            <div className="flex gap-2 items-center">
              <Phone size={16} className="text-orange-500" /><span className="font-medium text-sm">{t.customer_name}</span>
              <span className={'text-xs px-1.5 py-0.5 rounded ' + (typeColors[t.task_type] || 'bg-gray-100')}>{TYPE_OPTIONS.find(o => o.value === t.task_type)?.label || t.task_type}</span>
              {t.status === 'done' && <span className="text-xs px-1.5 py-0.5 rounded bg-green-100 text-green-700">Done</span>}
            </div>
            <div className="flex items-center gap-1">
              {t.status === 'pending' && <button onClick={() => handleDone(t.id)} className="p-1 text-green-600 hover:bg-green-50 rounded" title="Done"><CheckCircle size={18} /></button>}
              {can('followup.delete') && <button onClick={() => handleDelete(t.id)} className="p-1 text-red-600 hover:bg-red-50 rounded"><Trash2 size={14} /></button>}
            </div>
          </div>
          {t.reason && <p className="text-xs text-gray-500 mt-1">{t.reason}</p>}
          {t.suggested_message && <div className="mt-2 p-2 bg-orange-50 rounded-lg text-xs text-gray-600">{t.suggested_message}</div>}
          <div className="flex justify-between mt-1 text-xs text-gray-400"><span>Owner:{t.owner_staff || '-'}</span><span>Due:{t.due_date}</span></div>
        </CardContent></Card>
      )}</div>

      {showForm && <div className="fixed inset-0 bg-black/40 z-50 flex items-end md:items-center justify-center" onClick={() => setShowForm(false)}>
        <div className="bg-white rounded-t-xl md:rounded-xl w-full md:w-[500px] max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
          <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center"><h3 className="font-bold">New Task</h3><button onClick={() => setShowForm(false)} className="text-gray-400"><X size={18} /></button></div>
          <form onSubmit={handleSubmit} className="p-4 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div><label className="text-xs text-gray-500">Customer *</label><input required value={form.customer_name} onChange={e => setForm({ ...form, customer_name: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm" /></div>
              <div><label className="text-xs text-gray-500">Type</label><select value={form.task_type} onChange={e => setForm({ ...form, task_type: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm">{TYPE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}</select></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="text-xs text-gray-500">Due Date *</label><input type="date" required value={form.due_date} onChange={e => setForm({ ...form, due_date: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm" /></div>
              <div><label className="text-xs text-gray-500">Owner</label><input value={form.owner_staff} onChange={e => setForm({ ...form, owner_staff: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm" /></div>
            </div>
            <div><label className="text-xs text-gray-500">Reason</label><input value={form.reason} onChange={e => setForm({ ...form, reason: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm" /></div>
            <div><label className="text-xs text-gray-500">Message</label><textarea value={form.suggested_message} onChange={e => setForm({ ...form, suggested_message: e.target.value })} rows={3} className="w-full border rounded-lg px-3 py-2 text-sm" /></div>
            <div className="flex gap-2 pt-2">
              <button type="submit" className="flex-1 bg-blue-600 text-white py-2 rounded-lg text-sm flex items-center justify-center gap-1 hover:bg-blue-700"><Save size={16} /> Create</button>
              <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 border rounded-lg text-sm text-gray-600">Cancel</button>
            </div>
          </form>
        </div>
      </div>}
    </div>
  );
}
