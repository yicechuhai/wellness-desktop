import { useState, useRef } from 'react';
import { Card, CardContent } from '../components/ui/card';
import { FileSpreadsheet, Upload } from 'lucide-react';

export default function ExcelImport() {
  const [file, setFile] = useState<File|null>(null);
  const [preview, setPreview] = useState<any[]>([]);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (f: File) => {
    setFile(f); setResult('');
    const XLSX = await import('xlsx');
    const data = await f.arrayBuffer();
    const wb = XLSX.read(data, { type:'array' });
    const ws = wb.Sheets[wb.SheetNames[0]];
    const json = XLSX.utils.sheet_to_json(ws, { header:1, defval:'' });
    setPreview(json.slice(0,20));
  };

  return (
    <div className="space-y-4">
      <input ref={inputRef} type="file" accept=".xlsx,.xls" className="hidden" onChange={e=>e.target.files?.[0]&&handleFile(e.target.files[0])}/>
      <div onClick={()=>inputRef.current?.click()} className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50">
        <Upload size={32} className="mx-auto text-gray-400 mb-2"/><p className="text-sm text-gray-600">点击上传 Excel</p><p className="text-xs text-gray-400">支持 .xlsx / .xls</p>
      </div>
      {file&&<div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg"><FileSpreadsheet size={18} className="text-green-600"/><span className="text-sm flex-1">{file.name}</span><button onClick={()=>setResult('解析功能开发中')} disabled={importing} className="bg-blue-600 text-white px-4 py-1.5 rounded-lg text-xs disabled:opacity-50">{importing?'导入中...':'开始导入'}</button></div>}
      {result&&<div className="p-3 bg-blue-50 rounded-lg text-sm text-blue-700">{result}</div>}
      {preview.length>0&&<Card><CardContent className="p-3"><p className="text-xs text-gray-500 mb-2">预览(前20行)</p><div className="overflow-x-auto"><table className="text-xs w-full"><tbody>{preview.map((row,i)=><tr key={i} className={i===0?'bg-gray-100 font-medium':'border-t'}>{(row as any[]).map((cell,j)=><td key={j} className="px-2 py-1 whitespace-nowrap">{String(cell)}</td>)}</tr>)}</tbody></table></div></CardContent></Card>}
    </div>
  );
}
