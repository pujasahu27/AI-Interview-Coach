import { Skeleton, SidebarSkeleton } from "@/components/ui/Skeleton";

export default function PaywallLoading() {
  return (
    <div className="flex min-h-screen flex-col bg-background md:flex-row">
      <SidebarSkeleton />
      <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-center justify-center gap-6 px-6 py-16 text-center">
        <Skeleton className="h-16 w-16 rounded-full" />
        <Skeleton className="h-8 w-72" />
        <Skeleton className="h-4 w-96 max-w-full" />
        <div className="mt-4 grid w-full gap-4 sm:grid-cols-2">
          {[0, 1].map((i) => (
            <Skeleton key={i} className="h-[220px] rounded-[20px]" />
          ))}
        </div>
      </div>
    </div>
  );
}
