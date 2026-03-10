import { SkeletonCard, SkeletonTable } from "@/components/ui/skeleton";

export default function AdminLoading() {
    return (
        <div className="space-y-8 pb-10 animate-in fade-in duration-300">
            {/* Header skeleton */}
            <div className="flex items-end justify-between">
                <div className="space-y-2">
                    <div className="skeleton h-7 w-48 rounded-md" />
                    <div className="skeleton h-4 w-64 rounded-md" />
                </div>
                <div className="flex gap-2">
                    <div className="skeleton h-9 w-40 rounded-md" />
                    <div className="skeleton h-9 w-36 rounded-md" />
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}
            </div>

            {/* Content */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                <div className="lg:col-span-3">
                    <SkeletonTable rows={5} />
                </div>
                <div className="lg:col-span-2">
                    <SkeletonCard />
                    <div className="mt-4"><SkeletonCard /></div>
                </div>
            </div>
        </div>
    );
}
