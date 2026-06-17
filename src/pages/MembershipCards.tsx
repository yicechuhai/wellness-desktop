import { useAPI } from '../hooks/useApi';
import { Card, CardContent } from '../components/ui/card';
import { Repeat } from 'lucide-react';

export default function MembershipCards() {
  const { data, isLoading } = useAPI('/cards');
  const cards = data || [];
  if (isLoading) return <div className="text-center py-8 text-gray-500">加载中...</div>;
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-3">
        <Card className="bg-blue-50"><CardContent className="p-3 text-center"><p className="text-xs text-gray-500">总卡片</p><p className="text-xl font-bold">{cards.length}</p></CardContent></Card>
        <Card className="bg-green-50"><CardContent className="p-3 text-center"><p className="text-xs text-gray-500">正常</p><p className="text-xl font-bold text-green-600">{cards.filter((c:any)=>c.status==='active').length}</p></CardContent></Card>
        <Card className="bg-orange-50"><CardContent className="p-3 text-center"><p className="text-xs text-gray-500">即将到期</p><p className="text-xl font-bold text-orange-600">{cards.filter((c:any)=>c.status==='expiring').length}</p></CardContent></Card>
      </div>
      <div className="space-y-2">{cards.map((c:any) =>
        <Card key={c.id}><CardContent className="p-3">
          <div className="flex justify-between"><div className="flex gap-2"><Repeat size={16} className={c.status==='expiring'?'text-orange-500':'text-blue-500'}/><span className="font-medium text-sm">{c.customer_name}</span></div><span className={'text-xs px-2 py-0.5 rounded '+(c.status==='expiring'?'bg-orange-100 text-orange-700':'bg-green-100 text-green-700')}>{c.status==='expiring'?'即将到期':'正常'}</span></div>
          <div className="mt-2"><div className="flex justify-between text-xs text-gray-500 mb-1"><span>{c.card_name}</span><span>{c.used_times}/{c.total_times}次</span></div><div className="w-full bg-gray-200 rounded-full h-2"><div className="bg-blue-500 h-2 rounded-full" style={{width:Math.min(100,(c.used_times/c.total_times)*100)+'%'}}/></div><div className="flex justify-between text-xs text-gray-400 mt-1"><span>剩余{c.remaining_times}次</span><span>到期:{c.expire_date}</span></div></div>
        </CardContent></Card>
      )}</div>
    </div>
  );
}
