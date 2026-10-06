export default function QuickCheckinLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen bg-background flex flex-col">
            <header className="border-b border-border/50 px-4 py-3 bg-card">
                <div className="max-w-md mx-auto flex items-center gap-2">
                    <div className="bg-white p-1 rounded-lg border border-border/50 shadow-2xs flex items-center justify-center shrink-0">
                        <img src="/logo.png" alt="IMP 2026" className="h-6 w-auto object-contain" />
                    </div>
                    <span className="text-sm font-bold text-foreground">IMP 2026</span>
                </div>
            </header>
            <main className="flex-1 flex items-center justify-center p-4">
                {children}
            </main>
        </div>
    );
}
