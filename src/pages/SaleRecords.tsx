import { useState } from 'react';
import { useAPI } from '../hooks/useApi';
import { Card, CardContent } from '../components/ui/card';
import { CreditCard } from 'lucide-react';

export default function SaleRecords() {
  const { data, isLoading } = useAPI('/sales');
  const [line, setLine] = useState('all');
  const records = (data||[]).filter((r:any) => line==='all' || r.business_line===line);
  const wTotal = (data||[]).filter((r:any)=>r.business_line==='wellness').reduce((s:number,r:any)=>s+(r.total_amount||0),0);
  const cTotal = (data||[]).filter((r:any)=>r.business_line==='clinic').reduce((s:number,r:any)=>s+(r.total_amount||0),0);
  if (isLoading) return <div className="text-center py-8 text-gray-500">加载中...</div>;
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <Card className="bg-green-50"><CardContent className="p-3 text-center"><p className="text-xs text-gray-500">养生馆</p><p className="text-lg font-bold text-green-600">{wTotal.toFixed(2)}</p></CardContent></Card>
        <Card className="bg-blue-50"><CardContent className="p-3 text-center"><p className="text-xs text-gray-500">中医馆</p><p className="text-lg font-bold text-blue-600">{cTotal.toFixed(2)}</p></CardContent></Card>
      </div>
      <div className="flex gap-2">{[{k:'all',l:'全部'},{k:'wellness',l:'养生馆'},{k:'clinic',l:'中医馆'}].map(t =>
        <button key={t.k} onClick={()=>setLine(t.k)} className={'px-3 py-1.5 rounded-lg text-xs '+(line===t.k?'bg-blue-600 text-white':'bg-gray-100 text-gray-600')}>{t.l}</button>
      )}</div>
      <div className="text-xs text-gray-500">共 {records.length} 条</div>
      <div className="space-y-2">{records.map((r:any) =>
        <Card key={r.id}><CardContent className="p-3">
          <div className="flex justify-between"><div className="flex gap-2"><CreditCard size={16} className={r.business_line==='wellness'?'text-green-500':'text-blue-500'}/><span className="font-medium text-sm">{r.customer_name}</span></div><span className="text-sm font-bold">{(r.total_amount||0).toFixed(2)}</span></div>
          <div className="flex gap-3 mt-1 text-xs text-gray-500"><span>{r.item}</span><span>{r.date}</span><span>{r.business_line==='wellness'?'养生':'中医'}</span></div>
        </CardContent></Card>
      )}</div>
    </div>
  );
}
