function Skeleton({ className = '', style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <div
      style={style}
      className={`animate-pulse rounded-lg bg-gray-200 dark:bg-[#111111] ${className}`}
    />
  )
}

function ChartCardSkeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`rounded-2xl p-6 bg-gray-50 border border-gray-200 dark:bg-[#0A0A0A] dark:border-[#1A1A1A] ${className}`}>
      <Skeleton className="h-4 w-40 mb-2" />
      <Skeleton className="h-3 w-56 mb-6" />
      <div className="flex items-end gap-2 h-44">
        {[55, 70, 40, 85, 60, 75, 45, 65, 80, 50].map((h, i) => (
          <Skeleton key={i} className="flex-1 rounded-sm" style={{ height: `${h}%` }} />
        ))}
      </div>
    </div>
  )
}

function PieChartSkeleton() {
  return (
    <div className="rounded-2xl p-6 bg-gray-50 border border-gray-200 dark:bg-[#0A0A0A] dark:border-[#1A1A1A]">
      <Skeleton className="h-4 w-44 mb-2" />
      <Skeleton className="h-3 w-52 mb-6" />
      <div className="flex items-center justify-center">
        <Skeleton className="h-48 w-48 rounded-full" />
      </div>
      <div className="mt-6 grid grid-cols-2 gap-2">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex items-center gap-2">
            <Skeleton className="h-3 w-3 rounded-full flex-shrink-0" />
            <Skeleton className="h-3 w-16" />
          </div>
        ))}
      </div>
    </div>
  )
}

function InsightsCardSkeleton() {
  return (
    <div className="rounded-2xl p-6 bg-gray-50 border border-gray-200 dark:bg-[#0A0A0A] dark:border-[#1A1A1A]">
      <Skeleton className="h-4 w-28 mb-4" />
      <div className="space-y-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex items-start gap-3">
            <Skeleton className="h-5 w-5 rounded-full flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <Skeleton className="h-3 w-full mb-1.5" />
              <Skeleton className="h-3 w-3/4" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function AnalyticsLoading() {
  return (
    <div className="animate-in fade-in duration-300">
      {/* Header */}
      <div className="mb-8">
        <Skeleton className="h-7 w-32 mb-2" />
        <Skeleton className="h-4 w-72" />
      </div>

      {/* Charts grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        <PieChartSkeleton />
        <ChartCardSkeleton />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <InsightsCardSkeleton />
        <ChartCardSkeleton className="h-auto" />
      </div>
    </div>
  )
}
