'use client';

import { useState, useEffect, type ReactNode } from 'react';

/**
 * 簡易パスワード保護
 * 環境変数 NEXT_PUBLIC_SITE_PASSWORD が設定されている場合、
 * パスワード入力を要求する。未設定なら素通し。
 * TODO: Supabase Auth に移行後はこのコンポーネントを削除する
 */
export default function AuthGuard({ children }: { children: ReactNode }) {
  const sitePassword = process.env.NEXT_PUBLIC_SITE_PASSWORD || '';
  const [authenticated, setAuthenticated] = useState(false);
  const [input, setInput] = useState('');
  const [error, setError] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (!sitePassword) {
      setAuthenticated(true);
      setChecking(false);
      return;
    }
    const stored = sessionStorage.getItem('sorasido_auth');
    if (stored === sitePassword) {
      setAuthenticated(true);
    }
    setChecking(false);
  }, [sitePassword]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input === sitePassword) {
      sessionStorage.setItem('sorasido_auth', input);
      setAuthenticated(true);
      setError(false);
    } else {
      setError(true);
    }
  };

  if (checking) return null;

  if (!authenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f5f5f7] px-4">
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 w-full max-w-sm space-y-4">
          <div className="text-center">
            <h1 className="text-xl font-bold text-[#1a1a2e]">ソラしどファーム</h1>
            <p className="text-sm text-gray-500 mt-1">管理システムにログイン</p>
          </div>
          <input
            type="password"
            className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
            placeholder="パスワードを入力"
            value={input}
            onChange={e => setInput(e.target.value)}
            autoFocus
          />
          {error && <p className="text-red-500 text-sm">パスワードが違います</p>}
          <button
            type="submit"
            className="w-full bg-violet-600 text-white py-3 rounded-lg font-medium hover:bg-violet-700 transition-colors"
          >
            ログイン
          </button>
        </form>
      </div>
    );
  }

  return <>{children}</>;
}
