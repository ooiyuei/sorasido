'use client';

import { useEffect, useState } from 'react';
import type { Variety } from '@/types';

export default function VarietiesPage() {
  const [varieties, setVarieties] = useState<Variety[]>([]);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', expected_quantity: 0 });
  const [isAdding, setIsAdding] = useState(false);

  const load = () => fetch('/api/varieties').then(r => r.json()).then(setVarieties);
  useEffect(() => { load(); }, []);

  const handleSave = async () => {
    if (!form.name.trim()) return;
    if (editId) {
      await fetch(`/api/varieties/${editId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    } else {
      await fetch('/api/varieties', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    }
    setEditId(null);
    setIsAdding(false);
    setForm({ name: '', expected_quantity: 0 });
    load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('この品種を削除しますか？')) return;
    await fetch(`/api/varieties/${id}`, { method: 'DELETE' });
    load();
  };

  const startEdit = (v: Variety) => { setEditId(v.id); setForm({ name: v.name, expected_quantity: v.expected_quantity }); setIsAdding(false); };
  const startAdd = () => { setIsAdding(true); setEditId(null); setForm({ name: '', expected_quantity: 0 }); };
  const cancel = () => { setEditId(null); setIsAdding(false); setForm({ name: '', expected_quantity: 0 }); };

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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input className="border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent" placeholder="品種名" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} autoFocus />
            <input className="border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent" type="number" placeholder="想定出荷数" value={form.expected_quantity || ''} onChange={e => setForm(f => ({ ...f, expected_quantity: parseInt(e.target.value) || 0 }))} />
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
              <th className="text-right px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wide">想定出荷数</th>
              <th className="text-right px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wide">予約確保数</th>
              <th className="text-right px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wide">残数</th>
              <th className="text-right px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wide">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {varieties.map(v => {
              const remaining = v.expected_quantity - v.reserved_quantity;
              const isEditing = editId === v.id;
              return (
                <tr key={v.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-4 py-3">
                    {isEditing ? (
                      <input className="border border-gray-300 rounded px-2 py-1.5 text-sm w-full focus:outline-none focus:ring-2 focus:ring-violet-500" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
                    ) : (
                      <span className="font-semibold text-gray-900">{v.name}</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right text-gray-700">
                    {isEditing ? (
                      <input className="border border-gray-300 rounded px-2 py-1.5 text-sm w-20 text-right focus:outline-none focus:ring-2 focus:ring-violet-500" type="number" value={form.expected_quantity || ''} onChange={e => setForm(f => ({ ...f, expected_quantity: parseInt(e.target.value) || 0 }))} />
                    ) : v.expected_quantity}
                  </td>
                  <td className="px-4 py-3 text-right text-gray-500">{v.reserved_quantity}</td>
                  <td className={`px-4 py-3 text-right font-bold ${remaining <= 10 ? 'text-red-600' : 'text-emerald-600'}`}>
                    {remaining}
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
