'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import StatusBadge from '@/components/StatusBadge';
import type { Reservation, ReservationStatus, DeliveryMethod, Staff } from '@/types';

const inputCls = "border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent w-full";

type StatusFilter = '全て' | ReservationStatus;

export default function ReservationsPage() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('全て');
  const [staffFilter, setStaffFilter] = useState<string>('');
  const [form, setForm] = useState({
    customer_name: '', phone: '', address: '', desired_date: '', desired_time: '',
    delivery_method: '配達' as DeliveryMethod, items_note: '', memo: '',
    status: '仮予約' as ReservationStatus, assignee_id: '',
  });

  const load = () => {
    fetch('/api/reservations').then(r => r.json()).then(setReservations);
    fetch('/api/staff').then(r => r.json()).then(setStaff);
  };
  useEffect(() => { load(); }, []);

  const handleSave = async () => {
    if (!form.customer_name.trim()) return;
    await fetch('/api/reservations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, assignee_id: form.assignee_id || null }),
    });
    setIsAdding(false);
    setForm({ customer_name: '', phone: '', address: '', desired_date: '', desired_time: '', delivery_method: '配達', items_note: '', memo: '', status: '仮予約', assignee_id: '' });
    load();
  };

  const handleStatusChange = async (id: string, status: ReservationStatus) => {
    await fetch(`/api/reservations/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) });
    load();
  };

  const filtered = reservations.filter(r => {
    if (statusFilter !== '全て' && r.status !== statusFilter) return false;
    if (staffFilter && r.assignee_id !== staffFilter) return false;
    return true;
  });

  const statusFilters: StatusFilter[] = ['全て', '仮予約', '確定', 'キャンセル'];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">予約一覧</h1>
        <button onClick={() => setIsAdding(true)} className="bg-violet-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-violet-700 transition-colors">+ 新規予約</button>
      </div>

      {/* Filter row */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex gap-1">
          {statusFilters.map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${statusFilter === s ? 'bg-violet-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            >
              {s}
            </button>
          ))}
        </div>
        <select
          className="border border-gray-300 rounded-lg px-3 py-1.5 text-xs text-gray-600 focus:outline-none focus:ring-2 focus:ring-violet-500"
          value={staffFilter}
          onChange={e => setStaffFilter(e.target.value)}
        >
          <option value="">担当者</option>
          {staff.filter(s => s.is_active).map(s => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
      </div>

      {/* New reservation form */}
      {isAdding && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 space-y-3">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide">新規予約</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <input className={inputCls} placeholder="名前 *" value={form.customer_name} onChange={e => setForm(f => ({ ...f, customer_name: e.target.value }))} autoFocus />
            <input className={inputCls} placeholder="電話番号" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
            <input className={inputCls} placeholder="住所" value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} />
            <input className={inputCls} type="date" value={form.desired_date} onChange={e => setForm(f => ({ ...f, desired_date: e.target.value }))} />
            <input className={inputCls} placeholder="希望時間" value={form.desired_time} onChange={e => setForm(f => ({ ...f, desired_time: e.target.value }))} />
            <select className={inputCls} value={form.delivery_method} onChange={e => setForm(f => ({ ...f, delivery_method: e.target.value as DeliveryMethod }))}>
              <option value="配達">配達</option><option value="配送">配送</option><option value="店頭受取">店頭受取</option>
            </select>
            <select className={inputCls} value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value as ReservationStatus }))}>
              <option value="仮予約">仮予約</option><option value="確定">確定</option>
            </select>
            <select className={inputCls} value={form.assignee_id} onChange={e => setForm(f => ({ ...f, assignee_id: e.target.value }))}>
              <option value="">担当者を選択</option>
              {staff.filter(s => s.is_active).map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
            <input className={inputCls} placeholder="希望商品内容" value={form.items_note} onChange={e => setForm(f => ({ ...f, items_note: e.target.value }))} />
          </div>
          <input className={inputCls} placeholder="メモ" value={form.memo} onChange={e => setForm(f => ({ ...f, memo: e.target.value }))} />
          <div className="flex gap-2 pt-2 border-t border-gray-100">
            <button onClick={handleSave} className="bg-violet-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-violet-700 transition-colors">保存</button>
            <button onClick={() => setIsAdding(false)} className="text-gray-500 px-4 py-2 text-sm">キャンセル</button>
          </div>
        </div>
      )}

      {/* Reservation list - compact rows */}
      <div className="space-y-2">
        {filtered.map(r => (
          <div key={r.id} className="bg-white rounded-lg border border-gray-200 shadow-sm px-4 py-3 hover:border-violet-200 transition-colors">
            <div className="flex items-center gap-4">
              {/* Left: customer + date */}
              <Link href={`/reservations/${r.id}`} className="group min-w-[140px] shrink-0">
                <span className="font-semibold text-gray-900 group-hover:text-violet-700 transition-colors">{r.customer_name}</span>
                <p className="text-xs text-gray-500">{r.desired_date}{r.desired_time ? ` / ${r.desired_time}` : ''}</p>
              </Link>

              {/* Middle: items, delivery, assignee */}
              <div className="flex items-center gap-3 flex-1 min-w-0">
                {r.items_note && <span className="text-sm text-gray-500 truncate">{r.items_note}</span>}
                <StatusBadge status={r.delivery_method} />
                {r.assignee && (
                  <span className="flex items-center gap-1.5 text-xs text-gray-600 shrink-0">
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: r.assignee.color || '#9ca3af' }} />
                    {r.assignee.name}
                  </span>
                )}
              </div>

              {/* Right: status badge + dropdown */}
              <div className="flex items-center gap-2 shrink-0">
                <StatusBadge status={r.status} />
                <select
                  className="text-xs border border-gray-200 rounded-lg px-2 py-1 text-gray-600 focus:outline-none focus:ring-2 focus:ring-violet-500"
                  value={r.status}
                  onChange={e => handleStatusChange(r.id, e.target.value as ReservationStatus)}
                >
                  <option value="仮予約">仮予約</option><option value="確定">確定</option><option value="キャンセル">キャンセル</option>
                </select>
              </div>
            </div>
            {r.memo && <p className="text-xs text-gray-400 mt-1.5 pl-[140px]">{r.memo}</p>}
          </div>
        ))}
        {filtered.length === 0 && <p className="text-gray-400 text-center py-8 text-sm">予約がありません</p>}
      </div>
    </div>
  );
}
