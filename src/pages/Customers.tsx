import { useState } from 'react';
import { useAPI } from '../hooks/useApi';
import { Card, CardContent } from '../components/ui/card';
import { Search, User, Calendar } from 'lucide-react';

export default function Customers() {
  const { data, isLoading } = useAPI('/customers');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<any>(null);
  const customers = (data||[]).filter((c:any) => !search || c.name?.includes(search) || c.phone?.includes(search));
  if (isLoading) return <div className="text-center py-8 text-gray-500">加载中...</div>;
  return (
    <div className="space-y-3">
      <div className="relative"><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" /><input type="text" placeholder="搜索姓名/手机号" value={search} onChange={e=>setSearch(e.target.value)} className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm" /></div>
      <div className="text-xs text-gray-500">共 {customers.length} 位客户</div>
      <div className="space-y-2">{customers.map((c:any) =>
        <Card key={c.id} className="cursor-pointer hover:shadow-md" onClick={()=>setSelected(c)}><CardContent className="p-3">
          <div className="flex items-center gap-2"><User size={16} className="text-blue-500" /><span className="font-medium text-sm">{c.name}</span><span className={'text-xs px-1.5 py-0.5 rounded '+(c.type==='new'?'bg-green-100 text-green-700':c.type==='old'?'bg-blue-100 text-blue-700':'bg-purple-100 text-purple-700')}>{c.type==='new'?'新客':c.type==='old'?'老客':c.type==='hotel'?'酒店':c.type}</span></div>
          <div className="flex gap-3 mt-1 text-xs text-gray-500"><span>{c.phone}</span><span>来源:{c.source}</span><span>关注:{c.concern||'-'}</span></div>
          {c.last_visit_date&&<div className="flex gap-1 mt-1 text-xs text-gray-400"><Calendar size={12}/>最近:{c.last_visit_date}</div>}
        </CardContent></Card>
      )}</div>
      {selected&&<div className="fixed inset-0 bg-black/40 z-50 flex items-end md:items-center justify-center" onClick={()=>setSelected(null)}>
        <div className="bg-white rounded-t-xl md:rounded-xl w-full md:w-[500px] max-h-[80vh] overflow-y-auto" onClick={e=>e.stopPropagation()}>
          <div className="sticky top-0 bg-white border-b p-4 flex justify-between"><h3 className="font-bold">{selected.name} - 详情</h3><button onClick={()=>setSelected(null)} className="text-gray-400">✕</button></div>
          <div className="p-4 grid grid-cols-2 gap-2 text-sm">
            <div className="p-2 bg-gray-50 rounded"><span className="text-gray-500">手机</span><p>{selected.phone||'-'}</p></div>
            <div className="p-2 bg-gray-50 rounded"><span className="text-gray-500">类型</span><p>{selected.type}</p></div>
            <div className="p-2 bg-gray-50 rounded"><span className="text-gray-500">来源</span><p>{selected.source}</p></div>
            <div className="p-2 bg-gray-50 rounded"><span className="text-gray-500">关注</span><p>{selected.concern||'-'}</p></div>
            <div className="p-2 bg-gray-50 rounded"><span className="text-gray-500">首访</span><p>{selected.first_visit_date||'-'}</p></div>
            <div className="p-2 bg-gray-50 rounded"><span className="text-gray-500">最近</span><p>{selected.last_visit_date||'-'}</p></div>
          </div>
        </div>
      </div>}
    </div>
  );
}
