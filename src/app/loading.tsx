export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="w-full max-w-md mx-auto p-6 space-y-4">
        <div className="h-8 bg-gray-200 rounded animate-pulse w-3/4 mx-auto" />
        <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2 mx-auto" />
        <div className="space-y-3 mt-8">
          <div className="h-24 bg-gray-200 rounded-lg animate-pulse" />
          <div className="h-24 bg-gray-200 rounded-lg animate-pulse" />
          <div className="h-24 bg-gray-200 rounded-lg animate-pulse" />
        </div>
        <div className="h-12 bg-gray-200 rounded-lg animate-pulse mt-6" />
      </div>
    </div>
  );
}
