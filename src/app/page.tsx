'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import StatusBadge from '@/components/StatusBadge';
import type { Variety, Order } from '@/types';

export default function Dashboard() {
  const [varieties, setVarieties] = useState<Variety[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    fetch('/api/varieties').then(r => r.json()).then(setVarieties);
    fetch('/api/orders').then(r => r.json()).then(setOrders);
  }, []);

  const today = new Date().toISOString().split('T')[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

  const todayOrders = orders.filter(o => o.scheduled_date === today && o.status !== 'キャンセル');
  const tomorrowOrders = orders.filter(o => o.scheduled_date === tomorrow && o.status !== 'キャンセル');
  const unpaidOrders = orders.filter(o => o.payment_method === '未収' && o.status !== 'キャンセル' && o.status !== '完了');
  const activeOrders = orders.filter(o => o.status !== 'キャンセル' && o.status !== '完了');

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-gray-900">ダッシュボード</h1>

      {/* 上段: サマリーカード */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <SummaryCard label="本日の配達" value={todayOrders.length} color="text-violet-700" bg="bg-violet-50" />
        <SummaryCard label="明日の配達" value={tomorrowOrders.length} color="text-blue-700" bg="bg-blue-50" />
        <SummaryCard label="未払い注文" value={unpaidOrders.length} color="text-red-600" bg="bg-red-50" />
        <SummaryCard label="進行中注文" value={activeOrders.length} color="text-emerald-700" bg="bg-emerald-50" />
      </div>

      {/* 中段: 本日の配達 + 未払い */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* 本日の配達 */}
        <section className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <h2 className="text-sm font-semibold text-gray-800">本日の配達・受取</h2>
            <Link href="/calendar" className="text-xs text-violet-600 hover:underline">カレンダー →</Link>
          </div>
          <div className="p-3">
            {todayOrders.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-4">本日の予定はありません</p>
            ) : (
              <div className="space-y-2">
                {todayOrders.map(o => (
                  <Link key={o.id} href={`/orders/${o.id}`} className="flex items-center justify-between p-2.5 hover:bg-gray-50 rounded-lg transition-colors">
                    <div>
                      <p className="font-medium text-sm text-gray-900">{o.customer_name}</p>
                      <p className="text-xs text-gray-500">{o.scheduled_time || '時間未定'}</p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <StatusBadge status={o.delivery_method} />
                      <StatusBadge status={o.status} />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* 未払い注文 */}
        <section className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <h2 className="text-sm font-semibold text-gray-800">未払い注文</h2>
            <Link href="/orders" className="text-xs text-violet-600 hover:underline">注文一覧 →</Link>
          </div>
          <div className="p-3">
            {unpaidOrders.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-4">未払いはありません</p>
            ) : (
              <div className="space-y-2">
                {unpaidOrders.map(o => (
                  <Link key={o.id} href={`/orders/${o.id}`} className="flex items-center justify-between p-2.5 hover:bg-gray-50 rounded-lg transition-colors">
                    <div>
                      <p className="font-medium text-sm text-gray-900">{o.customer_name}</p>
                      <p className="text-xs text-gray-500">{o.scheduled_date}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-gray-900">¥{o.total.toLocaleString()}</span>
                      <StatusBadge status={o.status} />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>

      {/* 下段: 品種別在庫 */}
      <section className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-800">品種別 在庫状況</h2>
          <Link href="/varieties" className="text-xs text-violet-600 hover:underline">詳細 →</Link>
        </div>
        <div className="p-4 space-y-4">
          {varieties.map(v => {
            const remaining = v.expected_quantity - v.reserved_quantity;
            const pct = v.expected_quantity > 0 ? (v.reserved_quantity / v.expected_quantity) * 100 : 0;
            return (
              <div key={v.id}>
                <div className="flex justify-between items-baseline mb-1.5">
                  <span className="text-sm font-semibold text-gray-800">{v.name}</span>
                  <div className="text-sm">
                    <span className="text-gray-400">残 </span>
                    <span className={`font-bold ${remaining <= 10 ? 'text-red-600' : 'text-emerald-600'}`}>
                      {remaining}
                    </span>
                    <span className="text-gray-300"> / {v.expected_quantity}</span>
                  </div>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2.5">
                  <div
                    className={`h-2.5 rounded-full transition-all ${
                      pct > 80 ? 'bg-red-400' : pct > 50 ? 'bg-amber-400' : 'bg-emerald-400'
                    }`}
                    style={{ width: `${Math.min(pct, 100)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
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
