'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import StatusBadge from '@/components/StatusBadge';
import type { Reception, ReceptionStatus, PaymentStatus } from '@/types';

export default function ReceptionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [reception, setReception] = useState<Reception | null>(null);

  useEffect(() => {
    fetch(`/api/receptions/${id}`).then(r => r.json()).then(setReception);
  }, [id]);

  const handleStatusChange = async (status: ReceptionStatus) => {
    await fetch(`/api/receptions/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) });
    fetch(`/api/receptions/${id}`).then(r => r.json()).then(setReception);
  };

  const handlePaymentStatusToggle = async () => {
    if (!reception) return;
    const next: PaymentStatus = reception.payment_status === '未払い' ? '支払済' : '未払い';
    await fetch(`/api/receptions/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ payment_status: next }) });
    fetch(`/api/receptions/${id}`).then(r => r.json()).then(setReception);
  };

  const handleFieldUpdate = async (field: string, value: string) => {
    await fetch(`/api/receptions/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ [field]: value }) });
    fetch(`/api/receptions/${id}`).then(r => r.json()).then(setReception);
  };

  const handleDelete = async () => {
    if (!confirm('この受付を削除しますか？')) return;
    await fetch(`/api/receptions/${id}`, { method: 'DELETE' });
    router.push('/receptions');
  };

  const buildGoogleCalendarUrl = (r: Reception) => {
    const title = encodeURIComponent(`受渡し: ${r.customer_name}`);
    const date = (r.desired_date || '').replace(/-/g, '');
    const startDate = date;
    const endDate = date;
    const location = encodeURIComponent(r.address || '');
    const itemNames = (r.items || []).map(i => i.set?.name || i.variety?.name || '-').join(', ');
    const details = encodeURIComponent(
      `商品: ${itemNames}\n内容: ${r.items_note || '-'}\n電話: ${r.phone || '-'}\n支払: ${r.payment_method} (${r.payment_status})\n配達方法: ${r.delivery_method}\n合計: ¥${r.total.toLocaleString()}`
    );
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startDate}/${endDate}&location=${location}&details=${details}`;
  };

  if (!reception) return <div className="text-center py-12 text-gray-400 text-sm">読み込み中...</div>;

  return (
    <div className="space-y-5 max-w-2xl">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">受付詳細</h1>
        <button onClick={() => router.back()} className="text-xs text-gray-500 hover:text-gray-700">← 戻る</button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm divide-y divide-gray-100">
        {/* Status */}
        <div className="p-4 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-1.5 flex-wrap">
            <StatusBadge status={reception.status} />
            <StatusBadge status={reception.delivery_method} />
            <StatusBadge status={reception.payment_method} />
            <StatusBadge status={reception.payment_status} />
          </div>
          <div className="flex items-center gap-2">
            <select className="text-xs border border-gray-200 rounded-lg px-2.5 py-1.5 text-gray-600 focus:outline-none focus:ring-2 focus:ring-violet-500" value={reception.status} onChange={e => handleStatusChange(e.target.value as ReceptionStatus)}>
              <option value="相談中">相談中</option>
              <option value="仮予約">仮予約</option>
              <option value="注文確定">注文確定</option>
              <option value="準備中">準備中</option>
              <option value="受渡し待ち">受渡し待ち</option>
              <option value="完了">完了</option>
              <option value="キャンセル">キャンセル</option>
            </select>
            <button
              onClick={handlePaymentStatusToggle}
              className={`text-xs px-2.5 py-1.5 rounded-lg border font-medium transition-colors ${
                reception.payment_status === '支払済'
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                  : 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100'
              }`}
            >
              {reception.payment_status === '支払済' ? '支払済 → 未払い' : '未払い → 支払済'}
            </button>
          </div>
        </div>

        {/* Customer info */}
        <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <p className="text-[11px] text-gray-400 uppercase tracking-wide">名前</p>
            <Link href={`/customers/${reception.customer_id}`} className="font-semibold text-gray-900 text-lg mt-0.5 hover:text-violet-700 transition-colors">
              {reception.customer_name}
            </Link>
          </div>
          <div><p className="text-[11px] text-gray-400 uppercase tracking-wide">電話番号</p><p className="font-medium text-gray-700 mt-0.5">{reception.phone || '-'}</p></div>
          <div className="sm:col-span-2">
            <p className="text-[11px] text-gray-400 uppercase tracking-wide">住所</p>
            {reception.address ? (
              <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(reception.address)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-violet-600 hover:underline text-sm"
                >
                  {reception.address} 📍
                </a>
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(reception.address)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs px-2 py-1 rounded-md bg-blue-50 text-blue-700 border border-blue-200 font-medium hover:bg-blue-100 transition-colors"
                >
                  ルート案内
                </a>
              </div>
            ) : <p className="text-gray-400 text-sm mt-0.5">-</p>}
          </div>
        </div>

        {/* Delivery info */}
        <div className="p-4 grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div>
            <p className="text-[11px] text-gray-400 uppercase tracking-wide">希望日</p>
            <input
              type="date"
              className="mt-0.5 text-sm font-medium text-gray-700 border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-violet-500"
              value={reception.desired_date || ''}
              onChange={e => handleFieldUpdate('desired_date', e.target.value)}
            />
          </div>
          <div>
            <p className="text-[11px] text-gray-400 uppercase tracking-wide">希望時間</p>
            <select
              className="mt-0.5 text-sm font-medium text-gray-700 border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-violet-500"
              value={reception.desired_time || ''}
              onChange={e => handleFieldUpdate('desired_time', e.target.value)}
            >
              <option value="">指定なし</option>
              <option value="午前">午前</option>
              <option value="午後">午後</option>
              <option value="9:00">9:00</option>
              <option value="10:00">10:00</option>
              <option value="11:00">11:00</option>
              <option value="12:00">12:00</option>
              <option value="13:00">13:00</option>
              <option value="14:00">14:00</option>
              <option value="15:00">15:00</option>
              <option value="16:00">16:00</option>
              <option value="17:00">17:00</option>
            </select>
          </div>
          <div><p className="text-[11px] text-gray-400 uppercase tracking-wide">箱</p><p className="font-medium text-gray-700 mt-0.5">{reception.has_box ? 'あり' : 'なし'}</p></div>
        </div>

        {/* Items note */}
        {reception.items_note && (
          <div className="p-4">
            <p className="text-[11px] text-gray-400 uppercase tracking-wide">内容メモ</p>
            <p className="text-sm text-gray-700 mt-0.5">{reception.items_note}</p>
          </div>
        )}

        {/* Items table */}
        {reception.items && reception.items.length > 0 && (
          <div className="p-4">
            <h3 className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-3">商品明細</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-[11px] text-gray-400 uppercase tracking-wide border-b border-gray-100">
                    <th className="text-left py-2 font-medium">種別</th>
                    <th className="text-left py-2 font-medium">商品名</th>
                    <th className="text-right py-2 font-medium">数量</th>
                    <th className="text-right py-2 font-medium">単価</th>
                    <th className="text-right py-2 font-medium">小計</th>
                  </tr>
                </thead>
                <tbody>
                  {reception.items.map(item => (
                    <tr key={item.id} className="border-b border-gray-50">
                      <td className="py-2">
                        <span className={`text-[11px] px-2 py-0.5 rounded-md border font-medium ${item.set_id ? 'bg-violet-50 text-violet-700 border-violet-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'}`}>
                          {item.set_id ? 'セット' : '単品'}
                        </span>
                      </td>
                      <td className="py-2 text-gray-800">{item.set?.name || item.variety?.name || '-'}</td>
                      <td className="py-2 text-right text-gray-600">× {item.quantity}</td>
                      <td className="py-2 text-right text-gray-600">¥{item.unit_price_snapshot.toLocaleString()}</td>
                      <td className="py-2 text-right font-medium text-gray-900">¥{item.line_total.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Total */}
        <div className="p-4 bg-gray-50/50 space-y-1.5">
          <div className="flex justify-between text-sm text-gray-600"><span>小計</span><span>¥{reception.subtotal.toLocaleString()}</span></div>
          {reception.shipping_fee > 0 && <div className="flex justify-between text-sm text-gray-400"><span>送料</span><span>¥{reception.shipping_fee.toLocaleString()}</span></div>}
          <div className="flex justify-between text-xl font-bold text-gray-900 pt-2 border-t border-gray-200"><span>合計</span><span>¥{reception.total.toLocaleString()}</span></div>
        </div>

        {/* Packing note */}
        {reception.packing_note && (
          <div className="p-4">
            <p className="text-[11px] text-gray-400 uppercase tracking-wide">組分けメモ</p>
            <p className="text-sm text-gray-700 mt-0.5">{reception.packing_note}</p>
          </div>
        )}

        {/* Memo */}
        {reception.memo && (
          <div className="p-4">
            <p className="text-[11px] text-gray-400 uppercase tracking-wide">メモ</p>
            <p className="text-sm text-gray-700 mt-0.5">{reception.memo}</p>
          </div>
        )}

        {/* Actions */}
        <div className="p-4 flex items-center justify-between">
          <a
            href={buildGoogleCalendarUrl(reception)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm px-4 py-2 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium hover:bg-emerald-100 transition-colors"
          >
            Googleカレンダーに追加
          </a>
          <button onClick={handleDelete} className="text-xs text-red-500 hover:text-red-700 font-medium px-3 py-1.5 rounded-lg border border-red-200 hover:bg-red-50 transition-colors">受付を削除</button>
        </div>
      </div>
    </div>
  );
}
