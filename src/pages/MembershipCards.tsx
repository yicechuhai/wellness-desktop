import { useState } from 'react';
import { useAPI, useAPIMutation } from '../hooks/useApi';
import { useAuth } from '../hooks/useAuth';
import { Card, CardContent } from '../components/ui/card';
import { Repeat, Plus, Trash2, X, Save, Download } from 'lucide-react';

export default function MembershipCards() {
  const { can } = useAuth();
  const { data, isLoading, refetch } = useAPI('/cards');
  const createMut = useAPIMutation('/cards');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ customer_name: '', card_name: '', purchase_amount: '', total_times: '10', gift_times: '0', applicable_items: '', expire_date: '' });
  const cards = data || [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.customer_name.trim()) return alert('Enter customer name');
    if (!form.card_name.trim()) return alert('Enter card name');
    await createMut.post({ ...form, purchase_amount: parseFloat(form.purchase_amount) || 0, total_times: parseInt(form.total_times) || 10, gift_times: parseInt(form.gift_times) || 0 });
    setShowForm(false);
    setForm({ customer_name: '', card_name: '', purchase_amount: '', total_times: '10', gift_times: '0', applicable_items: '', expire_date: '' });
    refetch();
  };

  const handleDelete = async (id: number) => { if (!confirm('Delete?')) return; await fetch(`/api/cards/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${localStorage.getItem('wellness_token')}` } }); refetch(); };
  const doExport = () => { const t = localStorage.getItem('wellness_token'); fetch('/api/export/membership_card', { headers: { Authorization: `Bearer ${t}` } }).then(r => r.blob()).then(b => { const u = URL.createObjectURL(b); const a = document.createElement('a'); a.href = u; a.download = `cards_${new Date().toISOString().slice(0,10)}.xlsx`; a.click(); URL.revokeObjectURL(u); }); };

  if (isLoading) return <div className="text-center py-8 text-gray-500">Loading...</div>;

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-3">
        <Card className="bg-blue-50"><CardContent className="p-3 text-center"><p className="text-xs text-gray-500">Total</p><p className="text-xl font-bold">{cards.length}</p></CardContent></Card>
        <Card className="bg-green-50"><CardContent className="p-3 text-center"><p className="text-xs text-gray-500">Active</p><p className="text-xl font-bold text-green-600">{cards.filter((c: any) => c.status === 'active').length}</p></CardContent></Card>
        <Card className="bg-orange-50"><CardContent className="p-3 text-center"><p className="text-xs text-gray-500">Expiring</p><p className="text-xl font-bold text-orange-600">{cards.filter((c: any) => c.status === 'expiring').length}</p></CardContent></Card>
      </div>
      <div className="flex justify-end gap-2">
        {can('card.create') && <button onClick={() => setShowForm(true)} className="bg-blue-600 text-white px-3 py-2 rounded-lg text-sm flex items-center gap-1 hover:bg-blue-700"><Plus size={16} /> New Card</button>}
        {can('export') && <button onClick={doExport} className="bg-green-600 text-white px-3 py-2 rounded-lg text-sm flex items-center gap-1 hover:bg-green-700" title="Export"><Download size={16} /></button>}
      </div>
      <div className="space-y-2">{cards.map((c: any) =>
        <Card key={c.id}><CardContent className="p-3">
          <div className="flex justify-between items-start">
            <div className="flex gap-2 items-center">
              <Repeat size={16} className={c.status === 'expiring' ? 'text-orange-500' : 'text-blue-500'} />
              <span className="font-medium text-sm">{c.customer_name}</span>
              <span className={'text-xs px-2 py-0.5 rounded ' + (c.status === 'expiring' ? 'bg-orange-100 text-orange-700' : c.status === 'used_up' ? 'bg-gray-100 text-gray-500' : 'bg-green-100 text-green-700')}>{c.status === 'expiring' ? 'Expiring' : c.status === 'used_up' ? 'Used' : 'Active'}</span>
            </div>
            {can('card.delete') && <button onClick={() => handleDelete(c.id)} className="p-1 text-red-600 hover:bg-red-50 rounded"><Trash2 size={14} /></button>}
          </div>
          <div className="mt-2">
            <div className="flex justify-between text-xs text-gray-500 mb-1"><span>{c.card_name}</span><span>{c.used_times}/{c.total_times + c.gift_times}x</span></div>
            <div className="w-full bg-gray-200 rounded-full h-2"><div className="bg-blue-500 h-2 rounded-full transition-all" style={{ width: Math.min(100, ((c.used_times || 0) / ((c.total_times || 1) + (c.gift_times || 0))) * 100) + '%' }} /></div>
            <div className="flex justify-between text-xs text-gray-400 mt-1"><span>Left:{c.remaining_times}</span><span>Exp:{c.expire_date || '-'}</span><span>¥{c.purchase_amount || 0}</span></div>
          </div>
        </CardContent></Card>
      )}</div>

      {showForm && <div className="fixed inset-0 bg-black/40 z-50 flex items-end md:items-center justify-center" onClick={() => setShowForm(false)}>
        <div className="bg-white rounded-t-xl md:rounded-xl w-full md:w-[500px] max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
          <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center"><h3 className="font-bold">New Card</h3><button onClick={() => setShowForm(false)} className="text-gray-400"><X size={18} /></button></div>
          <form onSubmit={handleSubmit} className="p-4 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div><label className="text-xs text-gray-500">Customer *</label><input required value={form.customer_name} onChange={e => setForm({ ...form, customer_name: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm" /></div>
              <div><label className="text-xs text-gray-500">Card Name *</label><input required value={form.card_name} onChange={e => setForm({ ...form, card_name: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm" /></div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div><label className="text-xs text-gray-500">Amount</label><input type="number" value={form.purchase_amount} onChange={e => setForm({ ...form, purchase_amount: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm" /></div>
              <div><label className="text-xs text-gray-500">Times</label><input type="number" value={form.total_times} onChange={e => setForm({ ...form, total_times: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm" /></div>
              <div><label className="text-xs text-gray-500">Gift</label><input type="number" value={form.gift_times} onChange={e => setForm({ ...form, gift_times: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm" /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="text-xs text-gray-500">Items</label><input value={form.applicable_items} onChange={e => setForm({ ...form, applicable_items: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm" /></div>
              <div><label className="text-xs text-gray-500">Expire</label><input type="date" value={form.expire_date} onChange={e => setForm({ ...form, expire_date: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm" /></div>
            </div>
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
