'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import StatusBadge from '@/components/StatusBadge';
import type { Order, OrderStatus } from '@/types';

export default function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);

  useEffect(() => { fetch(`/api/orders/${id}`).then(r => r.json()).then(setOrder); }, [id]);

  const handleStatusChange = async (status: OrderStatus) => {
    await fetch(`/api/orders/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) });
    fetch(`/api/orders/${id}`).then(r => r.json()).then(setOrder);
  };

  const handleDelete = async () => {
    if (!confirm('この注文を削除しますか？')) return;
    await fetch(`/api/orders/${id}`, { method: 'DELETE' });
    router.push('/orders');
  };

  const openMap = () => {
    if (order?.address) window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(order.address)}`, '_blank');
  };

  if (!order) return <div className="text-center py-12 text-gray-400 text-sm">読み込み中...</div>;

  return (
    <div className="space-y-5 max-w-2xl">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">注文詳細</h1>
        <button onClick={() => router.back()} className="text-xs text-gray-500 hover:text-gray-700">← 戻る</button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm divide-y divide-gray-100">
        {/* ステータス */}
        <div className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <StatusBadge status={order.status} />
            <StatusBadge status={order.delivery_method} />
            <StatusBadge status={order.payment_method} />
          </div>
          <select className="text-xs border border-gray-200 rounded-lg px-2.5 py-1.5 text-gray-600 focus:outline-none focus:ring-2 focus:ring-violet-500" value={order.status} onChange={e => handleStatusChange(e.target.value as OrderStatus)}>
            <option value="確定">確定</option>
            <option value="準備中">準備中</option>
            <option value="配達予定">配達予定</option>
            <option value="完了">完了</option>
            <option value="キャンセル">キャンセル</option>
          </select>
        </div>

        {/* 顧客情報 */}
        <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div><p className="text-[11px] text-gray-400 uppercase tracking-wide">名前</p><p className="font-semibold text-gray-900 text-lg mt-0.5">{order.customer_name}</p></div>
          <div><p className="text-[11px] text-gray-400 uppercase tracking-wide">電話番号</p><p className="font-medium text-gray-700 mt-0.5">{order.phone || '-'}</p></div>
          <div className="sm:col-span-2">
            <p className="text-[11px] text-gray-400 uppercase tracking-wide">住所</p>
            {order.address ? (
              <button onClick={openMap} className="text-violet-600 hover:underline text-sm mt-0.5 text-left">{order.address} 📍</button>
            ) : <p className="text-gray-400 text-sm mt-0.5">-</p>}
          </div>
        </div>

        {/* 配達情報 */}
        <div className="p-4 grid grid-cols-3 gap-4">
          <div><p className="text-[11px] text-gray-400 uppercase tracking-wide">日程</p><p className="font-medium text-gray-700 mt-0.5">{order.scheduled_date || '-'}</p></div>
          <div><p className="text-[11px] text-gray-400 uppercase tracking-wide">時間</p><p className="font-medium text-gray-700 mt-0.5">{order.scheduled_time || '-'}</p></div>
          <div><p className="text-[11px] text-gray-400 uppercase tracking-wide">箱</p><p className="font-medium text-gray-700 mt-0.5">{order.has_box ? 'あり' : 'なし'}</p></div>
        </div>

        {/* 商品明細 */}
        <div className="p-4">
          <h3 className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-3">商品明細</h3>
          {(order.items || []).map(item => (
            <div key={item.id} className="flex items-center justify-between py-2">
              <div className="flex items-center gap-2">
                <span className={`text-[11px] px-2 py-0.5 rounded-md border font-medium ${item.set_id ? 'bg-violet-50 text-violet-700 border-violet-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'}`}>
                  {item.set_id ? 'セット' : '単品'}
                </span>
                <span className="text-sm text-gray-800">{item.set?.name || item.variety?.name || '-'}</span>
                <span className="text-sm text-gray-400">× {item.quantity}</span>
              </div>
              <span className="text-sm font-medium text-gray-900">¥{(item.quantity * item.unit_price).toLocaleString()}</span>
            </div>
          ))}
        </div>

        {/* 合計 */}
        <div className="p-4 bg-gray-50/50 space-y-1.5">
          <div className="flex justify-between text-sm text-gray-600"><span>小計</span><span>¥{order.subtotal.toLocaleString()}</span></div>
          {order.shipping_fee > 0 && <div className="flex justify-between text-sm text-gray-400"><span>送料</span><span>¥{order.shipping_fee.toLocaleString()}</span></div>}
          <div className="flex justify-between text-xl font-bold text-gray-900 pt-2 border-t border-gray-200"><span>合計</span><span>¥{order.total.toLocaleString()}</span></div>
        </div>

        {order.packing_note && (
          <div className="p-4">
            <p className="text-[11px] text-gray-400 uppercase tracking-wide">組分けメモ</p>
            <p className="text-sm text-gray-700 mt-0.5">{order.packing_note}</p>
          </div>
        )}

        <div className="p-4">
          <button onClick={handleDelete} className="text-red-500 text-xs hover:underline font-medium">注文を削除</button>
        </div>
      </div>
    </div>
  );
}
