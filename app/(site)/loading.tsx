import { CardSkeleton } from "@/components/ui/primitives";

/** 前台加载骨架（DESIGN.md §8 五态之 Loading） */
export default function SiteLoading() {
  return (
    <div className="section-y">
      <div className="container-page flex flex-col gap-8">
        <div className="flex flex-col gap-3">
          <div className="h-3 w-24 animate-pulse rounded-sm bg-surface-warm" />
          <div className="h-8 w-64 animate-pulse rounded-sm bg-surface-warm" />
          <div className="h-4 w-96 max-w-full animate-pulse rounded-sm bg-surface-warm" />
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      </div>
    </div>
  );
}
