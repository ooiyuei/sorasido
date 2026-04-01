'use client';

import { useEffect, useState, useCallback } from 'react';
import StatusBadge from '@/components/StatusBadge';
import { apiFetch } from '@/lib/api-client';
import type { Reception, ReceptionItem, PaymentMethod } from '@/types';

const inputCls = 'border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent w-full';

interface ItemForm {
  id: string;
  label: string;
  planned_quantity_text: string;
  actual_weight_g: number | null;
  price_per_100g: number;
  unit_price_snapshot: number;
  line_total: number;
  is_set: boolean;
}

export default function AccountingPage() {
  const [receptions, setReceptions] = useState<Reception[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [items, setItems] = useState<ItemForm[]>([]);
  const [boxFee, setBoxFee] = useState(0);
  const [shippingFee, setShippingFee] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('現金');
  const [settling, setSettling] = useState(false);

  const today = new Date().toISOString().split('T')[0];

  const loadReceptions = useCallback(() => {
    apiFetch('/api/receptions').then(r => r.json()).then(setReceptions);
  }, []);

  useEffect(() => { loadReceptions(); }, [loadReceptions]);

  // Filter: 会計待ち, or desired_date=today with 受付済み
  const todayQueue = receptions.filter(r =>
    r.status !== 'キャンセル' && r.status !== '完了' && r.status !== '相談中' && !r.is_archived &&
    (r.status === '会計待ち' || (r.status === '受付済み' && r.desired_date === today))
  );

  const selected = receptions.find(r => r.id === selectedId) || null;

  // When selecting a reception, initialize item forms
  const handleSelect = (r: Reception) => {
    setSelectedId(r.id);
    setBoxFee(r.box_count > 0 ? (r.items?.[0]?.variety?.box_fee || 0) * r.box_count : 0);
    setShippingFee(r.shipping_fee || 0);
    setDiscount(r.discount || 0);
    setPaymentMethod(r.payment_method === '未定' ? '現金' : r.payment_method);

    const formItems: ItemForm[] = (r.items || []).map((item: ReceptionItem) => {
      const isSet = !!item.set_id;
      const price100g = item.variety?.price_per_100g || 0;
      return {
        id: item.id,
        label: isSet ? (item.set?.name || 'セット') : (item.variety?.name || '品種不明'),
        planned_quantity_text: item.planned_quantity_text || '',
        actual_weight_g: item.actual_weight_g,
        price_per_100g: price100g,
        unit_price_snapshot: item.unit_price_snapshot,
        line_total: item.line_total || (isSet ? item.unit_price_snapshot : 0),
        is_set: isSet,
      };
    });
    setItems(formItems);
  };

  const updateItemWeight = (idx: number, weight: number | null) => {
    setItems(prev => prev.map((item, i) => {
      if (i !== idx) return item;
      const w = weight || 0;
      const lineTotal = item.is_set ? item.unit_price_snapshot : Math.round((w / 100) * item.price_per_100g);
      return { ...item, actual_weight_g: weight, line_total: lineTotal };
    }));
  };

  const subtotal = items.reduce((sum, it) => sum + it.line_total, 0);
  const grandTotal = subtotal + boxFee + shippingFee - discount;
  const stripePaymentLink = process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK;

  const handleSettle = async () => {
    if (!selectedId) return;
    if (!confirm('会計を確定しますか？')) return;
    setSettling(true);
    try {
      const body = {
        items: items.map(it => ({
          id: it.id,
          actual_weight_g: it.actual_weight_g,
          line_total: it.line_total,
        })),
        box_fee: boxFee,
        shipping_fee: shippingFee,
        discount,
        subtotal,
        total: grandTotal,
        payment_method: paymentMethod,
      };
      const res = await apiFetch(`/api/receptions/${selectedId}/settle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        setSelectedId(null);
        setItems([]);
        loadReceptions();
      } else {
        alert('エラーが発生しました');
      }
    } finally {
      setSettling(false);
    }
  };

  return (
    <div className="space-y-5">
      <h1 className="text-xl font-bold text-gray-900">当日会計</h1>

      <div className="flex flex-col lg:flex-row gap-5">
        {/* Left: Queue */}
        <div className="lg:w-[40%] space-y-3">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="px-4 py-3 border-b border-gray-100">
              <h2 className="text-sm font-semibold text-gray-800">会計待ちリスト ({todayQueue.length}件)</h2>
            </div>
            <div className="p-2">
              {todayQueue.length === 0 ? (
                <p className="text-gray-400 text-sm text-center py-8">会計待ちはありません</p>
              ) : (
                <div className="space-y-1">
                  {todayQueue.map(r => (
                    <button
                      key={r.id}
                      onClick={() => handleSelect(r)}
                      className={`w-full text-left p-3 rounded-lg transition-colors ${
                        selectedId === r.id
                          ? 'bg-violet-50 border-2 border-violet-400'
                          : 'hover:bg-gray-50 border border-transparent'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-sm text-gray-900">{r.customer_name_snapshot}</span>
                        <div className="flex items-center gap-1">
                          <StatusBadge status={r.delivery_method} />
                          <StatusBadge status={r.status} />
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span>{r.desired_time || '時間未定'}</span>
                        {r.items_note && <span className="truncate">| {r.items_note}</span>}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right: Accounting form */}
        <div className="lg:w-[60%]">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm lg:sticky lg:top-4">
            {selected ? (
              <>
                <div className="px-4 py-3 border-b border-gray-100">
                  <h3 className="text-sm font-semibold text-gray-800">
                    会計: {selected.customer_name_snapshot}
                  </h3>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {selected.desired_date} {selected.desired_time || ''} / {selected.delivery_method}
                  </p>
                </div>

                {/* Items */}
                <div className="p-4 space-y-3">
                  <table className="w-full text-sm">
                    <thead className="text-xs text-gray-500 border-b border-gray-200">
                      <tr>
                        <th className="text-left py-2 font-semibold">品目</th>
                        <th className="text-left py-2 font-semibold">予定</th>
                        <th className="text-right py-2 font-semibold w-28">実測 (g)</th>
                        <th className="text-right py-2 font-semibold w-24">単価</th>
                        <th className="text-right py-2 font-semibold w-28">小計</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {items.map((item, idx) => (
                        <tr key={item.id}>
                          <td className="py-2.5 font-medium text-gray-900">{item.label}</td>
                          <td className="py-2.5 text-gray-500">{item.planned_quantity_text || '-'}</td>
                          <td className="py-2.5 text-right">
                            {item.is_set ? (
                              <span className="text-gray-400 text-xs">セット</span>
                            ) : (
                              <input
                                type="number"
                                className="border border-gray-300 rounded-md px-2 py-1.5 text-sm text-right w-24 focus:outline-none focus:ring-2 focus:ring-violet-500"
                                value={item.actual_weight_g ?? ''}
                                onChange={e => updateItemWeight(idx, e.target.value ? Number(e.target.value) : null)}
                                placeholder="g"
                              />
                            )}
                          </td>
                          <td className="py-2.5 text-right text-gray-500">
                            {item.is_set
                              ? `¥${item.unit_price_snapshot.toLocaleString()}`
                              : `¥${item.price_per_100g.toLocaleString()}/100g`}
                          </td>
                          <td className="py-2.5 text-right font-semibold text-gray-900">
                            ¥{item.line_total.toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {/* Fees */}
                  <div className="border-t border-gray-200 pt-3 space-y-2">
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="text-xs text-gray-500 font-medium">箱代</label>
                        <input type="number" className={inputCls} value={boxFee} onChange={e => setBoxFee(Number(e.target.value))} />
                      </div>
                      <div>
                        <label className="text-xs text-gray-500 font-medium">送料</label>
                        <input type="number" className={inputCls} value={shippingFee} onChange={e => setShippingFee(Number(e.target.value))} />
                      </div>
                      <div>
                        <label className="text-xs text-gray-500 font-medium">値引き</label>
                        <input type="number" className={inputCls} value={discount} onChange={e => setDiscount(Number(e.target.value))} />
                      </div>
                    </div>

                    <div>
                      <label className="text-xs text-gray-500 font-medium">支払方法</label>
                      <select
                        className={inputCls}
                        value={paymentMethod}
                        onChange={e => setPaymentMethod(e.target.value as PaymentMethod)}
                      >
                        <option value="現金">現金</option>
                        <option value="PayPay">PayPay</option>
                        <option value="振込">振込</option>
                        <option value="未定">未定</option>
                      </select>
                    </div>
                  </div>

                  {/* Totals */}
                  <div className="border-t border-gray-200 pt-3 space-y-1.5">
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>商品小計</span>
                      <span>¥{subtotal.toLocaleString()}</span>
                    </div>
                    {boxFee > 0 && (
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>箱代</span>
                        <span>¥{boxFee.toLocaleString()}</span>
                      </div>
                    )}
                    {shippingFee > 0 && (
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>送料</span>
                        <span>¥{shippingFee.toLocaleString()}</span>
                      </div>
                    )}
                    {discount > 0 && (
                      <div className="flex justify-between text-sm text-red-500">
                        <span>値引き</span>
                        <span>-¥{discount.toLocaleString()}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-lg font-bold text-gray-900 pt-2 border-t border-gray-300">
                      <span>合計</span>
                      <span>¥{grandTotal.toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Settle button */}
                  <button
                    onClick={handleSettle}
                    disabled={settling}
                    className="w-full bg-emerald-600 text-white py-3 rounded-lg text-sm font-bold hover:bg-emerald-700 transition-colors disabled:opacity-50 mt-2"
                  >
                    {settling ? '処理中...' : '会計確定'}
                  </button>
                  {stripePaymentLink ? (
                    <a
                      href={`${stripePaymentLink}?amount=${grandTotal}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full block text-center bg-[#635bff] text-white py-3 rounded-lg text-sm font-bold hover:bg-[#4f46e5] transition-colors mt-2"
                    >
                      Stripe で決済リンクを送る (¥{grandTotal.toLocaleString()})
                    </a>
                  ) : (
                    <div className="w-full text-center border-2 border-dashed border-[#635bff]/40 rounded-lg py-3 mt-2">
                      <p className="text-xs text-[#635bff]/70 font-medium">Stripe 決済</p>
                      <p className="text-[10px] text-gray-400 mt-0.5">
                        NEXT_PUBLIC_STRIPE_PAYMENT_LINK を設定すると有効になります
                      </p>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="p-12 text-center">
                <p className="text-gray-400 text-sm">左のリストから受付を選択してください</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
