import { useState } from 'react';
import { Card, CardContent } from '../components/ui/card';
import { Sparkles, Copy, MessageCircle, Share2, Video, TrendingUp } from 'lucide-react';

const templates = [
  { key:'followup', label:'回访话术', icon:MessageCircle, desc:'生成客户回访话术' },
  { key:'moments', label:'朋友圈文案', icon:Share2, desc:'生成朋友圈营销文案' },
  { key:'douyin', label:'抖音脚本', icon:Video, desc:'生成短视频脚本' },
  { key:'upgrade', label:'套餐升级', icon:TrendingUp, desc:'生成套餐升级建议' },
];

export default function AIGenerator() {
  const [selected, setSelected] = useState('followup');
  const [customerName, setCustomerName] = useState('');
  const [lastService, setLastService] = useState('');
  const [result, setResult] = useState('');
  const [generating, setGenerating] = useState(false);

  const handleGenerate = async () => {
    setGenerating(true);
    const name = customerName || '客户';
    const svc = lastService || '调理';
    const date = new Date().toISOString().slice(0,10);
    let content = '';
    switch (selected) {
      case 'followup': content = `${name}您好！我是养生馆的调理顾问。${date}您到店做了${svc}，今天感觉怎么样？如果有任何不适随时联系我。建议您按疗程坚持调理，效果更明显。期待您下次到店！`; break;
      case 'moments': content = `今日案例分享\n今天一位老客做完${svc}后说："做完轻松多了！"\n夏天是调理的黄金期，预约从速~\n☎️ 咨询热线：138-xxxx-xxxx`; break;
      case 'douyin': content = `【短视频脚本 - 30秒】\n【开场 0-5秒】镜头：客人走进店里\n配音："工作压力山大，肩颈僵硬到转不动？"\n【内容 5-20秒】镜头：${svc}过程特写\n配音："来我们店体验${svc}，专业调理师一对一服务..."\n【结尾 20-30秒】镜头：客人做完舒展肩膀\n配音："做完轻松多了！左下角团购只要29.9！"`; break;
      case 'upgrade': content = `【${name}】套餐升级建议：\n基于客户近期消费分析，推荐：\n1. 680元/10次 ${svc}卡（单次68元，原价128元）\n2. 1280元/20次全能卡（肩颈+腰椎+艾灸任选）\n3. 1980元/30次VIP卡（含赠送2次面护）\n话术要点：先询问效果反馈，再引导续卡。`; break;
      default: content = `${name}您好！感谢您选择我们养生馆。${date}您体验了${svc}，希望您感觉有所改善。有任何问题随时联系！`;
    }
    setResult(content);
    setGenerating(false);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-2">{templates.map(t=>{const Icon=t.icon;return(
        <button key={t.key} onClick={()=>{setSelected(t.key);setResult('');}} className={'p-3 rounded-lg text-left '+(selected===t.key?'bg-blue-50 border-2 border-blue-500':'bg-white border-2 border-gray-100')}>
          <Icon size={18} className={selected===t.key?'text-blue-500':'text-gray-400'}/><p className="text-sm font-medium mt-1">{t.label}</p><p className="text-xs text-gray-400">{t.desc}</p>
        </button>
      )})}</div>
      <div className="space-y-2">
        <input type="text" placeholder="客户姓名" value={customerName} onChange={e=>setCustomerName(e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm"/>
        <input type="text" placeholder="最近服务项目" value={lastService} onChange={e=>setLastService(e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm"/>
      </div>
      <button onClick={handleGenerate} disabled={generating} className="w-full bg-blue-600 text-white py-2.5 rounded-lg text-sm font-medium disabled:opacity-50 flex items-center justify-center gap-2"><Sparkles size={16}/>{generating?'生成中...':'生成话术'}</button>
      {result&&<Card><CardContent className="p-3"><div className="flex justify-between mb-2"><span className="text-xs text-gray-500">结果</span><button onClick={()=>navigator.clipboard?.writeText(result)} className="text-xs text-blue-600 flex gap-1"><Copy size={12}/>复制</button></div><pre className="text-sm whitespace-pre-wrap text-gray-700">{result}</pre></CardContent></Card>}
    </div>
  );
}
