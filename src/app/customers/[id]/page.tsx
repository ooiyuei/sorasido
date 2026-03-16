'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import StatusBadge from '@/components/StatusBadge';
import type { Customer, Reception } from '@/types';

const inputCls = 'border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent w-full';

export default function CustomerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [receptions, setReceptions] = useState<Reception[]>([]);
  const [saving, setSaving] = useState(false);

  // Editable fields
  const [form, setForm] = useState({
    name: '',
    phone: '',
    address: '',
    line_name: '',
    memo: '',
    frequent_items: '',
  });

  useEffect(() => {
    fetch(`/api/customers/${id}`).then(r => r.json()).then((c: Customer) => {
      setCustomer(c);
      setForm({
        name: c.name || '',
        phone: c.phone || '',
        address: c.address || '',
        line_name: c.line_name || '',
        memo: c.memo || '',
        frequent_items: c.frequent_items || '',
      });
    });
    fetch('/api/receptions').then(r => r.json()).then(setReceptions);
  }, [id]);

  const customerReceptions = receptions
    .filter(r => r.customer_id === id)
    .sort((a, b) => (b.desired_date || b.created_at).localeCompare(a.desired_date || a.created_at));

  const activeReceptions = customerReceptions.filter(r => r.status !== '完了' && r.status !== 'キャンセル');
  const pastReceptions = customerReceptions.filter(r => r.status === '完了' || r.status === 'キャンセル');
  const hasReceptions = customerReceptions.length > 0;

  const saveCustomer = async () => {
    setSaving(true);
    await fetch(`/api/customers/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    setSaving(false);
  };

  const handleArchive = async () => {
    const activeCount = activeReceptions.length;
    const msg = activeCount > 0
      ? `この顧客には進行中の受付が${activeCount}件あります。アーカイブしますか？`
      : 'この顧客をアーカイブしますか？';
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
          <button onClick={handleArchive} className="text-xs text-red-500 hover:text-red-700 font-medium px-3 py-1.5 rounded-lg border border-red-200 hover:bg-red-50 transition-colors">アーカイブ</button>
          <button onClick={() => router.back()} className="text-xs text-gray-500 hover:text-gray-700">← 戻る</button>
        </div>
      </div>

      {/* Editable fields */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm divide-y divide-gray-100">
        <div className="p-4 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] text-gray-400 uppercase tracking-wide font-semibold">名前</label>
              <input
                className={inputCls}
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              />
            </div>
            <div>
              <label className="text-[11px] text-gray-400 uppercase tracking-wide font-semibold">電話番号</label>
              <input
                className={inputCls}
                value={form.phone}
                onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
              />
            </div>
            <div className="sm:col-span-2">
              <label className="text-[11px] text-gray-400 uppercase tracking-wide font-semibold">住所</label>
              <input
                className={inputCls}
                value={form.address}
                onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
              />
            </div>
            <div>
              <label className="text-[11px] text-gray-400 uppercase tracking-wide font-semibold">LINE名</label>
              <input
                className={inputCls}
                value={form.line_name}
                onChange={e => setForm(f => ({ ...f, line_name: e.target.value }))}
              />
            </div>
            <div>
              <label className="text-[11px] text-gray-400 uppercase tracking-wide font-semibold">よく注文する品</label>
              <input
                className={inputCls}
                value={form.frequent_items}
                onChange={e => setForm(f => ({ ...f, frequent_items: e.target.value }))}
                placeholder="例: 巨峰2房, シャインマスカット1房"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="text-[11px] text-gray-400 uppercase tracking-wide font-semibold">メモ</label>
              <textarea
                className={`${inputCls} min-h-[60px]`}
                value={form.memo}
                onChange={e => setForm(f => ({ ...f, memo: e.target.value }))}
                placeholder="顧客メモ..."
              />
            </div>
          </div>
          <button
            onClick={saveCustomer}
            disabled={saving}
            className="text-xs px-4 py-2 rounded-lg bg-violet-600 text-white font-medium hover:bg-violet-700 transition-colors disabled:opacity-50"
          >
            {saving ? '保存中...' : '保存'}
          </button>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex gap-3">
        <Link
          href={`/receptions/new?customer_id=${id}`}
          className="bg-violet-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-violet-700 transition-colors"
        >
          この顧客で新規受付
        </Link>
        {hasReceptions && (
          <Link
            href={`/receptions/new?customer_id=${id}&duplicate=last`}
            className="bg-white text-violet-700 px-4 py-2.5 rounded-lg text-sm font-medium border border-violet-300 hover:bg-violet-50 transition-colors"
          >
            前回内容を複製
          </Link>
        )}
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
