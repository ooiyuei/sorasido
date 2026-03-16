'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { href: '/', label: 'ダッシュボード', icon: '📊' },
  { href: '/receptions', label: '受付管理', icon: '📋' },
  { href: '/receptions/new', label: '+ 新規受付', icon: '➕', isAction: true },
  { href: '/accounting', label: '当日会計', icon: '⚖️' },
  { href: '/customers', label: '顧客', icon: '👤' },
  { href: '/calendar', label: 'カレンダー', icon: '📅' },
  { href: '/sales', label: '売上', icon: '💰' },
  { href: '/varieties', label: '品種', icon: '🍇' },
  { href: '/sets', label: 'セット', icon: '📦' },
];

const mobileItems = [
  { href: '/', label: 'ホーム', icon: '📊' },
  { href: '/receptions', label: '受付', icon: '📋' },
  { href: '/receptions/new', label: '新規', icon: '➕' },
  { href: '/accounting', label: '会計', icon: '⚖️' },
  { href: '/customers', label: '顧客', icon: '👤' },
  { href: '/calendar', label: '予定', icon: '📅' },
];

export default function Navigation() {
  const pathname = usePathname();

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex md:flex-col md:w-56 bg-white border-r border-gray-200 min-h-screen fixed left-0 top-0 z-30 shadow-sm">
        <div className="px-5 py-5 border-b border-gray-100">
          <h1 className="text-lg font-bold text-violet-700 tracking-tight">ソラしどファーム</h1>
          <p className="text-[11px] text-gray-400 mt-0.5">受付管理システム</p>
        </div>
        <nav className="flex-1 px-3 py-3 space-y-0.5">
          {navItems.map(item => {
            const active = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
            const isAction = 'isAction' in item && item.isAction;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-[13px] transition-colors ${
                  isAction
                    ? 'bg-violet-600 text-white font-semibold hover:bg-violet-700 mt-1 mb-1'
                    : active
                    ? 'bg-violet-50 text-violet-700 font-semibold'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <span className="text-base">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
        <div className="px-5 py-3 border-t border-gray-100 text-[10px] text-gray-300">
          v4.0
        </div>
      </aside>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t border-gray-200 z-30 flex">
        {mobileItems.map(item => {
          const active = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex-1 flex flex-col items-center py-2 text-[10px] transition-colors ${
                active ? 'text-violet-700 font-semibold' : 'text-gray-400'
              }`}
            >
              <span className="text-[18px] leading-tight">{item.icon}</span>
              <span className="mt-0.5">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
