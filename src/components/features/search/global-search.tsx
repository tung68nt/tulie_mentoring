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
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<SearchResult[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedIdx, setSelectedIdx] = useState(0);
    const inputRef = useRef<HTMLInputElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const router = useRouter();

    // Keyboard shortcut
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === "k") {
                e.preventDefault();
                setIsOpen(true);
                setTimeout(() => inputRef.current?.focus(), 50);
            }
            if (e.key === "Escape") {
                setIsOpen(false);
                setQuery("");
                setResults([]);
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, []);

    // Search with debounce
    useEffect(() => {
        if (!query.trim()) {
            setResults([]);
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
        setIsOpen(false);
        setQuery("");
        setResults([]);
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
        }
    };

    if (!isOpen) {
        return (
            <button
                onClick={() => {
                    setIsOpen(true);
                    setTimeout(() => inputRef.current?.focus(), 50);
                }}
                className="flex items-center gap-2 px-3 py-1.5 bg-[#fafafa] border border-[#eaeaea] rounded-md text-sm text-[#999] hover:border-[#ccc] transition-all"
            >
                <Search className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Tìm kiếm...</span>
                <kbd className="hidden md:inline text-[10px] bg-white border border-[#eaeaea] px-1.5 py-0.5 rounded text-[#bbb]">⌘K</kbd>
            </button>
        );
    }

    return (
        <>
            {/* Backdrop */}
            <div className="fixed inset-0 bg-black/20 z-[100]" onClick={() => { setIsOpen(false); setQuery(""); setResults([]); }} />

            {/* Search dialog */}
            <div ref={containerRef} className="fixed top-[20%] left-1/2 -translate-x-1/2 w-full max-w-lg z-[101]">
                <div className="bg-white rounded-xl border border-[#eaeaea] shadow-2xl overflow-hidden">
                    {/* Search input */}
                    <div className="flex items-center px-4 border-b border-[#eaeaea]">
                        <Search className="w-4 h-4 text-[#999] shrink-0" />
                        <input
                            ref={inputRef}
                            value={query}
                            onChange={e => setQuery(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Tìm kiếm người dùng, buổi họp, tài liệu..."
                            className="w-full px-3 py-4 text-sm bg-transparent focus:outline-none placeholder:text-[#bbb]"
                            autoFocus
                        />
                        {query && (
                            <button onClick={() => { setQuery(""); setResults([]); }} className="p-1 text-[#999] hover:text-black">
                                <X className="w-4 h-4" />
                            </button>
                        )}
                    </div>

                    {/* Results */}
                    {query && (
                        <div className="max-h-[320px] overflow-y-auto py-2">
                            {isLoading ? (
                                <div className="px-4 py-8 text-center">
                                    <div className="w-5 h-5 border-2 border-[#eaeaea] border-t-black rounded-full animate-spin mx-auto" />
                                    <p className="text-xs text-[#999] mt-2">Đang tìm kiếm...</p>
                                </div>
                            ) : results.length === 0 ? (
                                <div className="px-4 py-8 text-center">
                                    <p className="text-sm text-[#666]">Không tìm thấy kết quả</p>
                                    <p className="text-xs text-[#999] mt-1">Thử tìm kiếm bằng từ khóa khác</p>
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
                                                "w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors",
                                                idx === selectedIdx ? "bg-[#fafafa]" : "hover:bg-[#fafafa]"
                                            )}
                                        >
                                            <div className="w-8 h-8 rounded-md bg-[#f5f5f5] border border-[#eaeaea] flex items-center justify-center shrink-0">
                                                <Icon className="w-4 h-4 text-[#666]" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-black truncate">{result.title}</p>
                                                {result.subtitle && <p className="text-xs text-[#999] truncate">{result.subtitle}</p>}
                                            </div>
                                            <span className="text-[10px] text-[#bbb] shrink-0">{typeLabels[result.type]}</span>
                                        </button>
                                    );
                                })
                            )}
                        </div>
                    )}

                    {/* Footer hint */}
                    {!query && (
                        <div className="px-4 py-3 text-center text-[10px] text-[#bbb]">
                            <kbd className="bg-[#fafafa] border border-[#eaeaea] px-1.5 py-0.5 rounded">↑↓</kbd> để chọn,{" "}
                            <kbd className="bg-[#fafafa] border border-[#eaeaea] px-1.5 py-0.5 rounded">Enter</kbd> để mở,{" "}
                            <kbd className="bg-[#fafafa] border border-[#eaeaea] px-1.5 py-0.5 rounded">Esc</kbd> để đóng
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
