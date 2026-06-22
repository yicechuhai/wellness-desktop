import { useState } from 'react';
import { useAPI } from '../hooks/useApi';
import { Card, CardContent } from '../components/ui/card';
import { Package, Plus, Edit2, Trash2, X, Save } from 'lucide-react';

export default function ServiceItems() {
  const { data, isLoading, refetch } = useAPI('/items');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ name: '', single_price: '', package_price: '', package_times: '10', activity_price: '', description: '', contraindication: '' });
  const items = data || [];

  const resetForm = () => { setForm({ name: '', single_price: '', package_price: '', package_times: '10', activity_price: '', description: '', contraindication: '' }); setEditing(null); };
  const openCreate = () => { resetForm(); setShowForm(true); };
  const openEdit = (item: any) => {
    setEditing(item);
    setForm({ name: item.name || '', single_price: String(item.single_price || ''), package_price: String(item.package_price || ''), package_times: String(item.package_times || '10'), activity_price: String(item.activity_price || ''), description: item.description || '', contraindication: item.contraindication || '' });
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return alert('Enter item name');
    const body = { name: form.name, single_price: parseFloat(form.single_price) || 0, package_price: parseFloat(form.package_price) || 0, package_times: parseInt(form.package_times) || 10, activity_price: parseFloat(form.activity_price) || 0, description: form.description, contraindication: form.contraindication };
    if (editing) { await fetch(`http://localhost:3001/api/items/${editing.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }); }
    else { await fetch('http://localhost:3001/api/items', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }); }
    setShowForm(false); resetForm(); refetch();
  };

  const handleDelete = async (id: number) => { if (!confirm('Delete?')) return; await fetch(`http://localhost:3001/api/items/${id}`, { method: 'DELETE' }); refetch(); };

  if (isLoading) return <div className="text-center py-8 text-gray-500">Loading...</div>;

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <div className="text-xs text-gray-500">{items.length} items</div>
        <button onClick={openCreate} className="bg-blue-600 text-white px-3 py-2 rounded-lg text-sm flex items-center gap-1 hover:bg-blue-700"><Plus size={16} /> Add</button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">{items.map((item: any) =>
        <Card key={item.id}><CardContent className="p-4">
          <div className="flex justify-between items-start">
            <div className="flex gap-2 items-center"><Package size={16} className="text-blue-500" /><span className="font-medium">{item.name}</span></div>
            <div className="flex gap-1">
              <button onClick={() => openEdit(item)} className="p-1 text-blue-600 hover:bg-blue-50 rounded"><Edit2 size={14} /></button>
              <button onClick={() => handleDelete(item.id)} className="p-1 text-red-600 hover:bg-red-50 rounded"><Trash2 size={14} /></button>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center mt-3">
            <div className="p-2 bg-gray-50 rounded"><p className="text-xs text-gray-500">Single</p><p className="text-sm font-bold">{item.single_price}</p></div>
            <div className="p-2 bg-blue-50 rounded"><p className="text-xs text-gray-500">Pkg({item.package_times}x)</p><p className="text-sm font-bold text-blue-600">{item.package_price}</p></div>
            <div className="p-2 bg-orange-50 rounded"><p className="text-xs text-gray-500">Deal</p><p className="text-sm font-bold text-orange-600">{item.activity_price}</p></div>
          </div>
          {item.description && <p className="text-xs text-gray-500 mt-2">{item.description}</p>}
          {item.contraindication && <p className="text-xs text-red-400 mt-1">Contra:{item.contraindication}</p>}
        </CardContent></Card>
      )}</div>

      {showForm && <div className="fixed inset-0 bg-black/40 z-50 flex items-end md:items-center justify-center" onClick={() => setShowForm(false)}>
        <div className="bg-white rounded-t-xl md:rounded-xl w-full md:w-[500px] max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
          <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
            <h3 className="font-bold">{editing ? 'Edit Item' : 'New Item'}</h3><button onClick={() => setShowForm(false)} className="text-gray-400"><X size={18} /></button>
          </div>
          <form onSubmit={handleSubmit} className="p-4 space-y-3">
            <div><label className="text-xs text-gray-500">Name *</label><input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm" /></div>
            <div className="grid grid-cols-3 gap-3">
              <div><label className="text-xs text-gray-500">Single</label><input type="number" value={form.single_price} onChange={e => setForm({ ...form, single_price: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm" /></div>
              <div><label className="text-xs text-gray-500">Package</label><input type="number" value={form.package_price} onChange={e => setForm({ ...form, package_price: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm" /></div>
              <div><label className="text-xs text-gray-500">Deal</label><input type="number" value={form.activity_price} onChange={e => setForm({ ...form, activity_price: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm" /></div>
            </div>
            <div><label className="text-xs text-gray-500">Times</label><input type="number" value={form.package_times} onChange={e => setForm({ ...form, package_times: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm" /></div>
            <div><label className="text-xs text-gray-500">Description</label><textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={2} className="w-full border rounded-lg px-3 py-2 text-sm" /></div>
            <div><label className="text-xs text-gray-500">Contraindication</label><input value={form.contraindication} onChange={e => setForm({ ...form, contraindication: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm" /></div>
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
