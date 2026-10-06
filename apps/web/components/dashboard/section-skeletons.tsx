import { Skeleton } from "@/components/ui/skeleton";

export function HeaderSkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton className="h-3 w-24" />
      <Skeleton className="h-10 w-2/3 max-w-md" />
      <Skeleton className="h-4 w-1/2 max-w-sm" />
    </div>
  );
}

export function StatCardsSkeleton() {
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {[0, 1, 2].map((i) => (
        <Skeleton key={i} className="h-24 rounded-xl" />
      ))}
    </div>
  );
}

export function CourseGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} className="h-28 rounded-xl" />
      ))}
    </div>
  );
}

export function ListSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className="h-16 rounded-lg" />
      ))}
    </div>
  );
}

export function FiltersSkeleton() {
  return (
    <div className="flex flex-wrap gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface)]/80 p-4">
      <Skeleton className="h-10 min-w-[160px] flex-1" />
      <Skeleton className="h-10 min-w-[140px]" />
      <Skeleton className="h-10 min-w-[180px] flex-1" />
      <Skeleton className="h-10 w-24" />
    </div>
  );
}
