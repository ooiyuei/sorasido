const colorMap: Record<string, string> = {
  '仮予約': 'bg-amber-50 text-amber-700 border-amber-200',
  '確定': 'bg-blue-50 text-blue-700 border-blue-200',
  'キャンセル': 'bg-gray-50 text-gray-400 border-gray-200',
  '準備中': 'bg-orange-50 text-orange-700 border-orange-200',
  '配達予定': 'bg-indigo-50 text-indigo-700 border-indigo-200',
  '完了': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  '未収': 'bg-red-50 text-red-600 border-red-200',
  '現金': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  'PayPay': 'bg-sky-50 text-sky-700 border-sky-200',
  '配送': 'bg-violet-50 text-violet-700 border-violet-200',
  '配達': 'bg-teal-50 text-teal-700 border-teal-200',
  '店頭受取': 'bg-gray-50 text-gray-600 border-gray-200',
};

export default function StatusBadge({ status }: { status: string }) {
  const color = colorMap[status] || 'bg-gray-50 text-gray-600 border-gray-200';
  return (
    <span className={`inline-block px-2 py-0.5 rounded-md text-[11px] font-medium border ${color}`}>
      {status}
    </span>
  );
}
