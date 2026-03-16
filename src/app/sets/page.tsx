'use client';

import { useEffect, useState } from 'react';
import type { ProductSet, Variety } from '@/types';

export default function SetsPage() {
  const [sets, setSets] = useState<ProductSet[]>([]);
  const [varieties, setVarieties] = useState<Variety[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', price: 0, is_active: true, items: [] as { variety_id: string; quantity: number }[] });

  const load = () => {
    fetch('/api/sets').then(r => r.json()).then(setSets);
    fetch('/api/varieties').then(r => r.json()).then(setVarieties);
  };
  useEffect(() => { load(); }, []);

  const handleSave = async () => {
    if (!form.name.trim()) return;
    if (editId) {
      await fetch(`/api/sets/${editId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    } else {
      await fetch('/api/sets', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    }
    setEditId(null); setIsAdding(false); setForm({ name: '', price: 0, is_active: true, items: [] }); load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('このセットを削除しますか？')) return;
    await fetch(`/api/sets/${id}`, { method: 'DELETE' }); load();
  };

  const handleToggle = async (s: ProductSet) => {
    await fetch(`/api/sets/${s.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ is_active: !s.is_active }) }); load();
  };

  const startEdit = (s: ProductSet) => {
    setEditId(s.id); setIsAdding(false);
    setForm({ name: s.name, price: s.price, is_active: s.is_active, items: (s.items || []).map(si => ({ variety_id: si.variety_id, quantity: si.quantity })) });
  };
  const startAdd = () => { setIsAdding(true); setEditId(null); setForm({ name: '', price: 0, is_active: true, items: [{ variety_id: varieties[0]?.id || '', quantity: 1 }] }); };
  const cancel = () => { setEditId(null); setIsAdding(false); setForm({ name: '', price: 0, is_active: true, items: [] }); };

  const addItem = () => setForm(f => ({ ...f, items: [...f.items, { variety_id: varieties[0]?.id || '', quantity: 1 }] }));
  const removeItem = (idx: number) => setForm(f => ({ ...f, items: f.items.filter((_, i) => i !== idx) }));
  const updateItem = (idx: number, field: string, value: string | number) => {
    setForm(f => ({ ...f, items: f.items.map((item, i) => i === idx ? { ...item, [field]: value } : item) }));
  };

  const renderForm = () => (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 space-y-4">
      <h3 className="text-sm font-semibold text-gray-800">{editId ? 'セット編集' : '新規セット'}</h3>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <input className="border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent" placeholder="セット名" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} autoFocus />
        <input className="border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent" type="number" placeholder="価格" value={form.price || ''} onChange={e => setForm(f => ({ ...f, price: parseInt(e.target.value) || 0 }))} />
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
            <button onClick={() => removeItem(idx)} className="text-red-400 hover:text-red-600 text-sm">✕</button>
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
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">セット商品管理</h1>
        <button onClick={startAdd} className="bg-violet-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-violet-700 transition-colors">+ セット追加</button>
      </div>

      {(isAdding || editId) && renderForm()}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sets.map(s => (
          <div key={s.id} className={`bg-white rounded-xl border border-gray-200 shadow-sm p-5 transition-opacity ${!s.is_active ? 'opacity-50' : ''}`}>
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-semibold text-gray-900">{s.name}</h3>
                <p className="text-2xl font-bold text-violet-700 mt-1">¥{s.price.toLocaleString()}</p>
              </div>
              <span className={`text-[11px] px-2 py-0.5 rounded-md border font-medium ${s.is_active ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-gray-50 text-gray-400 border-gray-200'}`}>
                {s.is_active ? '有効' : '無効'}
              </span>
            </div>
            <div className="space-y-1.5 mb-4">
              <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">構成品種</p>
              {(s.items || []).map(si => (
                <div key={si.id} className="flex items-center gap-2 text-sm text-gray-700">
                  <span className="w-1.5 h-1.5 rounded-full bg-violet-400" />
                  <span>{si.variety?.name || '不明'}</span>
                  <span className="text-gray-400">× {si.quantity}</span>
                </div>
              ))}
            </div>
            <div className="flex gap-3 border-t border-gray-100 pt-3">
              <button onClick={() => handleToggle(s)} className="text-xs text-gray-500 hover:text-gray-700 font-medium">{s.is_active ? '無効にする' : '有効にする'}</button>
              <button onClick={() => startEdit(s)} className="text-xs text-violet-600 hover:underline font-medium">編集</button>
              <button onClick={() => handleDelete(s.id)} className="text-xs text-red-500 hover:underline">削除</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
