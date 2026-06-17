import { useState } from 'react';
import { useAPI } from '../hooks/useApi';
import { Card, CardContent } from '../components/ui/card';
import { ClipboardList, Gift } from 'lucide-react';

export default function ServiceRecords() {
  const { data, isLoading } = useAPI('/services');
  const [filterDate, setFilterDate] = useState('');
  const records = (data||[]).filter((r:any) => !filterDate || r.date?.startsWith(filterDate));
  if (isLoading) return <div className="text-center py-8 text-gray-500">加载中...</div>;
  return (
    <div className="space-y-3">
      <div className="flex gap-2"><input type="date" value={filterDate} onChange={e=>setFilterDate(e.target.value)} className="border rounded-lg px-3 py-2 text-sm" />{filterDate&&<button onClick={()=>setFilterDate('')} className="text-sm text-blue-600">清除</button>}</div>
      <div className="text-xs text-gray-500">共 {records.length} 条</div>
      <div className="space-y-2">{records.map((r:any) =>
        <Card key={r.id}><CardContent className="p-3">
          <div className="flex justify-between"><div className="flex gap-2"><ClipboardList size={16} className="text-blue-500"/><span className="font-medium text-sm">{r.customer_name}</span>{r.is_gift&&<Gift size={14} className="text-pink-500"/>}</div><span className="text-xs text-gray-400">{r.date}</span></div>
          <div className="flex gap-3 mt-1 text-xs text-gray-500"><span>{r.service_item}</span><span>调理师:{r.therapist||'-'}</span><span>¥{r.card_amount}</span></div>
        </CardContent></Card>
      )}</div>
    </div>
  );
}
