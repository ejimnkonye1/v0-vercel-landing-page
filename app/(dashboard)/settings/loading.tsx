function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-lg bg-gray-200 dark:bg-[#111111] ${className}`}
    />
  )
}

function SectionSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div className="rounded-2xl p-6 bg-gray-50 border border-gray-200 dark:bg-[#0A0A0A] dark:border-[#1A1A1A]">
      <Skeleton className="h-4 w-40 mb-5" />
      <div className="space-y-5">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex items-center justify-between">
            <div>
              <Skeleton className="h-3.5 w-44 mb-2" />
              <Skeleton className="h-2.5 w-64" />
            </div>
            <Skeleton className="h-8 w-12 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  )
}

export default function SettingsLoading() {
  return (
    <div className="animate-in fade-in duration-300">
      {/* Header */}
      <div className="mb-8">
        <Skeleton className="h-7 w-28 mb-2" />
        <Skeleton className="h-4 w-64" />
      </div>

      <div className="max-w-2xl space-y-6">
        <SectionSkeleton rows={1} />
        <SectionSkeleton rows={1} />
        <SectionSkeleton rows={4} />
        <SectionSkeleton rows={1} />
        <SectionSkeleton rows={1} />
        <SectionSkeleton rows={2} />
      </div>
    </div>
  )
}
