'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import StatusBadge from '@/components/StatusBadge';
import type { Reservation, ReservationStatus, Staff } from '@/types';

export default function ReservationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [r, setR] = useState<Reservation | null>(null);
  const [staffList, setStaffList] = useState<Staff[]>([]);

  useEffect(() => {
    fetch(`/api/reservations/${id}`).then(res => res.json()).then(setR);
    fetch('/api/staff').then(res => res.json()).then(setStaffList);
  }, [id]);

  const handleStatusChange = async (status: ReservationStatus) => {
    await fetch(`/api/reservations/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) });
    fetch(`/api/reservations/${id}`).then(res => res.json()).then(setR);
  };

  const handleDelete = async () => {
    if (!confirm('この予約を削除しますか？')) return;
    await fetch(`/api/reservations/${id}`, { method: 'DELETE' });
    router.push('/reservations');
  };

  if (!r) return <div className="text-center py-12 text-gray-400 text-sm">読み込み中...</div>;

  const assignee = r.assignee || staffList.find(s => s.id === r.assignee_id);

  return (
    <div className="space-y-5 max-w-2xl">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">予約詳細</h1>
        <button onClick={() => router.back()} className="text-xs text-gray-500 hover:text-gray-700">← 戻る</button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm divide-y divide-gray-100">
        <div className="p-4 flex items-center justify-between flex-wrap gap-2">
          <div className="flex gap-1.5">
            <StatusBadge status={r.status} />
            <StatusBadge status={r.delivery_method} />
          </div>
          <select className="text-xs border border-gray-200 rounded-lg px-2.5 py-1.5 text-gray-600 focus:outline-none focus:ring-2 focus:ring-violet-500" value={r.status} onChange={e => handleStatusChange(e.target.value as ReservationStatus)}>
            <option value="仮予約">仮予約</option><option value="確定">確定</option><option value="キャンセル">キャンセル</option>
          </select>
        </div>

        <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div><p className="text-[11px] text-gray-400 uppercase tracking-wide">名前</p><p className="font-semibold text-gray-900 text-lg mt-0.5">{r.customer_name}</p></div>
          <div><p className="text-[11px] text-gray-400 uppercase tracking-wide">電話番号</p><p className="font-medium text-gray-700 mt-0.5">{r.phone || '-'}</p></div>
          <div className="sm:col-span-2">
            <p className="text-[11px] text-gray-400 uppercase tracking-wide">住所</p>
            {r.address ? (
              <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(r.address)}`} target="_blank" rel="noopener noreferrer" className="text-violet-600 hover:underline text-sm">{r.address} 📍</a>
                <a href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(r.address)}`} target="_blank" rel="noopener noreferrer" className="text-xs px-2 py-1 rounded-md bg-blue-50 text-blue-700 border border-blue-200 font-medium hover:bg-blue-100 transition-colors">🚗 ルート案内</a>
              </div>
            ) : <p className="text-gray-400 text-sm mt-0.5">-</p>}
          </div>
          <div><p className="text-[11px] text-gray-400 uppercase tracking-wide">希望日</p><p className="font-medium text-gray-700 mt-0.5">{r.desired_date || '-'}</p></div>
          <div><p className="text-[11px] text-gray-400 uppercase tracking-wide">希望時間</p><p className="font-medium text-gray-700 mt-0.5">{r.desired_time || '-'}</p></div>
          <div>
            <p className="text-[11px] text-gray-400 uppercase tracking-wide">担当者</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              {assignee && <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: assignee.color }} />}
              <p className="font-medium text-gray-700">{assignee?.name || '-'}</p>
            </div>
          </div>
        </div>

        <div className="p-4">
          <p className="text-[11px] text-gray-400 uppercase tracking-wide">希望商品内容</p>
          <p className="text-sm font-medium text-gray-800 mt-0.5">{r.items_note || '-'}</p>
        </div>

        {r.memo && (
          <div className="p-4">
            <p className="text-[11px] text-gray-400 uppercase tracking-wide">メモ</p>
            <p className="text-sm text-gray-700 mt-0.5">{r.memo}</p>
          </div>
        )}

        <div className="p-4 flex gap-3">
          <button onClick={() => router.push('/orders/new')} className="bg-violet-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-violet-700 transition-colors">この予約から注文作成</button>
          <button onClick={handleDelete} className="text-red-500 text-xs hover:underline font-medium self-center">削除</button>
        </div>
      </div>
    </div>
  );
}
