import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "プライバシーポリシー",
  description: "ソラしどファームのプライバシーポリシー",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-sm p-8">
        <h1 className="text-2xl font-bold text-[#1a1a2e] mb-2">プライバシーポリシー</h1>
        <p className="text-sm text-gray-400 mb-8">最終更新日: 2026年3月24日</p>

        <div className="space-y-6 text-sm text-gray-600 leading-relaxed">
          <section>
            <h2 className="text-base font-bold text-[#1a1a2e] mb-2">1. 収集する情報</h2>
            <p>本サービスでは、以下の情報を収集します：</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>アカウント情報: メールアドレス、表示名</li>
              <li>業務データ: 予約情報、注文情報、在庫データ、配達記録</li>
              <li>顧客情報: 氏名、連絡先、住所（農場運営に必要な範囲）</li>
              <li>利用データ: アクセスログ（匿名化）</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-bold text-[#1a1a2e] mb-2">2. 情報の利用目的</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>農場の予約・注文管理システムの提供</li>
              <li>在庫・配達管理の運用</li>
              <li>顧客へのサービス提供</li>
              <li>サービスの改善・新機能開発</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-bold text-[#1a1a2e] mb-2">3. 情報の第三者提供</h2>
            <p>以下の場合を除き、個人情報を第三者に提供しません：</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>ユーザーの同意がある場合</li>
              <li>法令に基づく場合</li>
              <li>サービス運営に必要な外部サービス（Vercel）への委託</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-bold text-[#1a1a2e] mb-2">4. データの保管</h2>
            <p>データは適切なセキュリティ対策を講じたサーバー上に保管されます。不正アクセス・漏洩の防止に努めます。</p>
          </section>

          <section>
            <h2 className="text-base font-bold text-[#1a1a2e] mb-2">5. ユーザーの権利</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>保有する個人データの開示請求</li>
              <li>個人データの訂正・削除請求</li>
              <li>アカウントの削除</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-bold text-[#1a1a2e] mb-2">6. Cookie・分析ツール</h2>
            <p>本サービスでは、Google Analytics（匿名化）を利用します。また、Google AdSenseによる広告を表示する場合があります。これらのサービスはCookieを使用して情報を収集することがあります。</p>
          </section>

          <section>
            <h2 className="text-base font-bold text-[#1a1a2e] mb-2">7. お問い合わせ</h2>
            <p>プライバシーに関するご質問は、管理者までご連絡ください。</p>
          </section>
        </div>
      </div>
    </div>
  );
}
