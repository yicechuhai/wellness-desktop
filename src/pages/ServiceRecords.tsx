import { useState } from 'react';
import { useAPI, useAPIMutation } from '../hooks/useApi';
import { Card, CardContent } from '../components/ui/card';
import { ClipboardList, Plus, Trash2, X, Save } from 'lucide-react';

export default function ServiceRecords() {
  const { data, isLoading, refetch } = useAPI('/services');
  const { data: itemsData } = useAPI('/items');
  const createMut = useAPIMutation('/services');
  const [filterDate, setFilterDate] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ date: new Date().toISOString().slice(0, 10), customer_name: '', service_item: '', therapist: '', card_amount: '', quantity: '1', is_gift: false, note: '' });

  const records = (data || []).filter((r: any) => !filterDate || r.date?.startsWith(filterDate));
  const items = (itemsData || []).map((i: any) => i.name);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.customer_name.trim()) return alert('Enter customer name');
    if (!form.service_item) return alert('Select service item');
    await createMut.post({ ...form, card_amount: parseFloat(form.card_amount) || 0, quantity: parseInt(form.quantity) || 1 });
    setShowForm(false);
    setForm({ date: new Date().toISOString().slice(0, 10), customer_name: '', service_item: '', therapist: '', card_amount: '', quantity: '1', is_gift: false, note: '' });
    refetch();
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete?')) return;
    await fetch(`http://localhost:3001/api/services/${id}`, { method: 'DELETE' });
    refetch();
  };

  if (isLoading) return <div className="text-center py-8 text-gray-500">Loading...</div>;

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <input type="date" value={filterDate} onChange={e => setFilterDate(e.target.value)} className="border rounded-lg px-3 py-2 text-sm" />
        {filterDate && <button onClick={() => setFilterDate('')} className="text-sm text-blue-600 px-2">Clear</button>}
        <button onClick={() => setShowForm(true)} className="bg-blue-600 text-white px-3 py-2 rounded-lg text-sm flex items-center gap-1 hover:bg-blue-700 ml-auto"><Plus size={16} /> Add</button>
      </div>
      <div className="text-xs text-gray-500">{records.length} records</div>
      <div className="space-y-2">{records.map((r: any) =>
        <Card key={r.id}><CardContent className="p-3">
          <div className="flex justify-between items-start">
            <div className="flex gap-2 items-center">
              <ClipboardList size={16} className="text-blue-500" />
              <span className="font-medium text-sm">{r.customer_name}</span>
              {r.is_gift ? <span className="text-xs px-1.5 py-0.5 rounded bg-pink-100 text-pink-700">Gift</span> : null}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400">{r.date}</span>
              <button onClick={() => handleDelete(r.id)} className="p-1 text-red-600 hover:bg-red-50 rounded"><Trash2 size={14} /></button>
            </div>
          </div>
          <div className="flex gap-3 mt-1 text-xs text-gray-500">
            <span>{r.service_item}</span><span>Therapist:{r.therapist || '-'}</span><span>{r.quantity > 1 ? r.quantity + 'x' : '1x'}</span>
            {r.card_amount > 0 && <span>Card:¥{r.card_amount}</span>}
          </div>
        </CardContent></Card>
      )}</div>

      {showForm && <div className="fixed inset-0 bg-black/40 z-50 flex items-end md:items-center justify-center" onClick={() => setShowForm(false)}>
        <div className="bg-white rounded-t-xl md:rounded-xl w-full md:w-[500px] max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
          <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
            <h3 className="font-bold">New Service Record</h3><button onClick={() => setShowForm(false)} className="text-gray-400"><X size={18} /></button>
          </div>
          <form onSubmit={handleSubmit} className="p-4 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div><label className="text-xs text-gray-500">Date *</label><input type="date" required value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm" /></div>
              <div><label className="text-xs text-gray-500">Customer *</label><input required value={form.customer_name} onChange={e => setForm({ ...form, customer_name: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm" /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="text-xs text-gray-500">Service Item *</label>
                <select required value={form.service_item} onChange={e => setForm({ ...form, service_item: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm">
                  <option value="">Select</option>{items.map((name: string) => <option key={name} value={name}>{name}</option>)}
                </select>
              </div>
              <div><label className="text-xs text-gray-500">Therapist</label><input value={form.therapist} onChange={e => setForm({ ...form, therapist: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm" /></div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div><label className="text-xs text-gray-500">Qty</label><input type="number" min="1" value={form.quantity} onChange={e => setForm({ ...form, quantity: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm" /></div>
              <div><label className="text-xs text-gray-500">Card Amount</label><input type="number" value={form.card_amount} onChange={e => setForm({ ...form, card_amount: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm" /></div>
              <div className="flex items-end pb-2"><label className="flex items-center gap-2 text-sm cursor-pointer"><input type="checkbox" checked={form.is_gift} onChange={e => setForm({ ...form, is_gift: e.target.checked })} className="rounded" /><span>Gift</span></label></div>
            </div>
            <div><label className="text-xs text-gray-500">Note</label><textarea value={form.note} onChange={e => setForm({ ...form, note: e.target.value })} rows={2} className="w-full border rounded-lg px-3 py-2 text-sm" /></div>
            <div className="flex gap-2 pt-2">
              <button type="submit" className="flex-1 bg-blue-600 text-white py-2 rounded-lg text-sm flex items-center justify-center gap-1 hover:bg-blue-700"><Save size={16} /> Save</button>
              <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 border rounded-lg text-sm text-gray-600">Cancel</button>
            </div>
          </form>
        </div>
      </div>}
    </div>
  );
}
