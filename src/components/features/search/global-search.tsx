"use client";

import { useState, useRef, useEffect } from "react";
import { Search, X, Users, Calendar, BookOpen, Target } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

interface SearchResult {
    id: string;
    title: string;
    subtitle?: string;
    href: string;
    type: "user" | "meeting" | "resource" | "goal";
}

const typeIcons = {
    user: Users,
    meeting: Calendar,
    resource: BookOpen,
    goal: Target,
};

const typeLabels = {
    user: "Người dùng",
    meeting: "Buổi họp",
    resource: "Tài liệu",
    goal: "Mục tiêu",
};

export function GlobalSearch() {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<SearchResult[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedIdx, setSelectedIdx] = useState(0);
    const [showResults, setShowResults] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const router = useRouter();

    // Keyboard shortcut to focus search
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === "k") {
                e.preventDefault();
                inputRef.current?.focus();
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, []);

    // Close dropdown on click outside
    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setShowResults(false);
            }
        };
        document.addEventListener("mousedown", handleClick);
        return () => document.removeEventListener("mousedown", handleClick);
    }, []);

    // Search with debounce
    useEffect(() => {
        if (!query.trim()) {
            setResults([]);
            setShowResults(false);
            return;
        }

        const timer = setTimeout(async () => {
            setIsLoading(true);
            try {
                const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
                if (res.ok) {
                    const data = await res.json();
                    setResults(data.results || []);
                    setSelectedIdx(0);
                    setShowResults(true);
                }
            } catch {
                setResults([]);
            } finally {
                setIsLoading(false);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [query]);

    const handleSelect = (result: SearchResult) => {
        router.push(result.href);
        setQuery("");
        setResults([]);
        setShowResults(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "ArrowDown") {
            e.preventDefault();
            setSelectedIdx(prev => Math.min(prev + 1, results.length - 1));
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setSelectedIdx(prev => Math.max(prev - 1, 0));
        } else if (e.key === "Enter" && results[selectedIdx]) {
            handleSelect(results[selectedIdx]);
        } else if (e.key === "Escape") {
            setShowResults(false);
            inputRef.current?.blur();
        }
    };

    return (
        <div ref={containerRef} className="relative">
            {/* Inline search input - always visible */}
            <div className="flex items-center gap-2 px-3 py-1.5 bg-muted/60 border border-border rounded-lg focus-within:border-primary focus-within:bg-background transition-all w-[220px] sm:w-[260px]">
                <Search className="w-3.5 h-3.5 text-muted-foreground/60 shrink-0" />
                <input
                    ref={inputRef}
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onFocus={() => { if (query.trim() && results.length > 0) setShowResults(true); }}
                    placeholder="Tìm kiếm..."
                    className="w-full text-sm bg-transparent focus:outline-none placeholder:text-muted-foreground/40 text-foreground"
                />
                {query ? (
                    <button
                        onClick={() => { setQuery(""); setResults([]); setShowResults(false); }}
                        className="p-0.5 text-muted-foreground/60 hover:text-foreground transition-colors"
                    >
                        <X className="w-3.5 h-3.5" />
                    </button>
                ) : (
                    <kbd className="hidden md:inline text-[9px] font-semibold bg-background border border-border/60 px-1.5 py-0.5 rounded text-muted-foreground/60 shrink-0">⌘K</kbd>
                )}
            </div>

            {/* Dropdown results */}
            {showResults && query && (
                <div className="absolute top-full left-0 right-0 mt-1.5 bg-card rounded-lg border border-border shadow-none overflow-hidden z-50 w-[360px]">
                    <div className="max-h-[320px] overflow-y-auto py-1">
                        {isLoading ? (
                            <div className="px-4 py-6 text-center">
                                <div className="w-4 h-4 border-2 border-border border-t-black rounded-full animate-spin mx-auto" />
                                <p className="text-xs text-muted-foreground mt-2">Đang tìm kiếm...</p>
                            </div>
                        ) : results.length === 0 ? (
                            <div className="px-4 py-6 text-center">
                                <p className="text-sm text-muted-foreground">Không tìm thấy kết quả</p>
                                <p className="text-xs text-muted-foreground mt-1">Thử từ khóa khác</p>
                            </div>
                        ) : (
                            results.map((result, idx) => {
                                const Icon = typeIcons[result.type];
                                return (
                                    <button
                                        key={result.id}
                                        onClick={() => handleSelect(result)}
                                        onMouseEnter={() => setSelectedIdx(idx)}
                                        className={cn(
                                            "w-full flex items-center gap-3 px-3 py-2 text-left transition-colors",
                                            idx === selectedIdx ? "bg-muted" : "hover:bg-muted"
                                        )}
                                    >
                                        <div className="w-7 h-7 rounded-md bg-muted border border-border flex items-center justify-center shrink-0">
                                            <Icon className="w-3.5 h-3.5 text-muted-foreground" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-foreground truncate">{result.title}</p>
                                            {result.subtitle && <p className="text-xs text-muted-foreground truncate">{result.subtitle}</p>}
                                        </div>
                                        <span className="text-[10px] text-muted-foreground shrink-0">{typeLabels[result.type]}</span>
                                    </button>
                                );
                            })
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
