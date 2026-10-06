import { SkeletonCard } from "@/components/ui/skeleton";

export default function PortfolioLoading() {
    return (
        <div className="space-y-8 pb-10 animate-in fade-in duration-300">
            <div className="space-y-2">
                <div className="skeleton h-7 w-48 rounded-md" />
                <div className="skeleton h-4 w-72 rounded-md" />
            </div>
            <div className="flex items-center gap-4">
                <div className="skeleton h-8 w-40 rounded-md" />
                <div className="skeleton h-3 w-3 rounded-full" />
                <div className="skeleton h-8 w-40 rounded-md" />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2"><SkeletonCard /></div>
                <SkeletonCard />
            </div>
        </div>
    );
}
