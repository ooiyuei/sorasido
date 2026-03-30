'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Breadcrumb from '@/components/Breadcrumb';
import { apiFetch } from '@/lib/api-client';
import type { Customer, Reception } from '@/types';

const inputCls = 'border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent w-full';

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [receptions, setReceptions] = useState<Reception[]>([]);
  const [search, setSearch] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [newForm, setNewForm] = useState({ name: '', phone: '', address: '', line_name: '', memo: '' });

  useEffect(() => { load(); }, []);

  const load = () => {
    apiFetch('/api/customers').then(r => r.json()).then(setCustomers);
    apiFetch('/api/receptions').then(r => r.json()).then(setReceptions);
  };

  const filtered = customers.filter(c => {
    const q = search.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      c.phone.includes(q) ||
      (c.address || '').toLowerCase().includes(q) ||
      (c.line_name || '').toLowerCase().includes(q)
    );
  });

  const getReceptionCount = (customerId: string) =>
    receptions.filter(r => r.customer_id === customerId).length;

  const getLastReceptionDate = (customerId: string) => {
    const customerReceptions = receptions
      .filter(r => r.customer_id === customerId)
      .sort((a, b) => b.created_at.localeCompare(a.created_at));
    return customerReceptions.length > 0
      ? customerReceptions[0].desired_date || customerReceptions[0].created_at.split('T')[0]
      : '-';
  };

  const handleArchive = async (c: Customer) => {
    if (!confirm(`${c.name} をアーカイブしますか？`)) return;
    setCustomers(prev => prev.filter(x => x.id !== c.id));
    await apiFetch(`/api/customers/${c.id}`, { method: 'DELETE' });
    load();
  };

  const handleAddCustomer = async () => {
    if (!newForm.name.trim()) { alert('名前を入力してください'); return; }
    const res = await apiFetch('/api/customers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newForm),
    });
    if (res.ok) {
      setIsAdding(false);
      setNewForm({ name: '', phone: '', address: '', line_name: '', memo: '' });
      load();
    }
  };

  return (
    <div className="space-y-4">
      <Breadcrumb items={[{ label: '顧客' }]} />
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">顧客</h1>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="bg-violet-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-violet-700 transition-colors"
        >
          + 新規顧客
        </button>
      </div>

      {isAdding && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 space-y-3">
          <h3 className="text-sm font-semibold text-gray-800">新規顧客</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input className={inputCls} placeholder="名前 *" value={newForm.name} onChange={e => setNewForm(f => ({ ...f, name: e.target.value }))} autoFocus />
            <input className={inputCls} placeholder="電話番号" value={newForm.phone} onChange={e => setNewForm(f => ({ ...f, phone: e.target.value }))} />
            <input className={inputCls} placeholder="住所" value={newForm.address} onChange={e => setNewForm(f => ({ ...f, address: e.target.value }))} />
            <input className={inputCls} placeholder="LINE名" value={newForm.line_name} onChange={e => setNewForm(f => ({ ...f, line_name: e.target.value }))} />
            <input className={`${inputCls} sm:col-span-2`} placeholder="メモ" value={newForm.memo} onChange={e => setNewForm(f => ({ ...f, memo: e.target.value }))} />
          </div>
          <div className="flex gap-2 pt-2 border-t border-gray-100">
            <button onClick={handleAddCustomer} className="bg-violet-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-violet-700 transition-colors">保存</button>
            <button onClick={() => { setIsAdding(false); setNewForm({ name: '', phone: '', address: '', line_name: '', memo: '' }); }} className="text-gray-500 px-4 py-2 text-sm hover:text-gray-700">キャンセル</button>
          </div>
        </div>
      )}

      <input
        className="border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent w-full max-w-md"
        placeholder="名前・電話番号・住所・LINE名で検索..."
        value={search}
        onChange={e => setSearch(e.target.value)}
      />

      <div className="space-y-1.5">
        {filtered.map(c => {
          const count = getReceptionCount(c.id);
          const lastDate = getLastReceptionDate(c.id);
          return (
            <div key={c.id} className="bg-white rounded-lg border border-gray-200 shadow-sm px-5 py-4 hover:border-violet-200 transition-colors">
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <Link href={`/customers/${c.id}`} className="text-base font-bold text-gray-900 hover:text-violet-700 transition-colors">
                    {c.name}
                  </Link>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-0.5 mt-1">
                    <span className="text-sm text-gray-500">{c.phone || '-'}</span>
                    {c.address && (
                      <span className="text-sm text-gray-400 truncate max-w-[200px]">{c.address}</span>
                    )}
                    {c.line_name && (
                      <span className="text-sm text-green-600">LINE: {c.line_name}</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0 text-sm text-gray-500">
                  <span>受付 {count}件</span>
                  <span>最終: {lastDate}</span>
                  <Link
                    href={`/receptions/new?customer_id=${c.id}`}
                    className="text-xs text-violet-600 hover:text-violet-800 px-2 py-1 rounded hover:bg-violet-50 transition-colors font-medium"
                  >
                    新規受付
                  </Link>
                  <button
                    onClick={(e) => { e.preventDefault(); handleArchive(c); }}
                    className="text-xs text-red-400 hover:text-red-600 px-1.5 py-1 rounded hover:bg-red-50 transition-colors"
                    title="アーカイブ"
                  >
                    アーカイブ
                  </button>
                </div>
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
            <p className="text-3xl mb-3">👤</p>
            <p className="text-gray-500 font-medium text-sm">
              {search ? '検索結果がありません' : '顧客がありません'}
            </p>
            <p className="text-gray-400 text-xs mt-1">
              {search
                ? `「${search}」に一致する顧客が見つかりません。検索条件を変更してみてください。`
                : '「+ 新規顧客」から顧客を登録して、受付管理を始めましょう。'}
            </p>
            {!search && (
              <button
                onClick={() => setIsAdding(true)}
                className="inline-block mt-4 bg-violet-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-violet-700 transition-colors"
              >
                + 新規顧客を登録
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
