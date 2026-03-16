'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import StatusBadge from '@/components/StatusBadge';
import type { Variety, Order, Staff } from '@/types';

export default function Dashboard() {
  const [varieties, setVarieties] = useState<Variety[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [staffFilter, setStaffFilter] = useState<string>('');

  useEffect(() => {
    fetch('/api/varieties').then(r => r.json()).then(setVarieties);
    fetch('/api/orders').then(r => r.json()).then(setOrders);
    fetch('/api/staff').then(r => r.json()).then(setStaff);
  }, []);

  const today = new Date().toISOString().split('T')[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

  const filterByStaff = (list: Order[]) =>
    staffFilter ? list.filter(o => o.assignee_id === staffFilter || o.delivery_staff_id === staffFilter) : list;

  const todayOrders = filterByStaff(orders.filter(o => o.scheduled_date === today && o.status !== 'キャンセル'));
  const tomorrowOrders = filterByStaff(orders.filter(o => o.scheduled_date === tomorrow && o.status !== 'キャンセル'));
  const unpaidOrders = filterByStaff(orders.filter(o => o.payment_method === '未収' && o.status !== 'キャンセル' && o.status !== '完了'));
  const activeOrders = filterByStaff(orders.filter(o => o.status !== 'キャンセル' && o.status !== '完了'));

  const mapsUrl = (address: string) =>
    `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">ダッシュボード</h1>
        <div className="flex items-center gap-2">
          <label className="text-xs text-gray-500 font-medium">担当者フィルタ</label>
          <select
            value={staffFilter}
            onChange={e => setStaffFilter(e.target.value)}
            className="text-sm border border-gray-300 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
          >
            <option value="">全員</option>
            {staff.filter(s => s.is_active).map(s => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* 上段: サマリーカード */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <SummaryCard label="本日配達" value={todayOrders.length} color="text-violet-700" bg="bg-violet-50" />
        <SummaryCard label="明日配達" value={tomorrowOrders.length} color="text-blue-700" bg="bg-blue-50" />
        <SummaryCard label="未払い注文" value={unpaidOrders.length} color="text-red-600" bg="bg-red-50" />
        <SummaryCard label="進行中注文" value={activeOrders.length} color="text-emerald-700" bg="bg-emerald-50" />
      </div>

      {/* 中段: 本日の配達 + 未払い */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* 本日の配達・受取 */}
        <section className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <h2 className="text-sm font-semibold text-gray-800">本日の配達・受取</h2>
            <Link href="/calendar" className="text-xs text-violet-600 hover:underline">カレンダー →</Link>
          </div>
          <div className="p-3">
            {todayOrders.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-4">本日の予定はありません</p>
            ) : (
              <div className="space-y-1">
                {todayOrders.map(o => (
                  <div key={o.id} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg transition-colors">
                    <Link href={`/orders/${o.id}`} className="flex items-center gap-3 flex-1 min-w-0">
                      <span className="text-xs text-gray-400 font-mono w-12 shrink-0">{o.scheduled_time || '--:--'}</span>
                      <span className="font-medium text-sm text-gray-900 truncate">{o.customer_name}</span>
                    </Link>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <StatusBadge status={o.delivery_method} />
                      <StatusBadge status={o.status} />
                      {o.address && (
                        <a
                          href={mapsUrl(o.address)}
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
              <div className="space-y-1">
                {unpaidOrders.map(o => (
                  <Link key={o.id} href={`/orders/${o.id}`} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg transition-colors">
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="text-xs text-gray-400 w-20 shrink-0">{o.scheduled_date}</span>
                      <span className="font-medium text-sm text-gray-900 truncate">{o.customer_name}</span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
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
