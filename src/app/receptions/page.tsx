'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import StatusBadge from '@/components/StatusBadge';
import type { Reception, ReceptionStatus } from '@/types';

const statusFilters: (ReceptionStatus | '全て')[] = ['全て', '相談中', '受付済み', '会計待ち', '完了', 'キャンセル'];
const paymentFilters: ('全て' | '未払い' | '支払済')[] = ['全て', '未払い', '支払済'];
const deliveryFilters: ('全て' | '配送' | '配達' | '店頭受取')[] = ['全て', '配送', '配達', '店頭受取'];

export default function ReceptionsPage() {
  const [receptions, setReceptions] = useState<Reception[]>([]);
  const [filter, setFilter] = useState<ReceptionStatus | '全て'>('全て');
  const [paymentFilter, setPaymentFilter] = useState<'全て' | '未払い' | '支払済'>('全て');
  const [deliveryFilter, setDeliveryFilter] = useState<'全て' | '配送' | '配達' | '店頭受取'>('全て');

  const load = () => {
    fetch('/api/receptions').then(r => r.json()).then(setReceptions);
  };
  useEffect(() => { load(); }, []);

  const filtered = receptions.filter(r => {
    if (r.is_archived) return false;
    if (filter !== '全て' && r.status !== filter) return false;
    if (paymentFilter !== '全て' && r.payment_status !== paymentFilter) return false;
    if (deliveryFilter !== '全て' && r.delivery_method !== deliveryFilter) return false;
    return true;
  });

  const handleStatusChange = async (id: string, status: ReceptionStatus) => {
    await fetch(`/api/receptions/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) });
    load();
  };

  const handleArchive = async (id: string, customerName: string) => {
    if (!confirm(`${customerName} の受付をアーカイブしますか？`)) return;
    await fetch(`/api/receptions/${id}`, { method: 'DELETE' });
    load();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">受付管理</h1>
        <Link href="/receptions/new" className="bg-violet-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-violet-700 transition-colors">+ 新規受付</Link>
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
              {s !== '全て' && <span className="ml-1 opacity-60">({receptions.filter(r => !r.is_archived && r.status === s).length})</span>}
            </button>
          ))}
        </div>

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

        <div className="flex gap-1.5">
          {deliveryFilters.map(d => (
            <button
              key={d}
              onClick={() => setDeliveryFilter(d)}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                deliveryFilter === d
                  ? 'bg-violet-600 text-white shadow-sm'
                  : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              {d === '全て' ? '受渡: 全て' : d}
            </button>
          ))}
        </div>
      </div>

      {/* Reception cards */}
      <div className="space-y-2">
        {filtered.map(r => (
          <div key={r.id} className="bg-white rounded-lg border border-gray-200 shadow-sm py-4 px-5 hover:border-violet-200 transition-colors">
            <div className="flex items-start justify-between gap-4">
              {/* Left: customer + details */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <Link href={`/customers/${r.customer_id}`} className="text-base font-bold text-gray-900 hover:text-violet-700 transition-colors">
                    {r.customer_name_snapshot}
                  </Link>
                  <StatusBadge status={r.delivery_method} />
                  <StatusBadge status={r.status} />
                </div>
                <p className="text-sm text-gray-500">
                  {r.desired_date || '日程未定'} {r.desired_time && `/ ${r.desired_time}`}
                </p>
                {r.items_note && (
                  <p className="text-sm text-gray-600 mt-1 line-clamp-2">{r.items_note}</p>
                )}
                <div className="flex items-center gap-3 mt-1.5">
                  <span className={`text-xs font-medium ${r.payment_method === '未定' && r.payment_status === '未払い' ? 'text-red-600' : 'text-gray-500'}`}>
                    {r.payment_method} / {r.payment_status}
                  </span>
                  {r.customer_address_snapshot && (
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(r.customer_address_snapshot)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-500 hover:text-blue-700"
                      title={r.customer_address_snapshot}
                    >
                      Maps
                    </a>
                  )}
                </div>
              </div>

              {/* Right: total + status */}
              <div className="flex flex-col items-end gap-2 shrink-0">
                <Link href={`/receptions/${r.id}`} className="text-lg font-bold text-gray-900 hover:text-violet-700 transition-colors">
                  ¥{r.total.toLocaleString()}
                </Link>
                <div className="flex items-center gap-2">
                  <select
                    className="text-xs border border-gray-200 rounded-lg px-2 py-1 text-gray-600 focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white"
                    value={r.status}
                    onChange={e => handleStatusChange(r.id, e.target.value as ReceptionStatus)}
                  >
                    <option value="相談中">相談中</option>
                    <option value="受付済み">受付済み</option>
                    <option value="会計待ち">会計待ち</option>
                    <option value="完了">完了</option>
                    <option value="キャンセル">キャンセル</option>
                  </select>
                  <button
                    onClick={() => handleArchive(r.id, r.customer_name_snapshot)}
                    className="text-xs text-red-400 hover:text-red-600 px-1.5 py-1 rounded hover:bg-red-50 transition-colors"
                    title="アーカイブ"
                  >
                    ✕
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
        {filtered.length === 0 && <p className="text-gray-400 text-center py-8 text-sm">受付がありません</p>}
      </div>
    </div>
  );
}
