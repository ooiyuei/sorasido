'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import StatusBadge from '@/components/StatusBadge';
import type { Reception } from '@/types';

export default function CalendarPage() {
  const [receptions, setReceptions] = useState<Reception[]>([]);
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });

  useEffect(() => { fetch('/api/receptions').then(r => r.json()).then(setReceptions); }, []);

  const [year, month] = currentMonth.split('-').map(Number);

  const calendarDays = useMemo(() => {
    const fmt = (y: number, m: number, d: number) => `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const firstDay = new Date(year, month - 1, 1);
    const lastDay = new Date(year, month, 0);
    const startPad = firstDay.getDay();
    const prevLastDay = new Date(year, month - 1, 0).getDate();
    const days: { key: string; date: string; day: number; isCurrentMonth: boolean }[] = [];
    const prevM = month === 1 ? 12 : month - 1;
    const prevY = month === 1 ? year - 1 : year;
    for (let i = 0; i < startPad; i++) {
      const d = prevLastDay - startPad + 1 + i;
      const date = fmt(prevY, prevM, d);
      days.push({ key: `p-${date}`, date, day: d, isCurrentMonth: false });
    }
    for (let d = 1; d <= lastDay.getDate(); d++) {
      const date = fmt(year, month, d);
      days.push({ key: date, date, day: d, isCurrentMonth: true });
    }
    const nextM = month === 12 ? 1 : month + 1;
    const nextY = month === 12 ? year + 1 : year;
    const remaining = days.length % 7 === 0 ? 0 : 7 - (days.length % 7);
    for (let d = 1; d <= remaining; d++) {
      const date = fmt(nextY, nextM, d);
      days.push({ key: `n-${date}`, date, day: d, isCurrentMonth: false });
    }
    return days;
  }, [year, month]);

  // Exclude キャンセル from all
  const activeReceptions = useMemo(() =>
    receptions.filter(r => r.status !== 'キャンセル' && r.desired_date),
  [receptions]);

  const receptionsByDate = useMemo(() => {
    const map: Record<string, Reception[]> = {};
    for (const r of activeReceptions) {
      if (!map[r.desired_date]) map[r.desired_date] = [];
      map[r.desired_date].push(r);
    }
    return map;
  }, [activeReceptions]);

  const prevMonth = () => { const d = new Date(year, month - 2, 1); setCurrentMonth(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`); };
  const nextMonth = () => { const d = new Date(year, month, 1); setCurrentMonth(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`); };

  const today = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const selectedReceptions = selectedDate ? (receptionsByDate[selectedDate] || []) : [];

  // Preparation summary for selected date
  const prepSummary = useMemo(() => {
    if (!selectedDate) return null;
    const dayRecs = receptionsByDate[selectedDate] || [];
    // Aggregate variety quantities
    const varietyMap: Record<string, { name: string; count: number; texts: string[] }> = {};
    let setCount = 0;
    let boxCount = 0;
    const deliveryCounts: Record<string, number> = { '配送': 0, '配達': 0, '店頭受取': 0 };

    for (const r of dayRecs) {
      boxCount += r.box_count || 0;
      if (r.delivery_method in deliveryCounts) {
        deliveryCounts[r.delivery_method]++;
      }
      for (const item of (r.items || [])) {
        if (item.set_id) {
          setCount++;
        } else if (item.variety_id && item.variety) {
          const key = item.variety_id;
          if (!varietyMap[key]) varietyMap[key] = { name: item.variety.name, count: 0, texts: [] };
          varietyMap[key].count += item.quantity || 0;
          if (item.planned_quantity_text) varietyMap[key].texts.push(item.planned_quantity_text);
        }
      }
    }

    return {
      varieties: Object.values(varietyMap),
      setCount,
      boxCount,
      deliveryCounts,
      total: dayRecs.length,
    };
  }, [selectedDate, receptionsByDate]);

  const buildGoogleCalendarUrl = (r: Reception) => {
    const title = encodeURIComponent(`受渡し: ${r.customer_name_snapshot}`);
    const date = (r.desired_date || '').replace(/-/g, '');
    const location = encodeURIComponent(r.customer_address_snapshot || '');
    const details = encodeURIComponent(
      `内容: ${r.items_note || '-'}\n電話: ${r.customer_phone_snapshot || '-'}\n配達方法: ${r.delivery_method}`
    );
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${date}/${date}&location=${location}&details=${details}`;
  };

  const dotColors = ['bg-violet-400', 'bg-teal-400', 'bg-amber-400', 'bg-rose-400', 'bg-sky-400'];

  return (
    <div className="space-y-5">
      <h1 className="text-xl font-bold text-gray-900">カレンダー</h1>

      <div className="flex flex-col lg:flex-row gap-5">
        {/* Left: Calendar grid */}
        <div className="lg:w-[60%] space-y-4">
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
              {calendarDays.map(({ key, date, day, isCurrentMonth }) => {
                const dayReceptions = receptionsByDate[date] || [];
                const isToday = date === today;
                const isSelected = date === selectedDate;
                return (
                  <button
                    key={key}
                    onClick={() => setSelectedDate(date)}
                    className={`p-1.5 min-h-[56px] md:min-h-[76px] border-b border-r border-gray-100 text-left align-top transition-all
                      ${!isCurrentMonth ? 'bg-gray-50/50 text-gray-300' : 'hover:bg-violet-50/50'}
                      ${isToday ? 'bg-violet-50/70' : ''}
                      ${isSelected ? 'ring-2 ring-violet-500 ring-inset bg-violet-50' : ''}
                    `}
                  >
                    <div className={`text-[11px] font-medium mb-0.5 ${isToday ? 'text-violet-700 font-bold' : isCurrentMonth ? 'text-gray-600' : 'text-gray-300'}`}>{day}</div>
                    {dayReceptions.length > 0 && (
                      <div className="space-y-0.5">
                        <div className="flex gap-0.5 px-0.5">
                          {dayReceptions.slice(0, 5).map((r, i) => (
                            <div key={r.id} className={`w-2 h-2 rounded-full ${dotColors[i % dotColors.length]}`} />
                          ))}
                        </div>
                        {dayReceptions.slice(0, 2).map(r => (
                          <div key={r.id} className="text-[10px] truncate px-1 py-0.5 rounded bg-violet-100 text-violet-700 font-medium">
                            {r.customer_name_snapshot}
                          </div>
                        ))}
                        {dayReceptions.length > 2 && (
                          <div className="text-[10px] text-gray-400 px-1">+{dayReceptions.length - 2}件</div>
                        )}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right: Summary + reception list */}
        <div className="lg:w-[40%] space-y-4">
          {/* Preparation summary */}
          {selectedDate && prepSummary && prepSummary.total > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
              <div className="px-4 py-3 border-b border-gray-100">
                <h3 className="text-sm font-semibold text-gray-800">本日の準備量 ({selectedDate})</h3>
              </div>
              <div className="p-4 space-y-3">
                {/* Variety aggregation */}
                {prepSummary.varieties.length > 0 && (
                  <div>
                    <p className="text-xs text-gray-500 font-semibold mb-1.5">品種別必要量</p>
                    <div className="space-y-1">
                      {prepSummary.varieties.map(v => (
                        <div key={v.name} className="flex items-center justify-between text-sm">
                          <span className="font-medium text-gray-900">{v.name}</span>
                          <span className="text-gray-600">
                            {v.texts.length > 0 ? v.texts.join(', ') : `${v.count}個`}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Stats row */}
                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-gray-100">
                  <div className="text-center">
                    <p className="text-xs text-gray-400">セット数</p>
                    <p className="text-lg font-bold text-gray-900">{prepSummary.setCount}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-400">箱数</p>
                    <p className="text-lg font-bold text-gray-900">{prepSummary.boxCount}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-400">合計件数</p>
                    <p className="text-lg font-bold text-gray-900">{prepSummary.total}</p>
                  </div>
                </div>

                {/* Delivery method counts */}
                <div className="flex gap-2 pt-2 border-t border-gray-100">
                  {Object.entries(prepSummary.deliveryCounts).map(([method, count]) => (
                    <div key={method} className="flex items-center gap-1">
                      <StatusBadge status={method} />
                      <span className="text-sm font-semibold text-gray-700">{count}件</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Individual reception list */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm lg:sticky lg:top-4">
            {selectedDate ? (
              <>
                <div className="px-4 py-3 border-b border-gray-100">
                  <h3 className="text-sm font-semibold text-gray-800">{selectedDate} の予定</h3>
                </div>
                <div className="p-3">
                  {selectedReceptions.length === 0 ? (
                    <p className="text-gray-400 text-sm text-center py-4">この日の予定はありません</p>
                  ) : (
                    <div className="space-y-3">
                      {selectedReceptions.map(r => (
                        <div key={r.id} className="p-3 rounded-lg border border-gray-100 hover:bg-gray-50/50 transition-colors">
                          <Link href={`/receptions/${r.id}`} className="block">
                            <div className="flex items-start justify-between mb-1.5">
                              <div>
                                <span className="text-xs text-gray-500 mr-2">{r.desired_time || '時間未定'}</span>
                                <span className="font-semibold text-sm text-gray-900">{r.customer_name_snapshot}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <StatusBadge status={r.delivery_method} />
                                <StatusBadge status={r.weighed ? '計量済み' : '未計量'} />
                                <StatusBadge status={r.status} />
                              </div>
                            </div>
                            {r.items_note && (
                              <p className="text-xs text-gray-500 mt-1">{r.items_note}</p>
                            )}
                          </Link>
                          <div className="mt-1.5 flex gap-2">
                            {r.customer_address_snapshot && (
                              <a
                                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(r.customer_address_snapshot)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[11px] px-2 py-1 rounded-md bg-blue-50 text-blue-700 border border-blue-200 font-medium hover:bg-blue-100 transition-colors"
                              >
                                Maps
                              </a>
                            )}
                            <a
                              href={buildGoogleCalendarUrl(r)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[11px] px-2 py-1 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium hover:bg-emerald-100 transition-colors"
                            >
                              Calendar
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="p-8 text-center">
                <p className="text-gray-400 text-sm">日付を選択してください</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
