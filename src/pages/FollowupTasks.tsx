import { useState } from 'react';
import { useAPI, useAPIMutation } from '../hooks/useApi';
import { Card, CardContent } from '../components/ui/card';
import { Phone, CheckCircle } from 'lucide-react';

const typeLabels: Record<string, string> = { new_experience:'新客回访', convert_package:'转化套餐', sleeping_wake:'沉睡唤醒', renew_reminder:'续费提醒', effect_followup:'效果跟进', custom:'自定义' };
const typeColors: Record<string, string> = { new_experience:'bg-green-100 text-green-700', convert_package:'bg-purple-100 text-purple-700', sleeping_wake:'bg-gray-100 text-gray-700', renew_reminder:'bg-orange-100 text-orange-700', effect_followup:'bg-blue-100 text-blue-700', custom:'bg-gray-100 text-gray-600' };

export default function FollowupTasks() {
  const { data, isLoading, refetch } = useAPI('/followups');
  const { post } = useAPIMutation('/followups/done');
  const [filter, setFilter] = useState('all');
  const tasks = (data||[]).filter((t:any) => filter==='all' || t.status===filter);
  const handleDone = async (id: number) => { await post({ id }); refetch(); };
  if (isLoading) return <div className="text-center py-8 text-gray-500">加载中...</div>;
  return (
    <div className="space-y-3">
      <div className="flex gap-2">{[{k:'all',l:'全部'},{k:'pending',l:'待回访'},{k:'done',l:'已完成'}].map(t =>
        <button key={t.k} onClick={()=>setFilter(t.k)} className={'px-3 py-1.5 rounded-lg text-xs '+(filter===t.k?'bg-blue-600 text-white':'bg-gray-100 text-gray-600')}>{t.l}</button>
      )}</div>
      <div className="text-xs text-gray-500">共 {tasks.length} 条</div>
      <div className="space-y-2">{tasks.map((t:any) =>
        <Card key={t.id} className={t.status==='done'?'opacity-60':''}><CardContent className="p-3">
          <div className="flex justify-between"><div className="flex gap-2"><Phone size={16} className="text-orange-500"/><span className="font-medium text-sm">{t.customer_name}</span><span className={'text-xs px-1.5 py-0.5 rounded '+(typeColors[t.task_type]||'bg-gray-100')}>{typeLabels[t.task_type]||t.task_type}</span></div>{t.status==='pending'&&<button onClick={()=>handleDone(t.id)} className="text-green-600"><CheckCircle size={18}/></button>}</div>
          <p className="text-xs text-gray-500 mt-1">{t.reason}</p>
          <div className="mt-2 p-2 bg-orange-50 rounded-lg text-xs text-gray-600">{t.suggested_message}</div>
          <div className="flex justify-between mt-1 text-xs text-gray-400"><span>负责人:{t.owner_staff||'-'}</span><span>{t.due_date}</span></div>
        </CardContent></Card>
      )}</div>
    </div>
  );
}
