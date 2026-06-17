import { useAPI } from '../hooks/useApi';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Users, Phone, CreditCard, AlertTriangle, TrendingUp } from 'lucide-react';

export default function Dashboard() {
  const { data, isLoading } = useAPI('/dashboard');
  if (isLoading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" /></div>;
  const today = data?.today || {};
  const overview = data?.overview || {};
  const cards = data?.expiringCards || [];
  const tasks = data?.upcomingTasks || [];
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card><CardContent className="p-4"><div className="flex items-center gap-2"><Users size={18} className="text-blue-500" /><span className="text-xs text-gray-500">今日到店</span></div><p className="text-2xl font-bold mt-1">{today.serviceCount ?? 0}</p></CardContent></Card>
        <Card><CardContent className="p-4"><div className="flex items-center gap-2"><CreditCard size={18} className="text-green-500" /><span className="text-xs text-gray-500">今日收入</span></div><p className="text-2xl font-bold mt-1">{((today.wellnessRevenue||0)+(today.clinicRevenue||0)).toFixed(0)}</p></CardContent></Card>
        <Card><CardContent className="p-4"><div className="flex items-center gap-2"><TrendingUp size={18} className="text-purple-500" /><span className="text-xs text-gray-500">总客户</span></div><p className="text-2xl font-bold mt-1">{overview.totalCustomers??0}</p></CardContent></Card>
        <Card><CardContent className="p-4"><div className="flex items-center gap-2"><Phone size={18} className="text-orange-500" /><span className="text-xs text-gray-500">待回访</span></div><p className="text-2xl font-bold mt-1">{overview.pendingTasks??0}</p></CardContent></Card>
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Phone size={16} className="text-orange-500" />今日待回访 ({tasks.length})</CardTitle></CardHeader><CardContent>
          {tasks.length===0?<p className="text-sm text-gray-400">暂无</p>:<div className="space-y-2 max-h-64 overflow-y-auto">{tasks.map((t:any)=><div key={t.id} className="p-2 bg-orange-50 rounded-lg text-sm"><div className="flex justify-between"><span className="font-medium">{t.customer_name}</span><span className="text-xs text-orange-600">{t.task_type}</span></div><p className="text-xs text-gray-500 mt-1 line-clamp-2">{t.suggested_message}</p></div>)}</div>}
        </CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><AlertTriangle size={16} className="text-red-500" />疗程卡预警 ({cards.length})</CardTitle></CardHeader><CardContent>
          {cards.length===0?<p className="text-sm text-gray-400">暂无</p>:<div className="space-y-2 max-h-64 overflow-y-auto">{cards.map((c:any)=><div key={c.id} className="p-2 bg-red-50 rounded-lg text-sm"><div className="flex justify-between"><span className="font-medium">{c.customer_name}</span><span className="text-xs text-red-600">剩{c.remaining_times}次</span></div><p className="text-xs text-gray-500">{c.card_name} | 到期:{c.expire_date}</p></div>)}</div>}
        </CardContent></Card>
      </div>
      <Card><CardHeader className="pb-2"><CardTitle className="text-sm">业务线收入</CardTitle></CardHeader><CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-green-50 rounded-lg"><p className="text-xs text-gray-500">养生馆</p><p className="text-xl font-bold text-green-600">{(today.wellnessRevenue||0).toFixed(2)}</p></div>
          <div className="text-center p-3 bg-blue-50 rounded-lg"><p className="text-xs text-gray-500">中医馆</p><p className="text-xl font-bold text-blue-600">{(today.clinicRevenue||0).toFixed(2)}</p></div>
        </div>
      </CardContent></Card>
    </div>
  );
}
