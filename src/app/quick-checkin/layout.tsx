export default function QuickCheckinLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen bg-background flex flex-col">
            <header className="border-b border-border/50 px-4 py-3 bg-card">
                <div className="max-w-md mx-auto flex items-center gap-2">
                    <div className="w-7 h-7 bg-primary rounded-md flex items-center justify-center">
                        <span className="text-primary-foreground font-bold text-xs">T</span>
                    </div>
                    <span className="text-sm font-semibold text-foreground">Tulie Mentoring</span>
                </div>
            </header>
            <main className="flex-1 flex items-center justify-center p-4">
                {children}
            </main>
        </div>
    );
}
