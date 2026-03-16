'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import StatusBadge from '@/components/StatusBadge';
import type { Order, OrderStatus, PaymentStatus, Staff } from '@/types';

export default function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [staffList, setStaffList] = useState<Staff[]>([]);

  useEffect(() => {
    fetch(`/api/orders/${id}`).then(r => r.json()).then(setOrder);
    fetch('/api/staff').then(r => r.json()).then(setStaffList);
  }, [id]);

  const handleStatusChange = async (status: OrderStatus) => {
    await fetch(`/api/orders/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) });
    fetch(`/api/orders/${id}`).then(r => r.json()).then(setOrder);
  };

  const handlePaymentStatusToggle = async () => {
    if (!order) return;
    const next: PaymentStatus = order.payment_status === '未払い' ? '支払済' : '未払い';
    await fetch(`/api/orders/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ payment_status: next }) });
    fetch(`/api/orders/${id}`).then(r => r.json()).then(setOrder);
  };

  const handleDelete = async () => {
    if (!confirm('この注文を削除しますか？')) return;
    await fetch(`/api/orders/${id}`, { method: 'DELETE' });
    router.push('/orders');
  };

  const buildGoogleCalendarUrl = (o: Order) => {
    const title = encodeURIComponent(`配達: ${o.customer_name}`);
    const date = (o.scheduled_date || '').replace(/-/g, '');
    const startDate = date;
    const endDate = date;
    const location = encodeURIComponent(o.address || '');
    const itemNames = (o.items || []).map(i => i.set?.name || i.variety?.name || '-').join(', ');
    const details = encodeURIComponent(
      `商品: ${itemNames}\n電話: ${o.phone || '-'}\n支払: ${o.payment_method} (${o.payment_status})\n配達方法: ${o.delivery_method}\n合計: ¥${o.total.toLocaleString()}`
    );
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startDate}/${endDate}&location=${location}&details=${details}`;
  };

  if (!order) return <div className="text-center py-12 text-gray-400 text-sm">読み込み中...</div>;

  const assignee = order.assignee || staffList.find(s => s.id === order.assignee_id);
  const deliveryStaff = order.delivery_staff || staffList.find(s => s.id === order.delivery_staff_id);

  return (
    <div className="space-y-5 max-w-2xl">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">注文詳細</h1>
        <button onClick={() => router.back()} className="text-xs text-gray-500 hover:text-gray-700">← 戻る</button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm divide-y divide-gray-100">
        {/* ステータス */}
        <div className="p-4 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-1.5 flex-wrap">
            <StatusBadge status={order.status} />
            <StatusBadge status={order.delivery_method} />
            <StatusBadge status={order.payment_method} />
            <StatusBadge status={order.payment_status} />
          </div>
          <div className="flex items-center gap-2">
            <select className="text-xs border border-gray-200 rounded-lg px-2.5 py-1.5 text-gray-600 focus:outline-none focus:ring-2 focus:ring-violet-500" value={order.status} onChange={e => handleStatusChange(e.target.value as OrderStatus)}>
              <option value="確定">確定</option>
              <option value="準備中">準備中</option>
              <option value="配達予定">配達予定</option>
              <option value="完了">完了</option>
              <option value="キャンセル">キャンセル</option>
            </select>
            <button
              onClick={handlePaymentStatusToggle}
              className={`text-xs px-2.5 py-1.5 rounded-lg border font-medium transition-colors ${
                order.payment_status === '支払済'
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                  : 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100'
              }`}
            >
              {order.payment_status === '支払済' ? '支払済 → 未払い' : '未払い → 支払済'}
            </button>
          </div>
        </div>

        {/* 顧客情報 */}
        <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div><p className="text-[11px] text-gray-400 uppercase tracking-wide">名前</p><p className="font-semibold text-gray-900 text-lg mt-0.5">{order.customer_name}</p></div>
          <div><p className="text-[11px] text-gray-400 uppercase tracking-wide">電話番号</p><p className="font-medium text-gray-700 mt-0.5">{order.phone || '-'}</p></div>
          <div className="sm:col-span-2">
            <p className="text-[11px] text-gray-400 uppercase tracking-wide">住所</p>
            {order.address ? (
              <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(order.address)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-violet-600 hover:underline text-sm"
                >
                  {order.address} 📍
                </a>
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(order.address)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs px-2 py-1 rounded-md bg-blue-50 text-blue-700 border border-blue-200 font-medium hover:bg-blue-100 transition-colors"
                >
                  🚗 ルート案内
                </a>
              </div>
            ) : <p className="text-gray-400 text-sm mt-0.5">-</p>}
          </div>
        </div>

        {/* 配達情報 */}
        <div className="p-4 grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div><p className="text-[11px] text-gray-400 uppercase tracking-wide">日程</p><p className="font-medium text-gray-700 mt-0.5">{order.scheduled_date || '-'}</p></div>
          <div><p className="text-[11px] text-gray-400 uppercase tracking-wide">時間</p><p className="font-medium text-gray-700 mt-0.5">{order.scheduled_time || '-'}</p></div>
          <div><p className="text-[11px] text-gray-400 uppercase tracking-wide">箱</p><p className="font-medium text-gray-700 mt-0.5">{order.has_box ? 'あり' : 'なし'}</p></div>
          <div>
            <p className="text-[11px] text-gray-400 uppercase tracking-wide">担当者</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              {assignee && <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: assignee.color }} />}
              <p className="font-medium text-gray-700">{assignee?.name || '-'}</p>
            </div>
          </div>
          <div>
            <p className="text-[11px] text-gray-400 uppercase tracking-wide">配達スタッフ</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              {deliveryStaff && <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: deliveryStaff.color }} />}
              <p className="font-medium text-gray-700">{deliveryStaff?.name || '-'}</p>
            </div>
          </div>
        </div>

        {/* 商品明細 */}
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
                {(order.items || []).map(item => (
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

        {/* 合計 */}
        <div className="p-4 bg-gray-50/50 space-y-1.5">
          <div className="flex justify-between text-sm text-gray-600"><span>小計</span><span>¥{order.subtotal.toLocaleString()}</span></div>
          {order.shipping_fee > 0 && <div className="flex justify-between text-sm text-gray-400"><span>送料</span><span>¥{order.shipping_fee.toLocaleString()}</span></div>}
          <div className="flex justify-between text-xl font-bold text-gray-900 pt-2 border-t border-gray-200"><span>合計</span><span>¥{order.total.toLocaleString()}</span></div>
        </div>

        {/* 組分けメモ */}
        {order.packing_note && (
          <div className="p-4">
            <p className="text-[11px] text-gray-400 uppercase tracking-wide">組分けメモ</p>
            <p className="text-sm text-gray-700 mt-0.5">{order.packing_note}</p>
          </div>
        )}

        {/* Googleカレンダー */}
        <div className="p-4">
          <a
            href={buildGoogleCalendarUrl(order)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm px-4 py-2 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium hover:bg-emerald-100 transition-colors"
          >
            Googleカレンダーに追加
          </a>
        </div>

        {/* 削除 */}
        <div className="p-4">
          <button onClick={handleDelete} className="text-red-500 text-xs hover:underline font-medium">注文を削除</button>
        </div>
      </div>
    </div>
  );
}
