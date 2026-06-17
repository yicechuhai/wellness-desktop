import { useAPI } from '../hooks/useApi';
import { Card, CardContent } from '../components/ui/card';
import { Package } from 'lucide-react';

export default function ServiceItems() {
  const { data, isLoading } = useAPI('/items');
  const items = data || [];
  if (isLoading) return <div className="text-center py-8 text-gray-500">加载中...</div>;
  return (
    <div className="space-y-3">
      <div className="text-xs text-gray-500">共 {items.length} 个项目</div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">{items.map((item:any) =>
        <Card key={item.id}><CardContent className="p-4">
          <div className="flex gap-2 mb-2"><Package size={16} className="text-blue-500"/><span className="font-medium">{item.name}</span></div>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="p-2 bg-gray-50 rounded"><p className="text-xs text-gray-500">单次</p><p className="text-sm font-bold">{item.single_price}</p></div>
            <div className="p-2 bg-blue-50 rounded"><p className="text-xs text-gray-500">套餐({item.package_times}次)</p><p className="text-sm font-bold text-blue-600">{item.package_price}</p></div>
            <div className="p-2 bg-orange-50 rounded"><p className="text-xs text-gray-500">活动价</p><p className="text-sm font-bold text-orange-600">{item.activity_price}</p></div>
          </div>
          {item.description&&<p className="text-xs text-gray-500 mt-2">{item.description}</p>}
        </CardContent></Card>
      )}</div>
    </div>
  );
}
