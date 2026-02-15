function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-lg bg-gray-200 dark:bg-[#111111] ${className}`}
    />
  )
}

export default function SubscriptionDetailLoading() {
  return (
    <div className="animate-in fade-in duration-300">
      {/* Back button */}
      <Skeleton className="h-4 w-20 mb-6" />

      {/* Header with logo + name */}
      <div className="flex items-center gap-4 mb-8">
        <Skeleton className="h-14 w-14 rounded-2xl flex-shrink-0" />
        <div>
          <Skeleton className="h-6 w-40 mb-2" />
          <Skeleton className="h-4 w-24" />
        </div>
      </div>

      {/* Details card */}
      <div className="rounded-2xl p-6 mb-4 bg-gray-50 border border-gray-200 dark:bg-[#0A0A0A] dark:border-[#1A1A1A]">
        <div className="grid grid-cols-2 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i}>
              <Skeleton className="h-3 w-20 mb-2" />
              <Skeleton className="h-5 w-32" />
            </div>
          ))}
        </div>
      </div>

      {/* Notes / actions card */}
      <div className="rounded-2xl p-6 bg-gray-50 border border-gray-200 dark:bg-[#0A0A0A] dark:border-[#1A1A1A]">
        <Skeleton className="h-4 w-20 mb-4" />
        <Skeleton className="h-3 w-full mb-2" />
        <Skeleton className="h-3 w-3/4 mb-2" />
        <Skeleton className="h-3 w-1/2" />
      </div>
    </div>
  )
}
