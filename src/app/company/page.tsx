import { Metadata } from 'next'

export const metadata: Metadata = {
  title: '運営会社情報',
}

export default function CompanyPage() {
  return (
    <main className="max-w-md mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold mb-8">運営会社情報</h1>
      <table className="w-full text-sm">
        <tbody className="divide-y">
          <tr><td className="py-3 text-gray-500 w-28">運営者</td><td className="py-3">大井 悠衛</td></tr>
          <tr><td className="py-3 text-gray-500">所在地</td><td className="py-3">東京都</td></tr>
          <tr><td className="py-3 text-gray-500">お問い合わせ</td><td className="py-3">アプリ内フォームまたはメールにて</td></tr>
        </tbody>
      </table>
    </main>
  )
}
