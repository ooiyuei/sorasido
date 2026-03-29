'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api-client';
import type { Variety } from '@/types';

const defaultForm = { name: '', expected_quantity: 0, unit_price: 0, low_stock_threshold: 0 };

export default function VarietiesPage() {
  const [varieties, setVarieties] = useState<Variety[]>([]);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(defaultForm);
  const [isAdding, setIsAdding] = useState(false);

  const load = () => apiFetch('/api/varieties').then(r => r.json()).then(setVarieties);
  useEffect(() => { load(); }, []);

  const handleSave = async () => {
    if (!form.name.trim()) return;
    if (editId) {
      await apiFetch(`/api/varieties/${editId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    } else {
      await apiFetch('/api/varieties', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    }
    setEditId(null);
    setIsAdding(false);
    setForm(defaultForm);
    load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('この品種を削除しますか？')) return;
    await apiFetch(`/api/varieties/${id}`, { method: 'DELETE' });
    load();
  };

  const startEdit = (v: Variety) => {
    setEditId(v.id);
    setForm({ name: v.name, expected_quantity: v.expected_quantity, unit_price: v.unit_price, low_stock_threshold: v.low_stock_threshold });
    setIsAdding(false);
  };
  const startAdd = () => { setIsAdding(true); setEditId(null); setForm(defaultForm); };
  const cancel = () => { setEditId(null); setIsAdding(false); setForm(defaultForm); };

  const stockStatus = (v: Variety) => {
    const remaining = v.expected_quantity - v.reserved_quantity;
    if (remaining <= v.low_stock_threshold) return { label: '残少', dotColor: 'bg-red-500', textColor: 'text-red-600' };
    if (remaining > v.expected_quantity * 0.3) return { label: '余裕', dotColor: 'bg-emerald-500', textColor: 'text-emerald-600' };
    return { label: '適正', dotColor: 'bg-amber-500', textColor: 'text-amber-600' };
  };

  const inputClass = 'border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent';
  const inlineInputClass = 'border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent';

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">品種管理</h1>
        <button onClick={startAdd} className="bg-violet-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-violet-700 transition-colors">
          + 品種追加
        </button>
      </div>

      {isAdding && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 space-y-3">
          <h3 className="text-sm font-semibold text-gray-800">新規品種</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <input className={inputClass} placeholder="品種名" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} autoFocus />
            <input className={inputClass} type="number" placeholder="想定出荷数" value={form.expected_quantity || ''} onChange={e => setForm(f => ({ ...f, expected_quantity: parseInt(e.target.value) || 0 }))} />
            <input className={inputClass} type="number" placeholder="単価 (¥)" value={form.unit_price || ''} onChange={e => setForm(f => ({ ...f, unit_price: parseInt(e.target.value) || 0 }))} />
            <input className={inputClass} type="number" placeholder="残少しきい値" value={form.low_stock_threshold || ''} onChange={e => setForm(f => ({ ...f, low_stock_threshold: parseInt(e.target.value) || 0 }))} />
          </div>
          <div className="flex gap-2">
            <button onClick={handleSave} className="bg-violet-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-violet-700 transition-colors">保存</button>
            <button onClick={cancel} className="text-gray-500 px-4 py-2 text-sm hover:text-gray-700">キャンセル</button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50/80 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wide">品種名</th>
              <th className="text-right px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wide">単価(¥)</th>
              <th className="text-right px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wide">出荷数</th>
              <th className="text-right px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wide">確保数</th>
              <th className="text-right px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wide">残数</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wide">在庫状態</th>
              <th className="text-right px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wide">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {varieties.map(v => {
              const remaining = v.expected_quantity - v.reserved_quantity;
              const isEditing = editId === v.id;
              const status = stockStatus(v);
              return (
                <tr key={v.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-4 py-3">
                    {isEditing ? (
                      <input className={`${inlineInputClass} w-full`} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
                    ) : (
                      <span className="font-semibold text-gray-900">{v.name}</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right text-gray-700">
                    {isEditing ? (
                      <input className={`${inlineInputClass} w-20 text-right`} type="number" value={form.unit_price || ''} onChange={e => setForm(f => ({ ...f, unit_price: parseInt(e.target.value) || 0 }))} />
                    ) : (
                      `¥${v.unit_price.toLocaleString()}`
                    )}
                  </td>
                  <td className="px-4 py-3 text-right text-gray-700">
                    {isEditing ? (
                      <input className={`${inlineInputClass} w-20 text-right`} type="number" value={form.expected_quantity || ''} onChange={e => setForm(f => ({ ...f, expected_quantity: parseInt(e.target.value) || 0 }))} />
                    ) : v.expected_quantity}
                  </td>
                  <td className="px-4 py-3 text-right text-gray-500">{v.reserved_quantity}</td>
                  <td className={`px-4 py-3 text-right font-bold ${remaining <= v.low_stock_threshold ? 'text-red-600' : 'text-emerald-600'}`}>
                    {remaining}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <span className={`inline-block w-2 h-2 rounded-full ${status.dotColor}`} />
                      <span className={`text-xs font-medium ${status.textColor}`}>{status.label}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {isEditing ? (
                      <div className="flex justify-end gap-2">
                        <button onClick={handleSave} className="text-violet-600 hover:underline text-xs font-medium">保存</button>
                        <button onClick={cancel} className="text-gray-400 hover:underline text-xs">取消</button>
                      </div>
                    ) : (
                      <div className="flex justify-end gap-3">
                        <button onClick={() => startEdit(v)} className="text-violet-600 hover:underline text-xs font-medium">編集</button>
                        <button onClick={() => handleDelete(v.id)} className="text-red-500 hover:underline text-xs">削除</button>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
