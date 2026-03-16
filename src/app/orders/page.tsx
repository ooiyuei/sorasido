'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import StatusBadge from '@/components/StatusBadge';
import type { Order, OrderStatus, PaymentStatus, Staff } from '@/types';

const statusFilters: (OrderStatus | '全て')[] = ['全て', '確定', '準備中', '配達予定', '完了', 'キャンセル'];
const paymentFilters: ('全て' | '未払い' | '支払済')[] = ['全て', '未払い', '支払済'];

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [filter, setFilter] = useState<OrderStatus | '全て'>('全て');
  const [staffFilter, setStaffFilter] = useState<string>('全て');
  const [paymentFilter, setPaymentFilter] = useState<'全て' | '未払い' | '支払済'>('全て');

  const load = () => {
    fetch('/api/orders').then(r => r.json()).then(setOrders);
    fetch('/api/staff').then(r => r.json()).then(setStaff);
  };
  useEffect(() => { load(); }, []);

  const filtered = orders.filter(o => {
    if (filter !== '全て' && o.status !== filter) return false;
    if (staffFilter !== '全て' && o.assignee_id !== staffFilter) return false;
    if (paymentFilter !== '全て' && o.payment_status !== paymentFilter) return false;
    return true;
  });

  const handleStatusChange = async (id: string, status: OrderStatus) => {
    await fetch(`/api/orders/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) });
    load();
  };

  const getStaffDot = (color: string) => (
    <span className="inline-block w-2 h-2 rounded-full mr-1" style={{ backgroundColor: color }} />
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">注文一覧</h1>
        <Link href="/orders/new" className="bg-violet-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-violet-700 transition-colors">+ 新規注文</Link>
      </div>

      {/* Filter row */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex gap-1.5 flex-wrap">
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

        <select
          className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 text-gray-600 focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white"
          value={staffFilter}
          onChange={e => setStaffFilter(e.target.value)}
        >
          <option value="全て">担当者: 全て</option>
          {staff.filter(s => s.is_active).map(s => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>

        <div className="flex gap-1.5">
          {paymentFilters.map(p => (
            <button
              key={p}
              onClick={() => setPaymentFilter(p)}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                paymentFilter === p
                  ? 'bg-violet-600 text-white shadow-sm'
                  : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              {p === '全て' ? '支払: 全て' : p}
            </button>
          ))}
        </div>
      </div>

      {/* Order rows */}
      <div className="space-y-1.5">
        {filtered.map(o => (
          <div key={o.id} className="bg-white rounded-lg border border-gray-200 shadow-sm px-4 py-2.5 hover:border-violet-200 transition-colors flex items-center gap-4">
            {/* Left: customer + date */}
            <Link href={`/orders/${o.id}`} className="group min-w-[140px] shrink-0">
              <span className="font-semibold text-sm text-gray-900 group-hover:text-violet-700 transition-colors">{o.customer_name}</span>
              <span className="block text-[11px] text-gray-400 mt-0.5">{o.scheduled_date} {o.scheduled_time && `/ ${o.scheduled_time}`}</span>
            </Link>

            {/* Middle: badges + staff */}
            <div className="flex items-center gap-1.5 flex-wrap flex-1 min-w-0">
              <StatusBadge status={o.delivery_method} />
              <StatusBadge status={o.payment_method} />
              <span className={`inline-block px-2 py-0.5 rounded-md text-[11px] font-medium border ${
                o.payment_status === '未払い'
                  ? 'bg-red-50 text-red-600 border-red-200'
                  : 'bg-emerald-50 text-emerald-700 border-emerald-200'
              }`}>
                {o.payment_status}
              </span>
              {o.assignee && (
                <span className="text-[11px] text-gray-500 flex items-center">
                  {getStaffDot(o.assignee.color)}{o.assignee.name}
                </span>
              )}
              {o.delivery_staff && (
                <span className="text-[11px] text-gray-400 flex items-center">
                  {getStaffDot(o.delivery_staff.color)}{o.delivery_staff.name}
                </span>
              )}
              {o.address && (
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(o.address)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] text-blue-500 hover:text-blue-700"
                  title={o.address}
                >
                  📍Maps
                </a>
              )}
            </div>

            {/* Right: total + status */}
            <div className="flex items-center gap-3 shrink-0">
              <span className="text-sm font-bold text-gray-900">¥{o.total.toLocaleString()}</span>
              <StatusBadge status={o.status} />
              <select
                className="text-xs border border-gray-200 rounded-lg px-2 py-1 text-gray-600 focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white"
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
        ))}
        {filtered.length === 0 && <p className="text-gray-400 text-center py-8 text-sm">注文がありません</p>}
      </div>
    </div>
  );
}
