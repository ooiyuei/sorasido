'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import type { Customer, Reception } from '@/types';

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [receptions, setReceptions] = useState<Reception[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => { load(); }, []);

  const filtered = customers.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.phone.includes(search)
  );

  const getReceptionCount = (customerId: string) =>
    receptions.filter(r => r.customer_id === customerId).length;

  const getLastReceptionDate = (customerId: string) => {
    const customerReceptions = receptions
      .filter(r => r.customer_id === customerId)
      .sort((a, b) => b.created_at.localeCompare(a.created_at));
    return customerReceptions.length > 0 ? customerReceptions[0].desired_date || customerReceptions[0].created_at.split('T')[0] : '-';
  };

  const load = () => {
    fetch('/api/customers').then(r => r.json()).then(setCustomers);
    fetch('/api/receptions').then(r => r.json()).then(setReceptions);
  };

  const handleDelete = async (c: Customer) => {
    const count = getReceptionCount(c.id);
    const msg = count > 0
      ? `${c.name} を削除しますか？関連する受付${count}件もすべて削除されます。`
      : `${c.name} を削除しますか？`;
    if (!confirm(msg)) return;
    await fetch(`/api/customers/${c.id}`, { method: 'DELETE' });
    load();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">顧客</h1>
      </div>

      <input
        className="border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent w-full max-w-sm"
        placeholder="名前・電話番号で検索..."
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
                  <div className="flex items-center gap-4 mt-1">
                    <span className="text-sm text-gray-500">{c.phone || '-'}</span>
                    {c.address && (
                      <span className="text-sm text-gray-400 truncate max-w-[200px]">{c.address}</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0 text-sm text-gray-500">
                  <span>受付 {count}件</span>
                  <span>最終: {lastDate}</span>
                  <button
                    onClick={(e) => { e.preventDefault(); handleDelete(c); }}
                    className="text-xs text-red-400 hover:text-red-600 px-1.5 py-1 rounded hover:bg-red-50 transition-colors"
                    title="削除"
                  >
                    ✕
                  </button>
                </div>
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && <p className="text-gray-400 text-center py-8 text-sm">顧客がありません</p>}
      </div>
    </div>
  );
}
