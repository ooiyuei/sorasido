'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Variety, ProductSet, DeliveryMethod, PaymentMethod, Staff } from '@/types';

interface OrderItemForm {
  type: 'variety' | 'set';
  id: string;
  quantity: number;
  unit_price_snapshot: number;
}

const inputCls = "border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent w-full";

export default function NewOrderPage() {
  const router = useRouter();
  const [varieties, setVarieties] = useState<Variety[]>([]);
  const [sets, setSets] = useState<ProductSet[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [form, setForm] = useState({
    customer_name: '', phone: '', address: '', has_box: false, packing_note: '',
    scheduled_date: '', scheduled_time: '',
    delivery_method: '配達' as DeliveryMethod, payment_method: '現金' as PaymentMethod, status: '確定' as const,
    assignee_id: '' as string, delivery_staff_id: '' as string,
  });
  const [items, setItems] = useState<OrderItemForm[]>([]);

  useEffect(() => {
    fetch('/api/varieties').then(r => r.json()).then(setVarieties);
    fetch('/api/sets').then(r => r.json()).then((s: ProductSet[]) => setSets(s.filter(x => x.is_active)));
    fetch('/api/staff').then(r => r.json()).then(setStaff);
  }, []);

  const getStaffDot = (color: string) => (
    <span className="inline-block w-2 h-2 rounded-full mr-1.5" style={{ backgroundColor: color }} />
  );

  const addVarietyItem = () => {
    if (varieties.length) {
      const v = varieties[0];
      setItems(p => [...p, { type: 'variety', id: v.id, quantity: 1, unit_price_snapshot: v.unit_price }]);
    }
  };
  const addSetItem = () => {
    if (sets.length) {
      setItems(p => [...p, { type: 'set', id: sets[0].id, quantity: 1, unit_price_snapshot: sets[0].price }]);
    }
  };

  const updateItem = (idx: number, updates: Partial<OrderItemForm>) => {
    setItems(prev => prev.map((item, i) => {
      if (i !== idx) return item;
      const updated = { ...item, ...updates };
      if (updates.id) {
        if (item.type === 'set') {
          const s = sets.find(s => s.id === updates.id);
          if (s) updated.unit_price_snapshot = s.price;
        } else {
          const v = varieties.find(v => v.id === updates.id);
          if (v) updated.unit_price_snapshot = v.unit_price;
        }
      }
      return updated;
    }));
  };
  const removeItem = (idx: number) => setItems(p => p.filter((_, i) => i !== idx));

  const subtotal = items.reduce((sum, i) => sum + i.quantity * i.unit_price_snapshot, 0);
  const shippingFee = form.delivery_method === '配送' ? 1500 : 0;
  const total = subtotal + shippingFee;

  const handleSubmit = async () => {
    if (!form.customer_name.trim()) { alert('名前を入力してください'); return; }
    if (items.length === 0) { alert('商品を追加してください'); return; }
    const body = {
      ...form,
      assignee_id: form.assignee_id || null,
      delivery_staff_id: form.delivery_staff_id || null,
      items: items.map(i => ({
        variety_id: i.type === 'variety' ? i.id : null,
        set_id: i.type === 'set' ? i.id : null,
        quantity: i.quantity,
        unit_price_snapshot: i.unit_price_snapshot,
      })),
    };
    const res = await fetch('/api/orders', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    if (res.ok) router.push('/orders');
  };

  const activeStaff = staff.filter(s => s.is_active);

  return (
    <div className="space-y-5 max-w-2xl">
      <h1 className="text-xl font-bold text-gray-900">新規注文</h1>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm divide-y divide-gray-100">
        {/* 顧客情報 */}
        <div className="p-4 space-y-3">
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wide">顧客情報</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input className={inputCls} placeholder="名前 *" value={form.customer_name} onChange={e => setForm(f => ({ ...f, customer_name: e.target.value }))} autoFocus />
            <input className={inputCls} placeholder="電話番号" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
            <input className={`${inputCls} sm:col-span-2`} placeholder="住所" value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} />
          </div>
        </div>

        {/* 配達情報 */}
        <div className="p-4 space-y-3">
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wide">配達情報</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-[11px] text-gray-500 mb-1 block">配達方法</label>
              <select className={inputCls} value={form.delivery_method} onChange={e => setForm(f => ({ ...f, delivery_method: e.target.value as DeliveryMethod }))}>
                <option value="配達">配達</option>
                <option value="配送">配送（送料¥1,500）</option>
                <option value="店頭受取">店頭受取</option>
              </select>
            </div>
            <div>
              <label className="text-[11px] text-gray-500 mb-1 block">日程</label>
              <input className={inputCls} type="date" value={form.scheduled_date} onChange={e => setForm(f => ({ ...f, scheduled_date: e.target.value }))} />
            </div>
            <div>
              <label className="text-[11px] text-gray-500 mb-1 block">時間</label>
              <input className={inputCls} placeholder="午前 / 10:00 など" value={form.scheduled_time} onChange={e => setForm(f => ({ ...f, scheduled_time: e.target.value }))} />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] text-gray-500 mb-1 block">担当者</label>
              <select className={inputCls} value={form.assignee_id} onChange={e => setForm(f => ({ ...f, assignee_id: e.target.value }))}>
                <option value="">未選択</option>
                {activeStaff.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
              {form.assignee_id && (() => {
                const s = staff.find(s => s.id === form.assignee_id);
                return s ? <span className="text-[11px] text-gray-400 mt-1 flex items-center">{getStaffDot(s.color)}{s.name}</span> : null;
              })()}
            </div>
            <div>
              <label className="text-[11px] text-gray-500 mb-1 block">配達担当</label>
              <select className={inputCls} value={form.delivery_staff_id} onChange={e => setForm(f => ({ ...f, delivery_staff_id: e.target.value }))}>
                <option value="">未選択</option>
                {activeStaff.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
              {form.delivery_staff_id && (() => {
                const s = staff.find(s => s.id === form.delivery_staff_id);
                return s ? <span className="text-[11px] text-gray-400 mt-1 flex items-center">{getStaffDot(s.color)}{s.name}</span> : null;
              })()}
            </div>
          </div>
        </div>

        {/* 商品明細 */}
        <div className="p-4 space-y-3">
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wide">商品明細</h2>
          {items.map((item, idx) => (
            <div key={idx} className="flex items-center gap-2 flex-wrap">
              <span className={`text-[11px] px-2 py-0.5 rounded-md border font-medium ${item.type === 'set' ? 'bg-violet-50 text-violet-700 border-violet-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'}`}>
                {item.type === 'set' ? 'セット' : '単品'}
              </span>
              <select className="border border-gray-300 rounded-lg px-2 py-1.5 text-sm flex-1 min-w-[120px] focus:outline-none focus:ring-2 focus:ring-violet-500" value={item.id} onChange={e => updateItem(idx, { id: e.target.value })}>
                {item.type === 'variety'
                  ? varieties.map(v => <option key={v.id} value={v.id}>{v.name} (¥{v.unit_price.toLocaleString()})</option>)
                  : sets.map(s => <option key={s.id} value={s.id}>{s.name} (¥{s.price.toLocaleString()})</option>)
                }
              </select>
              <input className="border border-gray-300 rounded px-2 py-1.5 text-sm w-14 text-center focus:outline-none focus:ring-2 focus:ring-violet-500" type="number" min={1} value={item.quantity} onChange={e => updateItem(idx, { quantity: parseInt(e.target.value) || 1 })} />
              <input className="border border-gray-300 rounded px-2 py-1.5 text-sm w-24 text-right focus:outline-none focus:ring-2 focus:ring-violet-500" type="number" placeholder="単価" value={item.unit_price_snapshot || ''} onChange={e => updateItem(idx, { unit_price_snapshot: parseInt(e.target.value) || 0 })} />
              <span className="text-xs text-gray-400">円</span>
              <button onClick={() => removeItem(idx)} className="text-red-400 hover:text-red-600 text-sm">✕</button>
            </div>
          ))}
          <div className="flex gap-3 mt-2">
            <button onClick={addVarietyItem} className="text-sm text-violet-600 hover:underline font-medium">+ 単品追加</button>
            <button onClick={addSetItem} className="text-sm text-violet-600 hover:underline font-medium">+ セット追加</button>
          </div>
        </div>

        {/* オプション */}
        <div className="p-4 space-y-3">
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wide">オプション</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input type="checkbox" className="rounded border-gray-300 text-violet-600 focus:ring-violet-500" checked={form.has_box} onChange={e => setForm(f => ({ ...f, has_box: e.target.checked }))} />
              箱あり
            </label>
            <div>
              <label className="text-[11px] text-gray-500 mb-1 block">支払方法</label>
              <select className={inputCls} value={form.payment_method} onChange={e => setForm(f => ({ ...f, payment_method: e.target.value as PaymentMethod }))}>
                <option value="現金">現金</option>
                <option value="PayPay">PayPay</option>
                <option value="未収">未収</option>
              </select>
            </div>
          </div>
          <input className={inputCls} placeholder="組分け内容メモ" value={form.packing_note} onChange={e => setForm(f => ({ ...f, packing_note: e.target.value }))} />
        </div>

        {/* 合計 */}
        <div className="p-4 space-y-2 bg-gray-50/50">
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wide">合計</h2>
          <div className="flex justify-between text-sm text-gray-600">
            <span>小計</span><span>¥{subtotal.toLocaleString()}</span>
          </div>
          {shippingFee > 0 && (
            <div className="flex justify-between text-sm text-gray-400">
              <span>送料</span><span>¥{shippingFee.toLocaleString()}</span>
            </div>
          )}
          <div className="flex justify-between text-lg font-bold text-gray-900 pt-2 border-t border-gray-200">
            <span>合計</span><span>¥{total.toLocaleString()}</span>
          </div>
        </div>

        {/* 送信 */}
        <div className="p-4 flex gap-3">
          <button onClick={handleSubmit} className="bg-violet-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-violet-700 transition-colors">注文を登録</button>
          <button onClick={() => router.back()} className="text-gray-500 px-4 py-2.5 hover:text-gray-700 text-sm">キャンセル</button>
        </div>
      </div>
    </div>
  );
}
