export default function Loading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-4">
        <div className="h-16 w-full bg-gray-200 rounded animate-pulse" />
        <div className="h-16 w-full bg-gray-200 rounded animate-pulse" />
        <div className="h-10 w-32 bg-gray-200 rounded mx-auto animate-pulse" />
      </div>
    </div>
  );
}