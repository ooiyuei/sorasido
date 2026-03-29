'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import StatusBadge from '@/components/StatusBadge';
import { apiFetch } from '@/lib/api-client';
import type { Reception, ReceptionStatus, DeliveryMethod, PaymentMethod, PaymentStatus, Variety, ProductSet } from '@/types';

const inputCls = "border border-gray-200 rounded-lg px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent w-full";

interface ItemForm {
  type: 'variety' | 'set';
  id: string;
  quantity: number;
  planned_quantity_text: string;
  unit_price_snapshot: number;
}

export default function ReceptionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [reception, setReception] = useState<Reception | null>(null);
  const [varieties, setVarieties] = useState<Variety[]>([]);
  const [sets, setSets] = useState<ProductSet[]>([]);
  const [saving, setSaving] = useState(false);

  const reload = () => apiFetch(`/api/receptions/${id}`).then(r => r.json()).then(setReception);

  useEffect(() => {
    reload();
    apiFetch('/api/varieties').then(r => r.json()).then(setVarieties);
    apiFetch('/api/sets').then(r => r.json()).then((s: ProductSet[]) => setSets(s.filter(x => x.is_active)));
  }, [id]);

  const update = async (data: Record<string, unknown>) => {
    setSaving(true);
    await apiFetch(`/api/receptions/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
    await reload();
    setSaving(false);
  };

  const handleArchive = async () => {
    if (!confirm('この受付をアーカイブしますか？')) return;
    await apiFetch(`/api/receptions/${id}`, { method: 'DELETE' });
    router.push('/receptions');
  };

  // --- Item editing ---
  const [editItems, setEditItems] = useState<ItemForm[] | null>(null);

  const startEditItems = () => {
    if (!reception) return;
    setEditItems((reception.items || []).map(i => ({
      type: i.set_id ? 'set' : 'variety',
      id: i.set_id || i.variety_id || '',
      quantity: i.quantity,
      planned_quantity_text: i.planned_quantity_text || '',
      unit_price_snapshot: i.unit_price_snapshot,
    })));
  };

  const cancelEditItems = () => setEditItems(null);

  const saveItems = async () => {
    if (!editItems) return;
    const items = editItems.map(i => ({
      variety_id: i.type === 'variety' ? i.id : null,
      set_id: i.type === 'set' ? i.id : null,
      quantity: i.quantity,
      planned_quantity_text: i.planned_quantity_text,
      unit_price_snapshot: i.unit_price_snapshot,
    }));
    await update({ items });
    setEditItems(null);
  };

  const addVarietyItem = () => {
    if (!varieties.length) return;
    const v = varieties[0];
    setEditItems(prev => [...(prev || []), { type: 'variety', id: v.id, quantity: 1, planned_quantity_text: '', unit_price_snapshot: v.unit_price }]);
  };

  const addSetItem = () => {
    if (!sets.length) return;
    const s = sets[0];
    setEditItems(prev => [...(prev || []), { type: 'set', id: s.id, quantity: 1, planned_quantity_text: '', unit_price_snapshot: s.price }]);
  };

  const updateEditItem = (idx: number, updates: Partial<ItemForm>) => {
    setEditItems(prev => (prev || []).map((item, i) => {
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

  const removeEditItem = (idx: number) => setEditItems(prev => (prev || []).filter((_, i) => i !== idx));

  const editSubtotal = editItems ? editItems.reduce((sum, i) => sum + i.quantity * i.unit_price_snapshot, 0) : 0;

  const buildGoogleCalendarUrl = (r: Reception) => {
    const title = encodeURIComponent(`受渡し: ${r.customer_name_snapshot}`);
    const date = (r.desired_date || '').replace(/-/g, '');
    const location = encodeURIComponent(r.customer_address_snapshot || '');
    const itemNames = (r.items || []).map(i => i.set?.name || i.variety?.name || '-').join(', ');
    const details = encodeURIComponent(
      `商品: ${itemNames}\n内容: ${r.items_note || '-'}\n電話: ${r.customer_phone_snapshot || '-'}\n支払: ${r.payment_method} (${r.payment_status})\n配達方法: ${r.delivery_method}\n合計: ¥${r.total.toLocaleString()}`
    );
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${date}/${date}&location=${location}&details=${details}`;
  };

  if (!reception) return <div className="text-center py-12 text-gray-400 text-sm">読み込み中...</div>;

  return (
    <div className="space-y-5 max-w-2xl">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">受付詳細</h1>
        <div className="flex items-center gap-2">
          {saving && <span className="text-xs text-violet-500">保存中...</span>}
          <button onClick={() => router.back()} className="text-xs text-gray-500 hover:text-gray-700">← 戻る</button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm divide-y divide-gray-100">
        {/* Status + controls */}
        <div className="p-4 space-y-3">
          <div className="flex items-center gap-1.5 flex-wrap">
            <StatusBadge status={reception.status} />
            <StatusBadge status={reception.delivery_method} />
            <StatusBadge status={reception.payment_method} />
            <StatusBadge status={reception.payment_status} />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <div>
              <p className="text-[11px] text-gray-400 mb-1">ステータス</p>
              <select className={inputCls} value={reception.status} onChange={e => update({ status: e.target.value })}>
                <option value="相談中">相談中</option>
                <option value="受付済み">受付済み</option>
                <option value="会計待ち">会計待ち</option>
                <option value="完了">完了</option>
                <option value="キャンセル">キャンセル</option>
              </select>
            </div>
            <div>
              <p className="text-[11px] text-gray-400 mb-1">配達方法</p>
              <select className={inputCls} value={reception.delivery_method} onChange={e => update({ delivery_method: e.target.value })}>
                <option value="配達">配達</option>
                <option value="配送">配送</option>
                <option value="店頭受取">店頭受取</option>
              </select>
            </div>
            <div>
              <p className="text-[11px] text-gray-400 mb-1">支払方法</p>
              <select className={inputCls} value={reception.payment_method} onChange={e => update({ payment_method: e.target.value })}>
                <option value="現金">現金</option>
                <option value="PayPay">PayPay</option>
                <option value="振込">振込</option>
                <option value="未定">未定</option>
              </select>
            </div>
            <div>
              <p className="text-[11px] text-gray-400 mb-1">支払状況</p>
              <button
                onClick={() => update({ payment_status: reception.payment_status === '未払い' ? '支払済' : '未払い' })}
                className={`w-full text-xs px-2.5 py-2 rounded-lg border font-medium transition-colors ${
                  reception.payment_status === '支払済'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                    : 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100'
                }`}
              >
                {reception.payment_status === '支払済' ? '支払済' : '未払い → 支払済'}
              </button>
            </div>
          </div>
        </div>

        {/* Sub-checks: date_confirmed, weighed, delivered */}
        <div className="p-4">
          <p className="text-[11px] text-gray-400 uppercase tracking-wide mb-2">進捗チェック</p>
          <div className="flex items-center gap-4 flex-wrap">
            <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
              <input
                type="checkbox"
                className="rounded border-gray-300 text-violet-600 focus:ring-violet-500"
                checked={reception.date_confirmed}
                onChange={e => update({ date_confirmed: e.target.checked })}
              />
              日程確定
            </label>
            <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
              <input
                type="checkbox"
                className="rounded border-gray-300 text-violet-600 focus:ring-violet-500"
                checked={reception.weighed}
                onChange={e => update({ weighed: e.target.checked })}
              />
              計量済み
            </label>
            <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
              <input
                type="checkbox"
                className="rounded border-gray-300 text-violet-600 focus:ring-violet-500"
                checked={reception.delivered}
                onChange={e => update({ delivered: e.target.checked })}
              />
              配達済み
            </label>
          </div>
        </div>

        {/* Customer info */}
        <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <p className="text-[11px] text-gray-400 uppercase tracking-wide">名前</p>
            <Link href={`/customers/${reception.customer_id}`} className="font-semibold text-gray-900 text-lg mt-0.5 hover:text-violet-700 transition-colors">
              {reception.customer_name_snapshot}
            </Link>
          </div>
          <div>
            <p className="text-[11px] text-gray-400 uppercase tracking-wide">電話番号</p>
            <p className="font-medium text-gray-700 mt-0.5">{reception.customer_phone_snapshot || '-'}</p>
          </div>
          <div className="sm:col-span-2">
            <p className="text-[11px] text-gray-400 uppercase tracking-wide">住所</p>
            {reception.customer_address_snapshot ? (
              <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(reception.customer_address_snapshot)}`} target="_blank" rel="noopener noreferrer" className="text-violet-600 hover:underline text-sm">
                  {reception.customer_address_snapshot}
                </a>
                <a href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(reception.customer_address_snapshot)}`} target="_blank" rel="noopener noreferrer" className="text-xs px-2 py-1 rounded-md bg-blue-50 text-blue-700 border border-blue-200 font-medium hover:bg-blue-100 transition-colors">
                  ルート案内
                </a>
              </div>
            ) : <p className="text-gray-400 text-sm mt-0.5">-</p>}
          </div>
        </div>

        {/* Delivery info */}
        <div className="p-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div>
            <p className="text-[11px] text-gray-400 mb-1">希望日</p>
            <input type="date" className={inputCls} value={reception.desired_date || ''} onChange={e => update({ desired_date: e.target.value })} />
          </div>
          <div>
            <p className="text-[11px] text-gray-400 mb-1">希望時間</p>
            <select className={inputCls} value={reception.desired_time || ''} onChange={e => update({ desired_time: e.target.value })}>
              <option value="">指定なし</option>
              <option value="午前">午前</option>
              <option value="午後">午後</option>
              <option value="9:00-17:00">9:00-17:00</option>
            </select>
          </div>
          <div>
            <p className="text-[11px] text-gray-400 mb-1">箱</p>
            <button
              onClick={() => update({ has_box: !reception.has_box })}
              className={`w-full text-xs px-2.5 py-2 rounded-lg border font-medium transition-colors ${
                reception.has_box
                  ? 'bg-violet-50 text-violet-700 border-violet-200 hover:bg-violet-100'
                  : 'bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100'
              }`}
            >
              {reception.has_box ? '箱あり' : '箱なし'}
            </button>
          </div>
          <div>
            <p className="text-[11px] text-gray-400 mb-1">箱数</p>
            <input
              type="number"
              min={0}
              className={inputCls}
              value={reception.box_count || 0}
              onBlur={e => { const v = parseInt(e.target.value) || 0; if (v !== reception.box_count) update({ box_count: v }); }}
              onChange={e => setReception(prev => prev ? { ...prev, box_count: parseInt(e.target.value) || 0 } : prev)}
            />
          </div>
        </div>

        {/* Items note - editable */}
        <div className="p-4">
          <p className="text-[11px] text-gray-400 uppercase tracking-wide mb-1">内容メモ</p>
          <textarea
            className={`${inputCls} min-h-[50px]`}
            placeholder="相談内容、希望商品のメモなど"
            value={reception.items_note || ''}
            onBlur={e => { if (e.target.value !== reception.items_note) update({ items_note: e.target.value }); }}
            onChange={e => setReception(prev => prev ? { ...prev, items_note: e.target.value } : prev)}
          />
        </div>

        {/* Items - editable */}
        <div className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">商品明細</h3>
            {editItems === null ? (
              <button onClick={startEditItems} className="text-xs text-violet-600 hover:underline font-medium">編集</button>
            ) : (
              <div className="flex gap-2">
                <button onClick={saveItems} className="text-xs bg-violet-600 text-white px-3 py-1 rounded-lg font-medium hover:bg-violet-700 transition-colors">保存</button>
                <button onClick={cancelEditItems} className="text-xs text-gray-500 hover:text-gray-700">キャンセル</button>
              </div>
            )}
          </div>

          {editItems === null ? (
            /* Read-only view */
            <>
              {reception.items && reception.items.length > 0 ? (
                <div className="space-y-2">
                  {reception.items.map(item => (
                    <div key={item.id} className="flex items-center justify-between gap-2 py-1.5 border-b border-gray-50 last:border-0">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <span className={`text-[11px] px-2 py-0.5 rounded-md border font-medium shrink-0 ${item.set_id ? 'bg-violet-50 text-violet-700 border-violet-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'}`}>
                          {item.set_id ? 'セット' : '単品'}
                        </span>
                        <span className="text-sm text-gray-800 truncate">{item.set?.name || item.variety?.name || '-'}</span>
                        {item.planned_quantity_text && <span className="text-xs text-gray-400">({item.planned_quantity_text})</span>}
                      </div>
                      <div className="flex items-center gap-3 shrink-0 text-sm">
                        <span className="text-gray-500">x{item.quantity}</span>
                        <span className="text-gray-500">@¥{item.unit_price_snapshot.toLocaleString()}</span>
                        <span className="font-semibold text-gray-900 w-20 text-right">¥{item.line_total.toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-400">商品なし -- 「編集」で追加できます</p>
              )}
            </>
          ) : (
            /* Edit mode */
            <div className="space-y-2">
              {editItems.map((item, idx) => (
                <div key={idx} className="flex items-center gap-2 flex-wrap">
                  <span className={`text-[11px] px-2 py-0.5 rounded-md border font-medium shrink-0 ${item.type === 'set' ? 'bg-violet-50 text-violet-700 border-violet-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'}`}>
                    {item.type === 'set' ? 'セット' : '単品'}
                  </span>
                  <select className="border border-gray-200 rounded-lg px-2 py-1.5 text-sm flex-1 min-w-[100px] focus:outline-none focus:ring-2 focus:ring-violet-500" value={item.id} onChange={e => updateEditItem(idx, { id: e.target.value })}>
                    {item.type === 'variety'
                      ? varieties.map(v => <option key={v.id} value={v.id}>{v.name} (¥{v.unit_price.toLocaleString()})</option>)
                      : sets.map(s => <option key={s.id} value={s.id}>{s.name} (¥{s.price.toLocaleString()})</option>)
                    }
                  </select>
                  <input className="border border-gray-200 rounded-lg px-2 py-1.5 text-sm w-14 text-center focus:outline-none focus:ring-2 focus:ring-violet-500" type="number" min={1} value={item.quantity} onChange={e => updateEditItem(idx, { quantity: parseInt(e.target.value) || 1 })} />
                  <input className="border border-gray-200 rounded-lg px-2 py-1.5 text-sm w-24 focus:outline-none focus:ring-2 focus:ring-violet-500" placeholder="数量メモ" value={item.planned_quantity_text} onChange={e => updateEditItem(idx, { planned_quantity_text: e.target.value })} />
                  <input className="border border-gray-200 rounded-lg px-2 py-1.5 text-sm w-24 text-right focus:outline-none focus:ring-2 focus:ring-violet-500" type="number" value={item.unit_price_snapshot || ''} onChange={e => updateEditItem(idx, { unit_price_snapshot: parseInt(e.target.value) || 0 })} />
                  <span className="text-xs text-gray-400">円</span>
                  <span className="text-xs text-gray-600 w-16 text-right">¥{(item.quantity * item.unit_price_snapshot).toLocaleString()}</span>
                  <button onClick={() => removeEditItem(idx)} className="text-red-400 hover:text-red-600 text-sm">✕</button>
                </div>
              ))}
              <div className="flex gap-3 pt-1">
                <button onClick={addVarietyItem} className="text-sm text-violet-600 hover:underline font-medium">+ 単品追加</button>
                <button onClick={addSetItem} className="text-sm text-violet-600 hover:underline font-medium">+ セット追加</button>
              </div>
              {editItems.length > 0 && (
                <div className="text-right text-sm text-gray-500 pt-1 border-t border-gray-100">
                  小計: <span className="font-semibold text-gray-900">¥{editSubtotal.toLocaleString()}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Total */}
        <div className="p-4 bg-gray-50/50 space-y-1.5">
          <div className="flex justify-between text-sm text-gray-600"><span>小計</span><span>¥{reception.subtotal.toLocaleString()}</span></div>
          {reception.shipping_fee > 0 && <div className="flex justify-between text-sm text-gray-400"><span>送料</span><span>¥{reception.shipping_fee.toLocaleString()}</span></div>}
          {reception.discount > 0 && <div className="flex justify-between text-sm text-gray-400"><span>値引き</span><span>-¥{reception.discount.toLocaleString()}</span></div>}
          <div className="flex justify-between text-xl font-bold text-gray-900 pt-2 border-t border-gray-200"><span>合計</span><span>¥{reception.total.toLocaleString()}</span></div>
        </div>

        {/* Packing note - editable */}
        <div className="p-4">
          <p className="text-[11px] text-gray-400 uppercase tracking-wide mb-1">組分けメモ</p>
          <input
            className={inputCls}
            placeholder="組分け内容メモ"
            value={reception.packing_note || ''}
            onBlur={e => { if (e.target.value !== reception.packing_note) update({ packing_note: e.target.value }); }}
            onChange={e => setReception(prev => prev ? { ...prev, packing_note: e.target.value } : prev)}
          />
        </div>

        {/* Memo - editable */}
        <div className="p-4">
          <p className="text-[11px] text-gray-400 uppercase tracking-wide mb-1">メモ</p>
          <textarea
            className={`${inputCls} min-h-[50px]`}
            placeholder="メモ"
            value={reception.memo || ''}
            onBlur={e => { if (e.target.value !== reception.memo) update({ memo: e.target.value }); }}
            onChange={e => setReception(prev => prev ? { ...prev, memo: e.target.value } : prev)}
          />
        </div>

        {/* Actions */}
        <div className="p-4 flex items-center justify-between flex-wrap gap-2">
          <a
            href={buildGoogleCalendarUrl(reception)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm px-4 py-2 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium hover:bg-emerald-100 transition-colors"
          >
            Googleカレンダーに追加
          </a>
          <button onClick={handleArchive} className="text-xs text-red-500 hover:text-red-700 font-medium px-3 py-1.5 rounded-lg border border-red-200 hover:bg-red-50 transition-colors">アーカイブ</button>
        </div>
      </div>
    </div>
  );
}
