'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api-client';
import Breadcrumb from '@/components/Breadcrumb';
import type { ProductSet, Variety, PricingMode } from '@/types';

const inputCls = "border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent w-full";

export default function SetsPage() {
  const [sets, setSets] = useState<ProductSet[]>([]);
  const [varieties, setVarieties] = useState<Variety[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: '', price: 0, pricing_mode: 'fixed' as PricingMode, is_active: true,
    items: [] as { variety_id: string; quantity: number }[],
  });

  const load = () => {
    apiFetch('/api/sets').then(r => r.json()).then(setSets);
    apiFetch('/api/varieties').then(r => r.json()).then(setVarieties);
  };
  useEffect(() => { load(); }, []);

  const handleSave = async () => {
    if (!form.name.trim()) return;
    if (editId) {
      await apiFetch(`/api/sets/${editId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    } else {
      await apiFetch('/api/sets', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    }
    setEditId(null); setIsAdding(false);
    setForm({ name: '', price: 0, pricing_mode: 'fixed', is_active: true, items: [] });
    load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('このセットを削除しますか？')) return;
    await apiFetch(`/api/sets/${id}`, { method: 'DELETE' }); load();
  };

  const handleToggle = async (s: ProductSet) => {
    await apiFetch(`/api/sets/${s.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ is_active: !s.is_active }) }); load();
  };

  const startEdit = (s: ProductSet) => {
    setEditId(s.id); setIsAdding(false);
    setForm({
      name: s.name, price: s.price, pricing_mode: s.pricing_mode || 'fixed', is_active: s.is_active,
      items: (s.items || []).map(si => ({ variety_id: si.variety_id, quantity: si.quantity })),
    });
  };

  const startAdd = () => {
    setIsAdding(true); setEditId(null);
    setForm({ name: '', price: 0, pricing_mode: 'fixed', is_active: true, items: [{ variety_id: varieties[0]?.id || '', quantity: 1 }] });
  };

  const cancel = () => {
    setEditId(null); setIsAdding(false);
    setForm({ name: '', price: 0, pricing_mode: 'fixed', is_active: true, items: [] });
  };

  const addItem = () => setForm(f => ({ ...f, items: [...f.items, { variety_id: varieties[0]?.id || '', quantity: 1 }] }));
  const removeItem = (idx: number) => setForm(f => ({ ...f, items: f.items.filter((_, i) => i !== idx) }));
  const updateItem = (idx: number, field: string, value: string | number) => {
    setForm(f => ({ ...f, items: f.items.map((item, i) => i === idx ? { ...item, [field]: value } : item) }));
  };

  const renderForm = () => (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 space-y-4">
      <h3 className="text-sm font-semibold text-gray-800">{editId ? 'セット編集' : '新規セット'}</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <input className={inputCls} placeholder="セット名" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} autoFocus />
        <input className={inputCls} type="number" placeholder="価格" value={form.price || ''} onChange={e => setForm(f => ({ ...f, price: parseInt(e.target.value) || 0 }))} />
        <select className={inputCls} value={form.pricing_mode} onChange={e => setForm(f => ({ ...f, pricing_mode: e.target.value as PricingMode }))}>
          <option value="fixed">固定価格</option>
          <option value="derived">構成合計</option>
        </select>
        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input type="checkbox" className="rounded border-gray-300 text-violet-600 focus:ring-violet-500" checked={form.is_active} onChange={e => setForm(f => ({ ...f, is_active: e.target.checked }))} />
          有効
        </label>
      </div>
      <div>
        <p className="text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">構成品種</p>
        {form.items.map((item, idx) => (
          <div key={idx} className="flex items-center gap-2 mb-2">
            <select className="border border-gray-300 rounded-lg px-3 py-2 text-sm flex-1 focus:outline-none focus:ring-2 focus:ring-violet-500" value={item.variety_id} onChange={e => updateItem(idx, 'variety_id', e.target.value)}>
              {varieties.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
            </select>
            <input className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-20 text-center focus:outline-none focus:ring-2 focus:ring-violet-500" type="number" min={1} value={item.quantity} onChange={e => updateItem(idx, 'quantity', parseInt(e.target.value) || 1)} />
            <span className="text-xs text-gray-400">房</span>
            <button onClick={() => removeItem(idx)} className="text-red-400 hover:text-red-600 text-sm">x</button>
          </div>
        ))}
        <button onClick={addItem} className="text-violet-600 text-sm hover:underline font-medium">+ 品種を追加</button>
      </div>
      <div className="flex gap-2 pt-2 border-t border-gray-100">
        <button onClick={handleSave} className="bg-violet-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-violet-700 transition-colors">保存</button>
        <button onClick={cancel} className="text-gray-500 px-4 py-2 text-sm hover:text-gray-700">キャンセル</button>
      </div>
    </div>
  );

  return (
    <div className="space-y-5">
      <Breadcrumb items={[{ label: 'セット商品管理' }]} />
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">セット商品管理</h1>
        <button onClick={startAdd} className="bg-violet-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-violet-700 transition-colors">+ セット追加</button>
      </div>

      {(isAdding || editId) && renderForm()}

      {/* Compact list rows */}
      <div className="space-y-2">
        {sets.map(s => (
          <div key={s.id} className={`bg-white rounded-lg border border-gray-200 shadow-sm px-4 py-3 transition-opacity ${!s.is_active ? 'opacity-50' : ''}`}>
            <div className="flex items-center gap-4">
              {/* Left: name, price, pricing mode */}
              <div className="min-w-[160px] shrink-0">
                <span className="font-semibold text-gray-900">{s.name}</span>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-sm font-bold text-violet-700">&yen;{s.price.toLocaleString()}</span>
                  <span className="text-[11px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-500">
                    {s.pricing_mode === 'fixed' ? '固定' : '構成合計'}
                  </span>
                </div>
              </div>

              {/* Middle: composition inline */}
              <div className="flex-1 min-w-0">
                <span className="text-sm text-gray-600 truncate block">
                  {(s.items || []).map(si => `${si.variety?.name || '不明'} x ${si.quantity}`).join(', ') || '-'}
                </span>
              </div>

              {/* Right: toggle, edit, delete */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => handleToggle(s)}
                  className={`text-xs px-2.5 py-1 rounded-lg border font-medium transition-colors ${s.is_active ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100' : 'bg-gray-50 text-gray-400 border-gray-200 hover:bg-gray-100'}`}
                >
                  {s.is_active ? '有効' : '無効'}
                </button>
                <button onClick={() => startEdit(s)} className="text-xs text-violet-600 hover:underline font-medium px-2 py-1">編集</button>
                <button onClick={() => handleDelete(s.id)} className="text-xs text-red-500 hover:underline px-2 py-1">削除</button>
              </div>
            </div>
          </div>
        ))}
        {sets.length === 0 && (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
            <p className="text-3xl mb-3">📦</p>
            <p className="text-gray-500 font-medium text-sm">セット商品がありません</p>
            <p className="text-gray-400 text-xs mt-1">
              複数品種を組み合わせたセット商品を作成して、注文をスムーズに管理しましょう。
            </p>
            <button
              onClick={startAdd}
              className="inline-block mt-4 bg-violet-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-violet-700 transition-colors"
            >
              + 最初のセットを作成
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
