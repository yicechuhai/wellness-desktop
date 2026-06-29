import { useState } from 'react';
import { useAPI, useAPIMutation } from '../hooks/useApi';
import { useAuth } from '../hooks/useAuth';
import { Card, CardContent } from '../components/ui/card';
import { CreditCard, Plus, Trash2, X, Save, Download } from 'lucide-react';

export default function SaleRecords() {
  const { can } = useAuth();
  const { data, isLoading, refetch } = useAPI('/sales');
  const createMut = useAPIMutation('/sales');
  const [line, setLine] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ date: new Date().toISOString().slice(0, 10), business_line: 'wellness', customer_name: '', item: '', cash_amount: '', pos_amount: '', total_amount: '', card_times: '', seller: '', note: '' });

  const records = (data || []).filter((r: any) => line === 'all' || r.business_line === line);
  const wTotal = (data || []).filter((r: any) => r.business_line === 'wellness').reduce((s: number, r: any) => s + (r.total_amount || 0), 0);
  const cTotal = (data || []).filter((r: any) => r.business_line === 'clinic').reduce((s: number, r: any) => s + (r.total_amount || 0), 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.customer_name.trim()) return alert('Enter customer name');
    if (!form.item.trim()) return alert('Enter item');
    const cash = parseFloat(form.cash_amount) || 0;
    const pos = parseFloat(form.pos_amount) || 0;
    const total = parseFloat(form.total_amount) || cash + pos;
    await createMut.post({ ...form, cash_amount: cash, pos_amount: pos, total_amount: total, card_times: parseInt(form.card_times) || 0 });
    setShowForm(false);
    setForm({ date: new Date().toISOString().slice(0, 10), business_line: 'wellness', customer_name: '', item: '', cash_amount: '', pos_amount: '', total_amount: '', card_times: '', seller: '', note: '' });
    refetch();
  };

  const handleDelete = async (id: number) => { if (!confirm('Delete?')) return; await fetch(`/api/sales/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${localStorage.getItem('wellness_token')}` } }); refetch(); };
  const doExport = () => { const t = localStorage.getItem('wellness_token'); fetch('/api/export/sale_record', { headers: { Authorization: `Bearer ${t}` } }).then(r => r.blob()).then(b => { const u = URL.createObjectURL(b); const a = document.createElement('a'); a.href = u; a.download = `sales_${new Date().toISOString().slice(0,10)}.xlsx`; a.click(); URL.revokeObjectURL(u); }); };

  if (isLoading) return <div className="text-center py-8 text-gray-500">Loading...</div>;

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <Card className="bg-green-50"><CardContent className="p-3 text-center"><p className="text-xs text-gray-500">Wellness</p><p className="text-lg font-bold text-green-600">{wTotal.toFixed(2)}</p></CardContent></Card>
        <Card className="bg-blue-50"><CardContent className="p-3 text-center"><p className="text-xs text-gray-500">Clinic</p><p className="text-lg font-bold text-blue-600">{cTotal.toFixed(2)}</p></CardContent></Card>
      </div>
      <div className="flex gap-2">
        {[{ k: 'all', l: 'All' }, { k: 'wellness', l: 'Wellness' }, { k: 'clinic', l: 'Clinic' }].map(t => <button key={t.k} onClick={() => setLine(t.k)} className={'px-3 py-1.5 rounded-lg text-xs ' + (line === t.k ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600')}>{t.l}</button>)}
        {can('sale.create') && <button onClick={() => setShowForm(true)} className="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-sm flex items-center gap-1 hover:bg-blue-700 ml-auto"><Plus size={14} /> Add</button>}
        {can('export') && <button onClick={doExport} className="bg-green-600 text-white px-3 py-1.5 rounded-lg text-sm flex items-center gap-1 hover:bg-green-700" title="Export"><Download size={14} /></button>}
      </div>
      <div className="text-xs text-gray-500">{records.length} records</div>
      <div className="space-y-2">{records.map((r: any) =>
        <Card key={r.id}><CardContent className="p-3">
          <div className="flex justify-between items-start">
            <div className="flex gap-2 items-center"><CreditCard size={16} className={r.business_line === 'wellness' ? 'text-green-500' : 'text-blue-500'} /><span className="font-medium text-sm">{r.customer_name}</span></div>
            <div className="flex items-center gap-2"><span className="text-sm font-bold">{(r.total_amount || 0).toFixed(2)}</span>{can('sale.delete') && <button onClick={() => handleDelete(r.id)} className="p-1 text-red-600 hover:bg-red-50 rounded"><Trash2 size={14} /></button>}</div>
          </div>
          <div className="flex gap-3 mt-1 text-xs text-gray-500"><span>{r.item}</span><span>{r.date}</span><span>{r.business_line}</span></div>
        </CardContent></Card>
      )}</div>

      {showForm && <div className="fixed inset-0 bg-black/40 z-50 flex items-end md:items-center justify-center" onClick={() => setShowForm(false)}>
        <div className="bg-white rounded-t-xl md:rounded-xl w-full md:w-[500px] max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
          <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center"><h3 className="font-bold">New Sale</h3><button onClick={() => setShowForm(false)} className="text-gray-400"><X size={18} /></button></div>
          <form onSubmit={handleSubmit} className="p-4 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div><label className="text-xs text-gray-500">Date *</label><input type="date" required value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm" /></div>
              <div><label className="text-xs text-gray-500">Line</label><select value={form.business_line} onChange={e => setForm({ ...form, business_line: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm"><option value="wellness">Wellness</option><option value="clinic">Clinic</option></select></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="text-xs text-gray-500">Customer *</label><input required value={form.customer_name} onChange={e => setForm({ ...form, customer_name: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm" /></div>
              <div><label className="text-xs text-gray-500">Item *</label><input required value={form.item} onChange={e => setForm({ ...form, item: e.target.value })} placeholder="e.g. 10x Card" className="w-full border rounded-lg px-3 py-2 text-sm" /></div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div><label className="text-xs text-gray-500">Cash</label><input type="number" value={form.cash_amount} onChange={e => setForm({ ...form, cash_amount: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm" /></div>
              <div><label className="text-xs text-gray-500">POS</label><input type="number" value={form.pos_amount} onChange={e => setForm({ ...form, pos_amount: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm" /></div>
              <div><label className="text-xs text-gray-500">Total</label><input type="number" value={form.total_amount} onChange={e => setForm({ ...form, total_amount: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm" /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="text-xs text-gray-500">Times</label><input type="number" value={form.card_times} onChange={e => setForm({ ...form, card_times: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm" /></div>
              <div><label className="text-xs text-gray-500">Seller</label><input value={form.seller} onChange={e => setForm({ ...form, seller: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm" /></div>
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
