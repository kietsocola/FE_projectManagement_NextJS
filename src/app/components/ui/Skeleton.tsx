export function Skeleton({ className }: { className?: string }) {
  return <div className={`bg-gray-200 animate-pulse ${className}`} />;
}