"use client";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          エラーが発生しました
        </h2>
        <p className="text-gray-600 mb-6">
          予期しないエラーが発生しました。もう一度お試しください。
        </p>
        <button
          onClick={reset}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          もう一度試す
        </button>
      </div>
    </div>
  );
}
