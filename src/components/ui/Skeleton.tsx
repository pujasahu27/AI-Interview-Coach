export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-md bg-line2 ${className}`} />;
}

export function SidebarSkeleton() {
  return (
    <>
      <div className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-2.5 border-b border-line bg-surface px-4 md:hidden">
        <Skeleton className="h-5 w-5 shrink-0 rounded-full" />
        <Skeleton className="h-4 w-36" />
      </div>
      <aside className="hidden h-screen w-[236px] shrink-0 flex-col border-r border-line bg-surface p-3 md:sticky md:top-0 md:flex">
        <div className="flex items-center gap-2 px-2 pb-5 pt-2">
          <Skeleton className="h-[22px] w-[22px] shrink-0 rounded-full" />
          <Skeleton className="h-4 w-32" />
        </div>
        <Skeleton className="mb-5 h-9 w-full rounded-full" />
        <div className="space-y-1.5">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-8 w-full rounded-r-lg" />
          ))}
        </div>
        <Skeleton className="mt-3 h-8 w-full rounded-r-lg" />
        <div className="mt-auto flex items-center gap-2.5 border-t border-line pt-3.5">
          <Skeleton className="h-9 w-9 shrink-0 rounded-full" />
          <div className="flex-1 space-y-1.5">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-2.5 w-16" />
          </div>
        </div>
      </aside>
    </>
  );
}
