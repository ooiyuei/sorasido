'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import StatusBadge from '@/components/StatusBadge';
import type { Order, OrderStatus } from '@/types';

const statusFilters: (OrderStatus | '全て')[] = ['全て', '確定', '準備中', '配達予定', '完了', 'キャンセル'];

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filter, setFilter] = useState<OrderStatus | '全て'>('全て');

  const load = () => fetch('/api/orders').then(r => r.json()).then(setOrders);
  useEffect(() => { load(); }, []);

  const filtered = filter === '全て' ? orders : orders.filter(o => o.status === filter);

  const handleStatusChange = async (id: string, status: OrderStatus) => {
    await fetch(`/api/orders/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) });
    load();
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">注文一覧</h1>
        <Link href="/orders/new" className="bg-violet-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-violet-700 transition-colors">+ 新規注文</Link>
      </div>

      <div className="flex gap-2 flex-wrap">
        {statusFilters.map(s => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              filter === s
                ? 'bg-violet-600 text-white shadow-sm'
                : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            {s}
            {s !== '全て' && <span className="ml-1 opacity-60">({orders.filter(o => o.status === s).length})</span>}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.map(o => (
          <div key={o.id} className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 hover:border-violet-200 transition-colors">
            <div className="flex items-start justify-between">
              <Link href={`/orders/${o.id}`} className="group">
                <h3 className="font-semibold text-gray-900 group-hover:text-violet-700 transition-colors">{o.customer_name}</h3>
                <p className="text-xs text-gray-500 mt-0.5">{o.scheduled_date} {o.scheduled_time && `/ ${o.scheduled_time}`}</p>
              </Link>
              <div className="flex flex-col items-end gap-1.5">
                <p className="text-lg font-bold text-gray-900">¥{o.total.toLocaleString()}</p>
                <div className="flex gap-1">
                  <StatusBadge status={o.delivery_method} />
                  <StatusBadge status={o.payment_method} />
                </div>
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between pt-3 border-t border-gray-100">
              <div className="text-xs text-gray-400">
                {o.has_box && '📦 箱あり'}{o.shipping_fee > 0 && ` · 送料¥${o.shipping_fee.toLocaleString()}`}
              </div>
              <div className="flex items-center gap-2">
                <StatusBadge status={o.status} />
                <select
                  className="text-xs border border-gray-200 rounded-lg px-2 py-1 text-gray-600 focus:outline-none focus:ring-2 focus:ring-violet-500"
                  value={o.status}
                  onChange={e => handleStatusChange(o.id, e.target.value as OrderStatus)}
                >
                  <option value="確定">確定</option>
                  <option value="準備中">準備中</option>
                  <option value="配達予定">配達予定</option>
                  <option value="完了">完了</option>
                  <option value="キャンセル">キャンセル</option>
                </select>
              </div>
            </div>
          </div>
        ))}
        {filtered.length === 0 && <p className="text-gray-400 text-center py-8 text-sm">注文がありません</p>}
      </div>
    </div>
  );
}
