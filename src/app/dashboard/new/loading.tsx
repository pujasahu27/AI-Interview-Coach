import { Skeleton } from "@/components/ui/Skeleton";

export default function NewInterviewLoading() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <div className="flex h-[60px] shrink-0 items-center justify-between border-b border-line bg-background/80 px-7">
        <div className="flex items-center gap-2">
          <Skeleton className="h-[18px] w-[18px] shrink-0 rounded-full" />
          <Skeleton className="h-3.5 w-32" />
        </div>
        <Skeleton className="h-3.5 w-28" />
      </div>
      <div className="flex flex-1 flex-col items-center px-6 py-14">
        <div className="w-full max-w-xl space-y-8">
          <Skeleton className="h-8 w-full max-w-md mx-auto" />
          <div className="flex flex-col items-center gap-4">
            <Skeleton className="h-[72px] w-[72px] rounded-full" />
            <Skeleton className="h-7 w-64" />
            <Skeleton className="h-4 w-80 max-w-full" />
          </div>
          <Skeleton className="h-[260px] rounded-[20px]" />
        </div>
      </div>
    </div>
  );
}
