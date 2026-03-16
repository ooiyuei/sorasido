'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import StatusBadge from '@/components/StatusBadge';
import type { Customer, Reception } from '@/types';

export default function CustomerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [receptions, setReceptions] = useState<Reception[]>([]);
  const [memo, setMemo] = useState('');
  const [savingMemo, setSavingMemo] = useState(false);

  useEffect(() => {
    fetch(`/api/customers/${id}`).then(r => r.json()).then((c: Customer) => {
      setCustomer(c);
      setMemo(c.memo || '');
    });
    fetch('/api/receptions').then(r => r.json()).then(setReceptions);
  }, [id]);

  const customerReceptions = receptions
    .filter(r => r.customer_id === id)
    .sort((a, b) => (b.desired_date || b.created_at).localeCompare(a.desired_date || a.created_at));

  const activeReceptions = customerReceptions.filter(r => r.status !== '完了' && r.status !== 'キャンセル');
  const pastReceptions = customerReceptions.filter(r => r.status === '完了' || r.status === 'キャンセル');

  const saveMemo = async () => {
    setSavingMemo(true);
    await fetch(`/api/customers/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ memo }),
    });
    setSavingMemo(false);
  };

  const handleDeleteCustomer = async () => {
    const activeCount = receptions.filter(r => r.customer_id === id && r.status !== '完了' && r.status !== 'キャンセル').length;
    const msg = activeCount > 0
      ? `この顧客には進行中の受付が${activeCount}件あります。顧客と関連する受付をすべて削除しますか？`
      : 'この顧客を削除しますか？関連する受付もすべて削除されます。';
    if (!confirm(msg)) return;
    await fetch(`/api/customers/${id}`, { method: 'DELETE' });
    router.push('/customers');
  };

  if (!customer) return <div className="text-center py-12 text-gray-400 text-sm">読み込み中...</div>;

  return (
    <div className="space-y-5 max-w-2xl">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">顧客詳細</h1>
        <div className="flex items-center gap-3">
          <button onClick={handleDeleteCustomer} className="text-xs text-red-500 hover:text-red-700 font-medium px-3 py-1.5 rounded-lg border border-red-200 hover:bg-red-50 transition-colors">顧客を削除</button>
          <button onClick={() => router.back()} className="text-xs text-gray-500 hover:text-gray-700">← 戻る</button>
        </div>
      </div>

      {/* Customer info */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm divide-y divide-gray-100">
        <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <p className="text-[11px] text-gray-400 uppercase tracking-wide">名前</p>
            <p className="font-semibold text-gray-900 text-lg mt-0.5">{customer.name}</p>
          </div>
          <div>
            <p className="text-[11px] text-gray-400 uppercase tracking-wide">電話番号</p>
            <p className="font-medium text-gray-700 mt-0.5">{customer.phone || '-'}</p>
          </div>
          <div className="sm:col-span-2">
            <p className="text-[11px] text-gray-400 uppercase tracking-wide">住所</p>
            {customer.address ? (
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(customer.address)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-violet-600 hover:underline text-sm mt-0.5 inline-block"
              >
                {customer.address} 📍
              </a>
            ) : <p className="text-gray-400 text-sm mt-0.5">-</p>}
          </div>
        </div>

        {/* Memo */}
        <div className="p-4 space-y-2">
          <p className="text-[11px] text-gray-400 uppercase tracking-wide">メモ</p>
          <textarea
            className="border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent w-full min-h-[60px]"
            value={memo}
            onChange={e => setMemo(e.target.value)}
            placeholder="顧客メモ..."
          />
          <button
            onClick={saveMemo}
            disabled={savingMemo}
            className="text-xs px-3 py-1.5 rounded-lg bg-violet-600 text-white font-medium hover:bg-violet-700 transition-colors disabled:opacity-50"
          >
            {savingMemo ? '保存中...' : 'メモを保存'}
          </button>
        </div>
      </div>

      {/* Active receptions */}
      {activeReceptions.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold text-gray-800 mb-3">進行中の受付 ({activeReceptions.length}件)</h2>
          <div className="space-y-2">
            {activeReceptions.map(r => (
              <ReceptionCard key={r.id} reception={r} />
            ))}
          </div>
        </section>
      )}

      {/* Past receptions */}
      {pastReceptions.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold text-gray-800 mb-3">過去の受付 ({pastReceptions.length}件)</h2>
          <div className="space-y-2">
            {pastReceptions.map(r => (
              <ReceptionCard key={r.id} reception={r} />
            ))}
          </div>
        </section>
      )}

      {customerReceptions.length === 0 && (
        <p className="text-gray-400 text-sm text-center py-8">受付履歴はありません</p>
      )}
    </div>
  );
}

function ReceptionCard({ reception: r }: { reception: Reception }) {
  return (
    <Link href={`/receptions/${r.id}`} className="block bg-white rounded-lg border border-gray-200 shadow-sm px-4 py-3 hover:border-violet-200 transition-colors">
      <div className="flex items-center justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-sm text-gray-500">{r.desired_date || '日程未定'}</span>
            <StatusBadge status={r.status} />
            <StatusBadge status={r.delivery_method} />
          </div>
          {r.items_note && (
            <p className="text-sm text-gray-600 truncate">{r.items_note}</p>
          )}
        </div>
        <span className="text-base font-bold text-gray-900 shrink-0">¥{r.total.toLocaleString()}</span>
      </div>
    </Link>
  );
}
