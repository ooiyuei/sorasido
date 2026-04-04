import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <h2 className="text-6xl font-bold text-gray-300 mb-4">404</h2>
        <h3 className="text-xl font-bold text-gray-800 mb-4">
          ページが見つかりません
        </h3>
        <p className="text-gray-600 mb-6">
          お探しのページは存在しないか、移動した可能性があります。
        </p>
        <Link
          href="/"
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors inline-block"
        >
          トップページへ戻る
        </Link>
      </div>
    </div>
  );
}
