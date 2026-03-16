const colorMap: Record<string, string> = {
  '相談中': 'bg-gray-50 text-gray-600 border-gray-200',
  '受付済み': 'bg-blue-50 text-blue-700 border-blue-200',
  '会計待ち': 'bg-amber-50 text-amber-700 border-amber-200',
  '完了': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  'キャンセル': 'bg-gray-50 text-gray-400 border-gray-200',
  '未定': 'bg-gray-50 text-gray-500 border-gray-200',
  '未払い': 'bg-red-50 text-red-600 border-red-200',
  '支払済': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  '現金': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  'PayPay': 'bg-sky-50 text-sky-700 border-sky-200',
  '振込': 'bg-indigo-50 text-indigo-700 border-indigo-200',
  '配送': 'bg-violet-50 text-violet-700 border-violet-200',
  '配達': 'bg-teal-50 text-teal-700 border-teal-200',
  '店頭受取': 'bg-gray-50 text-gray-600 border-gray-200',
  '計量済み': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  '未計量': 'bg-orange-50 text-orange-600 border-orange-200',
};

export default function StatusBadge({ status }: { status: string }) {
  const color = colorMap[status] || 'bg-gray-50 text-gray-600 border-gray-200';
  return (
    <span className={`inline-block px-2 py-0.5 rounded-md text-[11px] font-medium border leading-tight ${color}`}>
      {status}
    </span>
  );
}
