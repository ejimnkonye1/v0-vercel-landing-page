function Skeleton({ className = '', style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <div
      style={style}
      className={`animate-pulse rounded-lg bg-gray-200 dark:bg-[#111111] ${className}`}
    />
  )
}

function CardSkeleton() {
  return (
    <div className="rounded-2xl p-5 bg-gray-50 border border-gray-200 dark:bg-[#0A0A0A] dark:border-[#1A1A1A]">
      <Skeleton className="h-3 w-20 mb-3" />
      <Skeleton className="h-7 w-28 mb-2" />
      <Skeleton className="h-3 w-16" />
    </div>
  )
}

function ChartSkeleton({ tall = false }: { tall?: boolean }) {
  return (
    <div className={`rounded-2xl p-6 ${tall ? 'h-72' : 'h-56'} bg-gray-50 border border-gray-200 dark:bg-[#0A0A0A] dark:border-[#1A1A1A]`}>
      <Skeleton className="h-4 w-32 mb-4" />
      <Skeleton className="h-3 w-48 mb-6" />
      <div className="flex items-end gap-2 h-[60%]">
        {[40, 65, 50, 80, 55, 70, 45, 60, 75, 50, 65, 85].map((h, i) => (
          <Skeleton key={i} className="flex-1" style={{ height: `${h}%` }} />
        ))}
      </div>
    </div>
  )
}

function SideWidgetSkeleton() {
  return (
    <div className="rounded-2xl p-5 bg-gray-50 border border-gray-200 dark:bg-[#0A0A0A] dark:border-[#1A1A1A]">
      <Skeleton className="h-4 w-36 mb-4" />
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-3">
            <Skeleton className="h-9 w-9 rounded-lg flex-shrink-0" />
            <div className="flex-1">
              <Skeleton className="h-3 w-24 mb-2" />
              <Skeleton className="h-2.5 w-16" />
            </div>
            <Skeleton className="h-3 w-14" />
          </div>
        ))}
      </div>
    </div>
  )
}

function SubscriptionCardSkeleton() {
  return (
    <div className="rounded-2xl p-5 bg-gray-50 border border-gray-200 dark:bg-[#0A0A0A] dark:border-[#1A1A1A]">
      <div className="flex items-center gap-3 mb-4">
        <Skeleton className="h-10 w-10 rounded-xl flex-shrink-0" />
        <div className="flex-1">
          <Skeleton className="h-4 w-24 mb-2" />
          <Skeleton className="h-3 w-16" />
        </div>
        <Skeleton className="h-5 w-14 rounded-full" />
      </div>
      <Skeleton className="h-3 w-full mb-2" />
      <Skeleton className="h-3 w-3/4" />
    </div>
  )
}

export default function DashboardLoading() {
  return (
    <div className="animate-in fade-in duration-300">
      {/* Page header skeleton */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <Skeleton className="h-7 w-36 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-9 w-32 rounded-lg" />
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
      </div>

      {/* Charts + side widgets */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <div className="md:col-span-2 lg:col-span-2 space-y-4">
          <ChartSkeleton tall />
          <ChartSkeleton />
          <ChartSkeleton />
        </div>
        <div className="space-y-4">
          <SideWidgetSkeleton />
          <SideWidgetSkeleton />
          <SideWidgetSkeleton />
        </div>
      </div>

      {/* Subscription grid */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-8 w-24 rounded-lg" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <SubscriptionCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  )
}
