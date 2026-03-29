'use client';

import { useEffect, useState, useMemo } from 'react';
import { apiFetch } from '@/lib/api-client';
import type { SalesRecord, PaymentMethod } from '@/types';

export default function SalesPage() {
  const [month, setMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  const [records, setRecords] = useState<SalesRecord[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    apiFetch(`/api/sales?month=${month}`)
      .then(r => r.json())
      .then(data => { setRecords(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [month]);

  const totalSales = useMemo(() => records.reduce((s, r) => s + r.total, 0), [records]);
  const avgPerOrder = records.length > 0 ? Math.round(totalSales / records.length) : 0;

  // Payment method breakdown
  const paymentBreakdown = useMemo(() => {
    const map: Record<string, number> = {};
    for (const r of records) {
      map[r.payment_method] = (map[r.payment_method] || 0) + r.total;
    }
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [records]);

  const paymentColors: Record<string, string> = {
    '現金': 'bg-emerald-500',
    'PayPay': 'bg-sky-500',
    '振込': 'bg-indigo-500',
    '未定': 'bg-gray-400',
  };

  const maxPayment = paymentBreakdown.length > 0 ? paymentBreakdown[0][1] : 1;

  const handlePrevMonth = () => {
    const [y, m] = month.split('-').map(Number);
    const d = new Date(y, m - 2, 1);
    setMonth(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
  };

  const handleNextMonth = () => {
    const [y, m] = month.split('-').map(Number);
    const d = new Date(y, m, 1);
    setMonth(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
  };

  const [y, m] = month.split('-').map(Number);

  return (
    <div className="space-y-5">
      <h1 className="text-xl font-bold text-gray-900">売上記録</h1>

      {/* Month selector */}
      <div className="flex items-center justify-between bg-white rounded-xl border border-gray-200 shadow-sm px-4 py-3">
        <button onClick={handlePrevMonth} className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">← 前月</button>
        <h2 className="text-base font-semibold text-gray-900">{y}年{m}月</h2>
        <button onClick={handleNextMonth} className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">翌月 →</button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-violet-50 rounded-xl p-4 border border-gray-200/50">
          <p className="text-xs text-gray-500 font-medium">売上合計</p>
          <p className="text-2xl font-bold mt-1 text-violet-700">¥{totalSales.toLocaleString()}</p>
        </div>
        <div className="bg-blue-50 rounded-xl p-4 border border-gray-200/50">
          <p className="text-xs text-gray-500 font-medium">件数</p>
          <p className="text-2xl font-bold mt-1 text-blue-700">{records.length}</p>
        </div>
        <div className="bg-emerald-50 rounded-xl p-4 border border-gray-200/50">
          <p className="text-xs text-gray-500 font-medium">平均単価</p>
          <p className="text-2xl font-bold mt-1 text-emerald-700">¥{avgPerOrder.toLocaleString()}</p>
        </div>
      </div>

      {/* Payment breakdown */}
      {paymentBreakdown.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
          <h3 className="text-sm font-semibold text-gray-800 mb-3">支払方法別内訳</h3>
          <div className="space-y-2">
            {paymentBreakdown.map(([method, amount]) => (
              <div key={method} className="flex items-center gap-3">
                <span className="text-sm text-gray-700 w-16 shrink-0 font-medium">{method}</span>
                <div className="flex-1 bg-gray-100 rounded-full h-6 overflow-hidden">
                  <div
                    className={`h-6 rounded-full ${paymentColors[method] || 'bg-gray-400'} flex items-center justify-end pr-2 transition-all`}
                    style={{ width: `${Math.max((amount / maxPayment) * 100, 8)}%` }}
                  >
                    <span className="text-[11px] font-semibold text-white">¥{amount.toLocaleString()}</span>
                  </div>
                </div>
                <span className="text-xs text-gray-400 w-12 text-right shrink-0">
                  {totalSales > 0 ? Math.round((amount / totalSales) * 100) : 0}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sales table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50/80 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-2.5 font-semibold text-gray-600 text-xs">日付</th>
              <th className="text-left px-3 py-2.5 font-semibold text-gray-600 text-xs">顧客</th>
              <th className="text-right px-3 py-2.5 font-semibold text-gray-600 text-xs">小計</th>
              <th className="text-right px-3 py-2.5 font-semibold text-gray-600 text-xs">送料</th>
              <th className="text-right px-3 py-2.5 font-semibold text-gray-600 text-xs">値引</th>
              <th className="text-right px-3 py-2.5 font-semibold text-gray-600 text-xs">合計</th>
              <th className="text-center px-3 py-2.5 font-semibold text-gray-600 text-xs">支払</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr><td colSpan={7} className="text-center py-8 text-gray-400 text-sm">読み込み中...</td></tr>
            ) : records.length === 0 ? (
              <tr><td colSpan={7} className="text-center py-8 text-gray-400 text-sm">売上データがありません</td></tr>
            ) : (
              records.map(r => (
                <tr key={r.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-4 py-2.5 text-gray-600">{r.date}</td>
                  <td className="px-3 py-2.5 font-medium text-gray-900">{r.customer_name}</td>
                  <td className="px-3 py-2.5 text-right text-gray-600">¥{r.subtotal.toLocaleString()}</td>
                  <td className="px-3 py-2.5 text-right text-gray-600">{r.shipping_fee > 0 ? `¥${r.shipping_fee.toLocaleString()}` : '-'}</td>
                  <td className="px-3 py-2.5 text-right text-red-500">{r.discount > 0 ? `-¥${r.discount.toLocaleString()}` : '-'}</td>
                  <td className="px-3 py-2.5 text-right font-bold text-gray-900">¥{r.total.toLocaleString()}</td>
                  <td className="px-3 py-2.5 text-center">
                    <span className={`inline-block px-2 py-0.5 rounded-md text-[11px] font-medium border leading-tight ${
                      r.payment_method === '現金' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                      r.payment_method === 'PayPay' ? 'bg-sky-50 text-sky-700 border-sky-200' :
                      r.payment_method === '振込' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' :
                      'bg-gray-50 text-gray-500 border-gray-200'
                    }`}>
                      {r.payment_method}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
