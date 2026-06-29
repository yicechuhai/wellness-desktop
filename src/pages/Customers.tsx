import { useState } from 'react';
import { useAPI, useAPIMutation } from '../hooks/useApi';
import { useAuth } from '../hooks/useAuth';
import { Card, CardContent } from '../components/ui/card';
import { Search, User, Calendar, Plus, Edit2, Trash2, X, Save, Download } from 'lucide-react';

const TYPE_OPTIONS = [
  { value: 'new', label: 'New' },
  { value: 'old', label: 'Regular' },
  { value: 'hotel', label: 'Hotel' },
];

const SOURCE_OPTIONS = [
  { value: 'walk_in', label: 'Walk-in' },
  { value: 'referral', label: 'Referral' },
  { value: 'douyin', label: 'Douyin' },
  { value: 'meituan', label: 'Meituan' },
  { value: 'hotel', label: 'Hotel' },
  { value: 'other', label: 'Other' },
];

export default function Customers() {
  const { can } = useAuth();
  const { data, isLoading, refetch } = useAPI('/customers');
  const createMut = useAPIMutation('/customers');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<any>(null);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ name: '', phone: '', wechat: '', type: 'new', source: 'walk_in', concern: '', first_visit_date: '', last_visit_date: '', owner_staff: '', note: '' });

  const customers = (data || []).filter((c: any) => !search || c.name?.includes(search) || c.phone?.includes(search));

  const resetForm = () => { setForm({ name: '', phone: '', wechat: '', type: 'new', source: 'walk_in', concern: '', first_visit_date: '', last_visit_date: '', owner_staff: '', note: '' }); setEditing(null); };
  const openCreate = () => { resetForm(); setShowForm(true); setSelected(null); };
  const openEdit = (c: any) => { setEditing(c); setForm({ name: c.name || '', phone: c.phone || '', wechat: c.wechat || '', type: c.type || 'new', source: c.source || 'walk_in', concern: c.concern || '', first_visit_date: c.first_visit_date || '', last_visit_date: c.last_visit_date || '', owner_staff: c.owner_staff || '', note: c.note || '' }); setShowForm(true); setSelected(null); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return alert('Name required');
    if (editing) { await fetch(`/api/customers/${editing.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('wellness_token')}` }, body: JSON.stringify(form) }); }
    else { await createMut.post(form); }
    setShowForm(false); resetForm(); refetch();
  };

  const handleDelete = async (id: number) => { if (!confirm('Delete?')) return; await fetch(`/api/customers/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${localStorage.getItem('wellness_token')}` } }); refetch(); setSelected(null); };

  const handleExport = () => {
    const token = localStorage.getItem('wellness_token');
    fetch('/api/export/customer', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.blob())
      .then(blob => { const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = `customers_${new Date().toISOString().slice(0,10)}.xlsx`; a.click(); URL.revokeObjectURL(url); });
  };

  if (isLoading) return <div className="text-center py-8 text-gray-500">Loading...</div>;

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <div className="relative flex-1"><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" /><input type="text" placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm" /></div>
        {can('customer.create') && <button onClick={openCreate} className="bg-blue-600 text-white px-3 py-2 rounded-lg text-sm flex items-center gap-1 hover:bg-blue-700"><Plus size={16} /></button>}
        {can('export') && <button onClick={handleExport} className="bg-green-600 text-white px-3 py-2 rounded-lg text-sm flex items-center gap-1 hover:bg-green-700" title="Export Excel"><Download size={16} /></button>}
      </div>
      <div className="text-xs text-gray-500">{customers.length} customers</div>

      <div className="space-y-2">{customers.map((c: any) =>
        <Card key={c.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setSelected(c)}>
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2"><User size={16} className="text-blue-500" /><span className="font-medium text-sm">{c.name}</span><span className={'text-xs px-1.5 py-0.5 rounded ' + (c.type === 'new' ? 'bg-green-100 text-green-700' : c.type === 'old' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700')}>{c.type === 'new' ? 'New' : c.type === 'old' ? 'Regular' : 'Hotel'}</span></div>
              <div className="flex gap-1" onClick={e => e.stopPropagation()}>
                {can('customer.edit') && <button onClick={() => openEdit(c)} className="p-1 text-blue-600 hover:bg-blue-50 rounded"><Edit2 size={14} /></button>}
                {can('customer.delete') && <button onClick={() => handleDelete(c.id)} className="p-1 text-red-600 hover:bg-red-50 rounded"><Trash2 size={14} /></button>}
              </div>
            </div>
            <div className="flex gap-3 mt-1 text-xs text-gray-500"><span>{c.phone}</span><span>Src:{c.source}</span><span>Concern:{c.concern || '-'}</span></div>
            {c.last_visit_date && <div className="flex gap-1 mt-1 text-xs text-gray-400"><Calendar size={12} />Last:{c.last_visit_date}</div>}
          </CardContent>
        </Card>
      )}</div>

      {/* Detail Modal */}
      {selected && <div className="fixed inset-0 bg-black/40 z-50 flex items-end md:items-center justify-center" onClick={() => setSelected(null)}>
        <div className="bg-white rounded-t-xl md:rounded-xl w-full md:w-[500px] max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
          <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
            <h3 className="font-bold">{selected.name}</h3>
            <div className="flex gap-2">
              {can('customer.edit') && <button onClick={() => openEdit(selected)} className="text-blue-600 text-sm flex items-center gap-1"><Edit2 size={14} />Edit</button>}
              <button onClick={() => setSelected(null)} className="text-gray-400"><X size={18} /></button>
            </div>
          </div>
          <div className="p-4 grid grid-cols-2 gap-2 text-sm">
            <div className="p-2 bg-gray-50 rounded"><span className="text-gray-500 text-xs">Phone</span><p>{selected.phone || '-'}</p></div>
            <div className="p-2 bg-gray-50 rounded"><span className="text-gray-500 text-xs">WeChat</span><p>{selected.wechat || '-'}</p></div>
            <div className="p-2 bg-gray-50 rounded"><span className="text-gray-500 text-xs">Type</span><p>{selected.type}</p></div>
            <div className="p-2 bg-gray-50 rounded"><span className="text-gray-500 text-xs">Source</span><p>{selected.source}</p></div>
            <div className="p-2 bg-gray-50 rounded"><span className="text-gray-500 text-xs">Concern</span><p>{selected.concern || '-'}</p></div>
            <div className="p-2 bg-gray-50 rounded"><span className="text-gray-500 text-xs">Owner</span><p>{selected.owner_staff || '-'}</p></div>
            <div className="p-2 bg-gray-50 rounded"><span className="text-gray-500 text-xs">First Visit</span><p>{selected.first_visit_date || '-'}</p></div>
            <div className="p-2 bg-gray-50 rounded"><span className="text-gray-500 text-xs">Last Visit</span><p>{selected.last_visit_date || '-'}</p></div>
            {selected.note && <div className="col-span-2 p-2 bg-gray-50 rounded"><span className="text-gray-500 text-xs">Note</span><p>{selected.note}</p></div>}
          </div>
        </div>
      </div>}

      {/* Form Modal */}
      {showForm && <div className="fixed inset-0 bg-black/40 z-50 flex items-end md:items-center justify-center" onClick={() => setShowForm(false)}>
        <div className="bg-white rounded-t-xl md:rounded-xl w-full md:w-[500px] max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
          <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center"><h3 className="font-bold">{editing ? 'Edit' : 'New'} Customer</h3><button onClick={() => setShowForm(false)} className="text-gray-400"><X size={18} /></button></div>
          <form onSubmit={handleSubmit} className="p-4 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div><label className="text-xs text-gray-500">Name *</label><input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm" /></div>
              <div><label className="text-xs text-gray-500">Phone</label><input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm" /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="text-xs text-gray-500">WeChat</label><input value={form.wechat} onChange={e => setForm({ ...form, wechat: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm" /></div>
              <div><label className="text-xs text-gray-500">Owner</label><input value={form.owner_staff} onChange={e => setForm({ ...form, owner_staff: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm" /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="text-xs text-gray-500">Type</label><select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm">{TYPE_OPTIONS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}</select></div>
              <div><label className="text-xs text-gray-500">Source</label><select value={form.source} onChange={e => setForm({ ...form, source: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm">{SOURCE_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}</select></div>
            </div>
            <div><label className="text-xs text-gray-500">Concern</label><input value={form.concern} onChange={e => setForm({ ...form, concern: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="text-xs text-gray-500">First Visit</label><input type="date" value={form.first_visit_date} onChange={e => setForm({ ...form, first_visit_date: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm" /></div>
              <div><label className="text-xs text-gray-500">Last Visit</label><input type="date" value={form.last_visit_date} onChange={e => setForm({ ...form, last_visit_date: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm" /></div>
            </div>
            <div><label className="text-xs text-gray-500">Note</label><textarea value={form.note} onChange={e => setForm({ ...form, note: e.target.value })} rows={2} className="w-full border rounded-lg px-3 py-2 text-sm" /></div>
            <div className="flex gap-2 pt-2">
              <button type="submit" className="flex-1 bg-blue-600 text-white py-2 rounded-lg text-sm flex items-center justify-center gap-1 hover:bg-blue-700"><Save size={16} /> {editing ? 'Save' : 'Create'}</button>
              <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 border rounded-lg text-sm text-gray-600">Cancel</button>
            </div>
          </form>
        </div>
      </div>}
    </div>
  );
}
