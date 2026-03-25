import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "ブログ | ソラしどファーム",
  description: "ぶどう農場の運営・農業DX・予約管理に関する情報をお届けするブログです。",
  openGraph: {
    title: "ブログ | ソラしどファーム",
    description: "ぶどう農場の運営・農業DX・予約管理に関する情報をお届けするブログです。",
    type: "website",
    url: "https://sorasido.vercel.app/blog",
  },
};

const articles = [
  {
    slug: "article1",
    title: "ぶどう農場の予約管理をデジタル化するメリットと方法",
    description: "紙やExcelからの脱却。農場経営をスムーズにするデジタル予約管理の始め方を解説します。",
    date: "2026-03-01",
  },
  {
    slug: "article2",
    title: "農産物の在庫管理と配達スケジュール最適化のコツ",
    description: "収穫量の予測から配達ルートの効率化まで、農場運営の実務に役立つノウハウをまとめました。",
    date: "2026-03-15",
  },
];

export default function BlogIndexPage() {
  return (
    <div className="max-w-3xl mx-auto py-12 px-4">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">ブログ</h1>
      <p className="text-gray-500 mb-8">ぶどう農場の運営・農業DX・予約管理に関する情報をお届けします。</p>
      <div className="space-y-6">
        {articles.map((article) => (
          <article key={article.slug} className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <time className="text-xs text-gray-400">{article.date}</time>
            <h2 className="text-lg font-semibold text-gray-900 mt-1 mb-2">
              <Link href={`/blog/${article.slug}`} className="hover:text-violet-700 transition-colors">
                {article.title}
              </Link>
            </h2>
            <p className="text-sm text-gray-600">{article.description}</p>
            <Link href={`/blog/${article.slug}`} className="inline-block mt-3 text-sm text-violet-600 hover:underline font-medium">
              続きを読む →
            </Link>
          </article>
        ))}
      </div>
    </div>
  );
}
