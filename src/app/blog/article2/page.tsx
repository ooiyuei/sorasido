import type { Metadata } from "next";
import Link from "next/link";
import Script from "next/script";

export const metadata: Metadata = {
  title: "農産物の在庫管理と配達スケジュール最適化のコツ | ソラしどファーム",
  description:
    "収穫量の予測から配達ルートの効率化まで、農場運営の実務に役立つ在庫管理と配達スケジュール最適化のノウハウを解説します。",
  openGraph: {
    title: "農産物の在庫管理と配達スケジュール最適化のコツ",
    description:
      "収穫量の予測から配達ルートの効率化まで、農場運営の実務に役立つ在庫管理と配達スケジュール最適化のノウハウを解説します。",
    type: "article",
    url: "https://sorasido.vercel.app/blog/article2",
  },
  twitter: {
    card: "summary_large_image",
    title: "農産物の在庫管理と配達スケジュール最適化のコツ",
    description:
      "収穫量の予測から配達ルートの効率化まで、農場運営の実務に役立つ在庫管理と配達スケジュール最適化のノウハウを解説します。",
  },
};

export default function Article2Page() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: "農産物の在庫管理と配達スケジュール最適化のコツ",
    description: "収穫量の予測から配達ルートの効率化まで、農場運営の実務に役立つ在庫管理と配達スケジュール最適化のノウハウを解説します。",
    datePublished: "2026-03-15",
    author: { "@type": "Organization", name: "ソラしどファーム" },
    publisher: { "@type": "Organization", name: "ソラしどファーム", url: "https://sorasido.vercel.app" },
    url: "https://sorasido.vercel.app/blog/article2",
  };
  return (
    <>
      <Script id="json-ld-article2" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    <article className="max-w-3xl mx-auto py-12 px-4">
      <header className="mb-8">
        <time className="text-xs text-gray-400">2026-03-15</time>
        <h1 className="text-2xl font-bold text-gray-900 mt-2 leading-tight">
          農産物の在庫管理と配達スケジュール最適化のコツ
        </h1>
        <p className="mt-3 text-gray-600">
          収穫量の予測から配達ルートの効率化まで、農場運営の実務に役立つノウハウをまとめました。
        </p>
      </header>

      <div className="prose prose-gray max-w-none space-y-6 text-gray-700 leading-relaxed">
        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">農場における在庫管理の難しさ</h2>
          <p>
            農産物の在庫管理は、工業製品と大きく異なる難しさがあります。収穫量は天候や病害虫の影響を受けるため、シーズン前から正確な数量を予測することが困難です。また、農産物には鮮度という時間的制約があり、過剰在庫はそのまま廃棄ロスにつながります。
          </p>
          <p>
            一方で、予約を入れすぎて在庫が不足した場合、顧客への信頼を損なうリスクもあります。予約数と実際の収穫量のバランスをいかに取るかが、農場経営の重要な課題の一つです。
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">品種別在庫管理の基本</h2>
          <p>複数品種を扱う農場では、品種ごとに以下の数値を管理することが基本になります。</p>
          <ul className="list-disc pl-6 space-y-2 mt-2">
            <li><strong>予定収穫量：</strong>今シーズンの品種別収穫見込み数量</li>
            <li><strong>確保済み数量：</strong>予約・注文によって既に割り当てられた数量</li>
            <li><strong>残数：</strong>予定収穫量から確保済み数量を引いた受付可能残数</li>
            <li><strong>低在庫閾値：</strong>残数がこの値を下回ったら警告を出す基準値</li>
          </ul>
          <p className="mt-3">
            これらをリアルタイムで把握できる仕組みがあれば、「売り切れているのに予約を受けてしまった」という事態を未然に防げます。品種ごとに在庫バーをビジュアル表示することで、一覧でどの品種が逼迫しているかを直感的に把握できます。
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">配達スケジュールの最適化</h2>
          <p>
            配達業務は農場にとって大きな時間・コストのかかる作業です。同じエリアへの配達をまとめて行うルート最適化や、受渡し時間の分散は、効率化の基本です。
          </p>
          <p>以下のポイントを意識することで、配達業務の効率が大きく改善されます。</p>
          <ol className="list-decimal pl-6 space-y-3 mt-2">
            <li>
              <strong>日別・時間帯別の受渡し件数を把握する：</strong>特定の日や時間帯に配達が集中しないよう、受付時点でスケジュール状況を顧客に見せる工夫をしましょう。
            </li>
            <li>
              <strong>配達先住所のエリア分類：</strong>住所情報をもとに配達先を地域別にグルーピングし、同じエリアの配達をまとめてルートを組みます。
            </li>
            <li>
              <strong>配達方法（宅配・直接引渡し）の明確化：</strong>宅配便を使うか農場での直接引き渡しかによって、必要な準備が異なります。受付時点で明確にしておくと当日の作業がスムーズです。
            </li>
            <li>
              <strong>配達完了のリアルタイム更新：</strong>配達スタッフがモバイルから完了報告を入力できる仕組みにすることで、本部側が進捗をリアルタイムで把握できます。
            </li>
          </ol>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">計量・重量管理との連携</h2>
          <p>
            ぶどうのような農産物は、箱単位の予約だけでなく重量単価での販売も一般的です。この場合、計量完了のタイミングで在庫数量と請求金額が確定するため、計量の有無を管理システムで追跡することが重要になります。
          </p>
          <p>
            「計量済み」「未計量」のステータス管理を受付情報と紐づけておくことで、配達前に未計量の受付が残っていないかをすぐに確認できます。また計量完了時に自動で最終金額を算出・表示できると、会計処理がスムーズになります。
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">シーズン終了後のデータ活用</h2>
          <p>
            シーズンを通じて蓄積した予約・配達・販売データは、次シーズンの計画立案に非常に役立ちます。品種別の売れ行き傾向、人気の受渡し日時帯、リピーター顧客の特定などが可能になり、翌年の栽培計画や価格設定にデータに基づいた判断を取り入れられます。
          </p>
          <p>
            単なる業務効率化ツールとしてだけでなく、農場経営の意思決定を支援するデータ基盤として管理システムを活用することが、長期的な農場の発展につながります。
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">まとめ</h2>
          <p>
            農産物の在庫管理と配達スケジュール最適化は、農場経営の収益性と顧客満足度の両方に直結する重要な業務です。品種別在庫のリアルタイム管理、配達ルートの最適化、計量・会計との連携を一元管理できる仕組みを整えることで、繁忙期でも安定した農場運営が実現します。
          </p>
          <p>
            デジタルシステムの導入は初期の手間がかかりますが、一度運用軌道に乗れば毎シーズンの業務負荷を大幅に削減できます。今シーズンの準備として、まず現在の管理方法の課題を洗い出すところから始めてみてください。
          </p>
        </section>
      </div>

      <footer className="mt-12 pt-6 border-t border-gray-200">
        <Link href="/blog" className="text-sm text-violet-600 hover:underline">← ブログ一覧に戻る</Link>
      </footer>
    </article>
    </>
  );
}
