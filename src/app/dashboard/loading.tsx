import { Skeleton, SidebarSkeleton } from "@/components/ui/Skeleton";

export default function DashboardLoading() {
  return (
    <div className="flex min-h-screen flex-col bg-background md:flex-row">
      <SidebarSkeleton />
      <div className="flex-1 px-4 py-9 sm:px-8">
        <div className="mb-8 flex items-center gap-4">
          <Skeleton className="h-12 w-12 shrink-0 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-7 w-56" />
            <Skeleton className="h-4 w-40" />
          </div>
        </div>
        <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-[104px] rounded-[18px]" />
          ))}
        </div>
        <Skeleton className="mb-6 h-[128px] rounded-[20px]" />
        <Skeleton className="h-[260px] rounded-[18px]" />
      </div>
    </div>
  );
}
