'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import StatusBadge from '@/components/StatusBadge';
import type { Reservation, ReservationStatus, DeliveryMethod } from '@/types';

const inputCls = "border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent w-full";

export default function ReservationsPage() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [form, setForm] = useState({
    customer_name: '', phone: '', address: '', desired_date: '', desired_time: '',
    delivery_method: '配達' as DeliveryMethod, items_note: '', memo: '', status: '仮予約' as ReservationStatus,
  });

  const load = () => fetch('/api/reservations').then(r => r.json()).then(setReservations);
  useEffect(() => { load(); }, []);

  const handleSave = async () => {
    if (!form.customer_name.trim()) return;
    await fetch('/api/reservations', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    setIsAdding(false);
    setForm({ customer_name: '', phone: '', address: '', desired_date: '', desired_time: '', delivery_method: '配達', items_note: '', memo: '', status: '仮予約' });
    load();
  };

  const handleStatusChange = async (id: string, status: ReservationStatus) => {
    await fetch(`/api/reservations/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) });
    load();
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">予約一覧</h1>
        <button onClick={() => setIsAdding(true)} className="bg-violet-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-violet-700 transition-colors">+ 新規予約</button>
      </div>

      {isAdding && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 space-y-3">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide">新規予約</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input className={inputCls} placeholder="名前 *" value={form.customer_name} onChange={e => setForm(f => ({ ...f, customer_name: e.target.value }))} autoFocus />
            <input className={inputCls} placeholder="電話番号" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
            <input className={`${inputCls} sm:col-span-2`} placeholder="住所" value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} />
            <input className={inputCls} type="date" value={form.desired_date} onChange={e => setForm(f => ({ ...f, desired_date: e.target.value }))} />
            <input className={inputCls} placeholder="希望時間" value={form.desired_time} onChange={e => setForm(f => ({ ...f, desired_time: e.target.value }))} />
            <select className={inputCls} value={form.delivery_method} onChange={e => setForm(f => ({ ...f, delivery_method: e.target.value as DeliveryMethod }))}>
              <option value="配達">配達</option><option value="配送">配送</option><option value="店頭受取">店頭受取</option>
            </select>
            <select className={inputCls} value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value as ReservationStatus }))}>
              <option value="仮予約">仮予約</option><option value="確定">確定</option>
            </select>
            <input className={`${inputCls} sm:col-span-2`} placeholder="希望商品内容" value={form.items_note} onChange={e => setForm(f => ({ ...f, items_note: e.target.value }))} />
            <input className={`${inputCls} sm:col-span-2`} placeholder="メモ" value={form.memo} onChange={e => setForm(f => ({ ...f, memo: e.target.value }))} />
          </div>
          <div className="flex gap-2 pt-2 border-t border-gray-100">
            <button onClick={handleSave} className="bg-violet-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-violet-700 transition-colors">保存</button>
            <button onClick={() => setIsAdding(false)} className="text-gray-500 px-4 py-2 text-sm">キャンセル</button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {reservations.map(r => (
          <div key={r.id} className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 hover:border-violet-200 transition-colors">
            <div className="flex items-start justify-between">
              <Link href={`/reservations/${r.id}`} className="group">
                <h3 className="font-semibold text-gray-900 group-hover:text-violet-700 transition-colors">{r.customer_name}</h3>
                <p className="text-xs text-gray-500 mt-0.5">{r.desired_date} {r.desired_time && `/ ${r.desired_time}`}</p>
                <p className="text-sm text-gray-600 mt-1">{r.items_note}</p>
              </Link>
              <div className="flex flex-col items-end gap-2">
                <div className="flex gap-1">
                  <StatusBadge status={r.status} />
                  <StatusBadge status={r.delivery_method} />
                </div>
                <select className="text-xs border border-gray-200 rounded-lg px-2 py-1 text-gray-600 focus:outline-none focus:ring-2 focus:ring-violet-500" value={r.status} onChange={e => handleStatusChange(r.id, e.target.value as ReservationStatus)}>
                  <option value="仮予約">仮予約</option><option value="確定">確定</option><option value="キャンセル">キャンセル</option>
                </select>
              </div>
            </div>
            {r.memo && <p className="text-xs text-gray-500 mt-3 pt-3 border-t border-gray-100">{r.memo}</p>}
          </div>
        ))}
        {reservations.length === 0 && <p className="text-gray-400 text-center py-8 text-sm">予約がありません</p>}
      </div>
    </div>
  );
}
