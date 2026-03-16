'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import StatusBadge from '@/components/StatusBadge';
import type { Variety, Reception } from '@/types';

export default function Dashboard() {
  const [varieties, setVarieties] = useState<Variety[]>([]);
  const [receptions, setReceptions] = useState<Reception[]>([]);

  useEffect(() => {
    fetch('/api/varieties').then(r => r.json()).then(setVarieties);
    fetch('/api/receptions').then(r => r.json()).then(setReceptions);
  }, []);

  const today = new Date().toISOString().split('T')[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

  const todayReceptions = receptions.filter(r => r.desired_date === today && r.status !== 'キャンセル' && r.status !== '相談中');
  const tomorrowReceptions = receptions.filter(r => r.desired_date === tomorrow && r.status !== 'キャンセル' && r.status !== '相談中');
  const unpaidReceptions = receptions.filter(r => r.payment_method === '未収' && r.status !== 'キャンセル' && r.status !== '完了');
  const activeReceptions = receptions.filter(r => r.status !== 'キャンセル' && r.status !== '完了');

  const mapsUrl = (address: string) =>
    `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-gray-900">ダッシュボード</h1>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <SummaryCard label="本日受渡し" value={todayReceptions.length} color="text-violet-700" bg="bg-violet-50" />
        <SummaryCard label="明日受渡し" value={tomorrowReceptions.length} color="text-blue-700" bg="bg-blue-50" />
        <SummaryCard label="未払い" value={unpaidReceptions.length} color="text-red-600" bg="bg-red-50" />
        <SummaryCard label="進行中" value={activeReceptions.length} color="text-emerald-700" bg="bg-emerald-50" />
      </div>

      {/* Today + Unpaid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Today */}
        <section className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <h2 className="text-sm font-semibold text-gray-800">本日の受渡し</h2>
            <Link href="/calendar" className="text-xs text-violet-600 hover:underline">カレンダー →</Link>
          </div>
          <div className="p-3">
            {todayReceptions.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-4">本日の予定はありません</p>
            ) : (
              <div className="space-y-1">
                {todayReceptions.map(r => (
                  <div key={r.id} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg transition-colors">
                    <Link href={`/receptions/${r.id}`} className="flex items-center gap-3 flex-1 min-w-0">
                      <span className="text-xs text-gray-400 font-mono w-12 shrink-0">{r.desired_time || '--:--'}</span>
                      <span className="font-medium text-sm text-gray-900 truncate">{r.customer_name}</span>
                    </Link>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <StatusBadge status={r.delivery_method} />
                      <StatusBadge status={r.status} />
                      {r.address && (
                        <a
                          href={mapsUrl(r.address)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-base leading-none hover:opacity-70 transition-opacity"
                          title="Google Maps で開く"
                        >
                          📍
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Unpaid */}
        <section className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <h2 className="text-sm font-semibold text-gray-800">未払い</h2>
            <Link href="/receptions" className="text-xs text-violet-600 hover:underline">受付一覧 →</Link>
          </div>
          <div className="p-3">
            {unpaidReceptions.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-4">未払いはありません</p>
            ) : (
              <div className="space-y-1">
                {unpaidReceptions.map(r => (
                  <Link key={r.id} href={`/receptions/${r.id}`} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg transition-colors">
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="text-xs text-gray-400 w-20 shrink-0">{r.desired_date}</span>
                      <span className="font-medium text-sm text-gray-900 truncate">{r.customer_name}</span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="font-semibold text-sm text-gray-900">¥{r.total.toLocaleString()}</span>
                      <StatusBadge status={r.status} />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>

      {/* Variety stock */}
      <section className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-800">品種別在庫</h2>
          <Link href="/varieties" className="text-xs text-violet-600 hover:underline">詳細 →</Link>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-gray-50/80 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-2.5 font-semibold text-gray-600 text-xs">品種名</th>
              <th className="text-right px-3 py-2.5 font-semibold text-gray-600 text-xs">単価</th>
              <th className="text-right px-3 py-2.5 font-semibold text-gray-600 text-xs">出荷数</th>
              <th className="text-right px-3 py-2.5 font-semibold text-gray-600 text-xs">確保</th>
              <th className="text-right px-3 py-2.5 font-semibold text-gray-600 text-xs">残数</th>
              <th className="px-3 py-2.5 font-semibold text-gray-600 text-xs w-32">バー</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {varieties.map(v => {
              const remaining = v.expected_quantity - v.reserved_quantity;
              const pct = v.expected_quantity > 0 ? (v.reserved_quantity / v.expected_quantity) * 100 : 0;
              const barColor = pct > 80 ? 'bg-red-400' : pct > 50 ? 'bg-amber-400' : 'bg-emerald-400';
              const isLowStock = remaining <= v.low_stock_threshold;
              return (
                <tr key={v.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-4 py-2.5">
                    <span className="font-semibold text-gray-900">{v.name}</span>
                    {isLowStock && (
                      <span className="ml-2 text-[10px] font-bold text-red-600 bg-red-50 px-1.5 py-0.5 rounded">残少</span>
                    )}
                  </td>
                  <td className="px-3 py-2.5 text-right text-gray-600">¥{v.unit_price.toLocaleString()}</td>
                  <td className="px-3 py-2.5 text-right text-gray-600">{v.expected_quantity}</td>
                  <td className="px-3 py-2.5 text-right text-gray-500">{v.reserved_quantity}</td>
                  <td className={`px-3 py-2.5 text-right font-bold ${isLowStock ? 'text-red-600' : 'text-emerald-600'}`}>
                    {remaining}
                  </td>
                  <td className="px-3 py-2.5">
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${barColor}`}
                        style={{ width: `${Math.min(pct, 100)}%` }}
                      />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>
    </div>
  );
}

function SummaryCard({ label, value, color, bg }: { label: string; value: number; color: string; bg: string }) {
  return (
    <div className={`${bg} rounded-xl p-4 border border-gray-200/50`}>
      <p className="text-xs text-gray-500 font-medium">{label}</p>
      <p className={`text-3xl font-bold mt-1 ${color}`}>{value}</p>
    </div>
  );
}
