import { SkeletonCard } from "@/components/ui/skeleton";

export default function MentorLoading() {
    return (
        <div className="space-y-8 pb-10 animate-in fade-in duration-300">
            <div className="space-y-2">
                <div className="skeleton h-7 w-56 rounded-md" />
                <div className="skeleton h-4 w-72 rounded-md" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <SkeletonCard />
                <SkeletonCard />
            </div>
        </div>
    );
}
