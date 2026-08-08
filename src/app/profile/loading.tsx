import { Skeleton, SidebarSkeleton } from "@/components/ui/Skeleton";

export default function ProfileLoading() {
  return (
    <div className="flex min-h-screen flex-col bg-background md:flex-row">
      <SidebarSkeleton />
      <div className="flex-1 px-4 py-9 sm:px-8">
        <Skeleton className="mb-7 h-8 w-32" />
        <div className="mx-auto max-w-xl space-y-4">
          <Skeleton className="h-[92px] rounded-[20px]" />
          <Skeleton className="h-[420px] rounded-[20px]" />
        </div>
      </div>
    </div>
  );
}
