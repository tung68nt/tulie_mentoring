export default function DashboardLoading() {
    return (
        <div className="space-y-8 animate-pulse">
            {/* Header skeleton */}
            <div className="space-y-2">
                <div className="h-8 w-64 bg-border rounded-md" />
                <div className="h-4 w-48 bg-border rounded-md" />
            </div>

            {/* Stat cards skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="p-6 rounded-lg border border-border bg-card space-y-3">
                        <div className="h-3 w-24 bg-border rounded" />
                        <div className="h-8 w-16 bg-border rounded" />
                        <div className="h-2 w-full bg-border rounded-full" />
                    </div>
                ))}
            </div>

            {/* Content skeleton */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {[...Array(2)].map((_, i) => (
                    <div key={i} className="p-8 rounded-lg border border-border bg-card space-y-4">
                        <div className="h-5 w-40 bg-border rounded" />
                        <div className="space-y-3">
                            {[...Array(3)].map((_, j) => (
                                <div key={j} className="h-12 w-full bg-border rounded-md" />
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
