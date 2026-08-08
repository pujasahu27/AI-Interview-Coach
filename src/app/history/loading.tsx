import { Skeleton, SidebarSkeleton } from "@/components/ui/Skeleton";

export default function HistoryLoading() {
  return (
    <div className="flex min-h-screen flex-col bg-background md:flex-row">
      <SidebarSkeleton />
      <div className="flex-1 px-4 py-9 sm:px-8">
        <Skeleton className="mb-1 h-8 w-64" />
        <Skeleton className="mb-7 h-4 w-72" />
        <div className="divide-y divide-line rounded-xl border border-line2 bg-surface">
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center gap-3.5 px-4 py-3.5">
              <Skeleton className="h-10 w-10 shrink-0 rounded-full" />
              <div className="min-w-0 flex-1 space-y-2">
                <Skeleton className="h-3.5 w-32" />
                <Skeleton className="h-3 w-20" />
              </div>
              <Skeleton className="h-5 w-16 shrink-0 rounded-full" />
              <Skeleton className="h-4 w-8 shrink-0" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
