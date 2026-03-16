'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import StatusBadge from '@/components/StatusBadge';
import type { Order } from '@/types';

export default function CalendarPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });

  useEffect(() => { fetch('/api/orders').then(r => r.json()).then(setOrders); }, []);

  const [year, month] = currentMonth.split('-').map(Number);

  const calendarDays = useMemo(() => {
    const firstDay = new Date(year, month - 1, 1);
    const lastDay = new Date(year, month, 0);
    const startPad = firstDay.getDay();
    const days: { date: string; day: number; isCurrentMonth: boolean }[] = [];
    for (let i = startPad - 1; i >= 0; i--) {
      const d = new Date(year, month - 1, -i);
      days.push({ date: d.toISOString().split('T')[0], day: d.getDate(), isCurrentMonth: false });
    }
    for (let d = 1; d <= lastDay.getDate(); d++) {
      const date = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      days.push({ date, day: d, isCurrentMonth: true });
    }
    const remaining = 7 - (days.length % 7);
    if (remaining < 7) {
      for (let d = 1; d <= remaining; d++) {
        const date = new Date(year, month, d);
        days.push({ date: date.toISOString().split('T')[0], day: d, isCurrentMonth: false });
      }
    }
    return days;
  }, [year, month]);

  const ordersByDate = useMemo(() => {
    const map: Record<string, Order[]> = {};
    for (const o of orders) {
      if (o.status === 'キャンセル' || !o.scheduled_date) continue;
      if (!map[o.scheduled_date]) map[o.scheduled_date] = [];
      map[o.scheduled_date].push(o);
    }
    return map;
  }, [orders]);

  const prevMonth = () => { const d = new Date(year, month - 2, 1); setCurrentMonth(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`); };
  const nextMonth = () => { const d = new Date(year, month, 1); setCurrentMonth(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`); };

  const today = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const selectedOrders = selectedDate ? (ordersByDate[selectedDate] || []) : [];

  return (
    <div className="space-y-5">
      <h1 className="text-xl font-bold text-gray-900">配達カレンダー</h1>

      <div className="flex items-center justify-between bg-white rounded-xl border border-gray-200 shadow-sm px-4 py-3">
        <button onClick={prevMonth} className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">← 前月</button>
        <h2 className="text-base font-semibold text-gray-900">{year}年{month}月</h2>
        <button onClick={nextMonth} className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">翌月 →</button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="grid grid-cols-7 text-center text-[11px] font-semibold text-gray-400 border-b border-gray-100 uppercase tracking-wide">
          {['日', '月', '火', '水', '木', '金', '土'].map(d => (
            <div key={d} className="py-2.5">{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {calendarDays.map(({ date, day, isCurrentMonth }) => {
            const dayOrders = ordersByDate[date] || [];
            const isToday = date === today;
            const isSelected = date === selectedDate;
            return (
              <button
                key={date}
                onClick={() => setSelectedDate(date)}
                className={`p-1.5 min-h-[56px] md:min-h-[76px] border-b border-r border-gray-100 text-left align-top transition-all
                  ${!isCurrentMonth ? 'bg-gray-50/50 text-gray-300' : 'hover:bg-violet-50/50'}
                  ${isToday ? 'bg-violet-50/70' : ''}
                  ${isSelected ? 'ring-2 ring-violet-500 ring-inset bg-violet-50' : ''}
                `}
              >
                <div className={`text-[11px] font-medium mb-0.5 ${isToday ? 'text-violet-700 font-bold' : isCurrentMonth ? 'text-gray-600' : 'text-gray-300'}`}>{day}</div>
                {dayOrders.length > 0 && (
                  <div className="space-y-0.5">
                    {dayOrders.slice(0, 2).map(o => (
                      <div key={o.id} className="text-[10px] truncate px-1 py-0.5 rounded bg-violet-100 text-violet-700 font-medium">
                        {o.customer_name}
                      </div>
                    ))}
                    {dayOrders.length > 2 && (
                      <div className="text-[10px] text-gray-400 px-1">+{dayOrders.length - 2}件</div>
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {selectedDate && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="px-4 py-3 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-gray-800">{selectedDate} の配達一覧</h3>
          </div>
          <div className="p-3">
            {selectedOrders.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-4">この日の予定はありません</p>
            ) : (
              <div className="space-y-2">
                {selectedOrders.map(o => (
                  <Link key={o.id} href={`/orders/${o.id}`} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg border border-gray-100 transition-colors">
                    <div>
                      <p className="font-medium text-sm text-gray-900">{o.customer_name}</p>
                      <p className="text-xs text-gray-500">{o.scheduled_time || '時間未定'}</p>
                      {o.address && (
                        <button
                          onClick={e => { e.preventDefault(); window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(o.address)}`, '_blank'); }}
                          className="text-[11px] text-violet-600 hover:underline mt-1"
                        >
                          {o.address} 📍
                        </button>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <StatusBadge status={o.delivery_method} />
                      <StatusBadge status={o.status} />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
