"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
    ChevronLeft,
    Save,
    Play,
    Settings,
    Trash2,
    Globe,
    Lock,
    Clock,
    User,
    PanelLeft,
    Plus,
    X,
    Columns,
    Layout
} from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from 'next/link';
import * as actions from '@/lib/actions/slide';
import SlidePresenter from './SlidePresenter';
import SlideBlockEditor from './SlideBlockEditor';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import DOMPurify from 'isomorphic-dompurify';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

interface SlideEditorProps {
    id: string;
}

export default function SlideEditor({ id }: SlideEditorProps) {
    const router = useRouter();
    const [slide, setSlide] = useState<any>(null);
    const [content, setContent] = useState('');
    const [title, setTitle] = useState('');
    const [theme, setTheme] = useState('white');
    const [status, setStatus] = useState('private');
    const [isSaving, setIsSaving] = useState(false);
    const [isPreviewing, setIsPreviewing] = useState(false);
    const [isLoaded, setIsLoaded] = useState(false);
    const [showNavigator, setShowNavigator] = useState(true);
    const [currentSlideIdx, setCurrentSlideIdx] = useState(0);

    const slides = useMemo(() => {
        // Robust splitting that handles both HTML dividers and standard markdown separators
        return content
            .split(/(?:<hr\s*\/?>|(?:\r?\n|^)[-*]{3,}\s*(?:\r?\n|$))/i)
            .map(s => s.trim())
            .filter(s => s.length > 0);
    }, [content]);

    useEffect(() => {
        const loadSlide = async () => {
            if (id === 'new') {
                setTitle('New Presentation');
                setContent('<h1>Title Slide</h1><p>Subheading here...</p><hr /><h2>Slide 2</h2><ul><li>Point 1</li><li>Point 2</li></ul>');
                setIsLoaded(true);
                return;
            }

            try {
                const data = await actions.getSlideDetail(id);
                setSlide(data);
                setTitle(data.title);
                setContent(data.content || '');
                setTheme(data.theme || 'white');
                setStatus(data.status || 'private');
            } catch (error) {
                console.error('Failed to load slide:', error);
                router.push('/slides');
            } finally {
                setIsLoaded(true);
            }
        };

        loadSlide();
    }, [id, router]);

    const handleSave = async (silent = false) => {
        if (!silent) setIsSaving(true);
        try {
            if (id === 'new') {
                const newSlide = await actions.createSlide({ title, description: "" });
                await actions.updateSlide(newSlide.id, { content, theme, status });
                router.replace(`/slides/${newSlide.id}`);
                if (!silent) toast.success("Đã tạo slide mới!");
            } else {
                await actions.updateSlide(id, { title, description: "", content, theme, status });
                if (!silent) toast.success("Đã lưu thay đổi!");
            }
        } catch (error) {
            console.error('Failed to save slide:', error);
            if (!silent) toast.error("Lỗi khi lưu slide");
        } finally {
            if (!silent) setIsSaving(false);
        }
    };

    const handleDelete = async () => {
        toast("Xóa bài thuyết trình này?", {
            action: {
                label: "Xóa",
                onClick: async () => {
                    try {
                        await actions.deleteSlide(id);
                        toast.success("Đã xóa slide");
                        router.push('/slides');
                    } catch (error) {
                        console.error('Failed to delete slide:', error);
                        toast.error("Lỗi khi xóa slide");
                    }
                }
            },
            cancel: {
                label: "Hủy",
                onClick: () => { }
            }
        });
    };

    const layouts = [
        { name: "Title Slide", content: "<h1>Title Slide</h1><p>Subtitle here...</p>" },
        { name: "Content", content: "<h2>Section Header</h2><ul><li>Key point 1</li><li>Key point 2</li><li>Key point 3</li></ul>" },
        { name: "Two Columns", content: "<h2>Two Column Layout</h2><p>[cols]</p><p>[col]</p><h3>Left Column</h3><ul><li>Info A</li><li>Info B</li></ul><p>[/col]</p><p>[col]</p><h3>Right Column</h3><ul><li>Detail 1</li><li>Detail 2</li></ul><p>[/col]</p><p>[/cols]</p>" },
        { name: "Quote", content: "<h2>Inspiring Quote</h2><blockquote>The best way to predict the future is to create it. <br/> — Peter Drucker</blockquote>" }
    ];

    const addSlide = (layoutIndex: number = 0) => {
        const newSlideContent = "\n<hr />\n" + layouts[layoutIndex].content;
        setContent(content + newSlideContent);
    };

    const removeSlide = (idx: number) => {
        if (slides.length <= 1) {
            toast.error("Không thể xóa slide cuối cùng");
            return;
        }

        toast("Xóa slide này?", {
            action: {
                label: "Xóa",
                onClick: () => {
                    const newSlides = [...slides];
                    newSlides.splice(idx, 1);
                    setContent(newSlides.join("\n<hr />\n"));
                    if (currentSlideIdx >= newSlides.length) {
                        setCurrentSlideIdx(Math.max(0, newSlides.length - 1));
                    }
                }
            },
            cancel: {
                label: "Hủy",
                onClick: () => { }
            }
        });
    };

    if (!isLoaded) return (
        <div className="flex flex-col items-center justify-center p-20 gap-4">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            <p className="text-muted-foreground font-medium text-sm">Đang chuẩn bị trình biên tập...</p>
        </div>
    );

    return (
        <div className="flex flex-col h-[calc(100vh-88px-40px)] gap-4 px-4 pb-4">
            {/* Toolbar Top */}
            <div className="flex items-center justify-between py-2 border-b">
                <div className="flex items-center gap-3">
                    <Link href="/slides">
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                            <ChevronLeft className="w-4 h-4" />
                        </Button>
                    </Link>
                    <div className="h-4 w-px bg-border" />
                    <input
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="bg-transparent border-none text-sm font-semibold focus:ring-0 p-0 text-foreground w-[200px] md:w-[300px] placeholder:text-muted-foreground/30"
                        placeholder="Tên bài thuyết trình..."
                    />
                </div>

                <div className="flex items-center gap-2">
                    <Button
                        variant="ghost"
                        size="sm"
                        className={`h-8 gap-2 px-3 ${showNavigator ? 'bg-muted' : ''}`}
                        onClick={() => setShowNavigator(!showNavigator)}
                    >
                        <PanelLeft className="w-4 h-4" />
                        <span className="hidden sm:inline">Navigator</span>
                    </Button>

                    <Dialog>
                        <DialogTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 gap-2">
                                <Layout className="w-4 h-4" />
                                <span className="hidden sm:inline">Help Markup</span>
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[500px]">
                            <DialogHeader>
                                <DialogTitle>Cấu trúc chia cột (Markup)</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4 py-4 text-sm">
                                <p>Sử dụng các thẻ sau để chia nội dung slide thành các cột:</p>
                                <div className="p-3 bg-muted rounded-md font-mono text-xs space-y-2">
                                    <p className="text-primary font-bold">[cols]</p>
                                    <p className="pl-4 text-emerald-600 font-bold">[col]</p>
                                    <p className="pl-8 text-muted-foreground">Nội dung cột trái...</p>
                                    <p className="pl-4 text-emerald-600 font-bold">[/col]</p>
                                    <p className="pl-4 text-emerald-600 font-bold">[col]</p>
                                    <p className="pl-8 text-muted-foreground">Nội dung cột phải...</p>
                                    <p className="pl-4 text-emerald-600 font-bold">[/col]</p>
                                    <p className="text-primary font-bold">[/cols]</p>
                                </div>
                                <p className="text-xs text-muted-foreground italic">Lưu ý: Bạn có thể dùng [cols-3] để chia 3 cột.</p>
                            </div>
                        </DialogContent>
                    </Dialog>

                    <Dialog>
                        <DialogTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 gap-2">
                                <Settings className="w-4 h-4" />
                                <span className="hidden sm:inline">Settings</span>
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[400px] shadow-none border-border">
                            <DialogHeader>
                                <DialogTitle>Presentation Settings</DialogTitle>
                            </DialogHeader>
                            <div className="grid gap-5 py-4">
                                <div className="space-y-4">
                                    <Label className="text-[13px] font-semibold text-foreground/90">
                                        Presentation Theme
                                    </Label>
                                    <div className="grid grid-cols-2 gap-3">
                                        {[
                                            { id: 'white', name: 'Light Theme', bg: '#fff' },
                                            { id: 'black', name: 'Dark Theme', bg: '#000' },
                                        ].map(t => (
                                            <button
                                                key={t.id}
                                                className={`group relative flex flex-col items-center gap-2 p-2 rounded-lg border-2 shadow-none transition-all ${theme === t.id ? 'border-primary bg-primary/5 ring-4 ring-primary/10' : 'border-border hover:border-muted-foreground/30 bg-background'}`}
                                                onClick={() => setTheme(t.id)}
                                            >
                                                <div
                                                    className="w-full aspect-video rounded-md border shadow-none transition-transform group-hover:scale-105"
                                                    style={{ backgroundColor: t.bg }}
                                                />
                                                <span className={`text-[10px] font-medium ${theme === t.id ? 'text-primary' : 'text-muted-foreground'}`}>{t.name}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-3 pt-2">
                                    <Label className="text-[13px] font-semibold text-foreground/90">
                                        Custom Color
                                    </Label>
                                    <div className="flex items-center gap-2">
                                        <div className="relative flex-1">
                                            <Input
                                                type="text"
                                                value={theme.startsWith('#') ? theme : ''}
                                                onChange={(e) => setTheme(e.target.value)}
                                                placeholder="#hexcode"
                                                className="pl-7 h-9 text-xs shadow-none"
                                            />
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/50 font-mono text-[10px]">#</span>
                                        </div>
                                        <div className="relative">
                                            <input
                                                type="color"
                                                value={theme.startsWith('#') ? theme : '#ffffff'}
                                                onChange={(e) => setTheme(e.target.value)}
                                                className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
                                            />
                                            <div
                                                className="h-9 w-9 border rounded-md shadow-none"
                                                style={{ backgroundColor: theme.startsWith('#') ? theme : '#ffffff' }}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-3 pt-5 border-t">
                                    <Label className="text-[13px] font-semibold text-foreground/90">
                                        Presentation Info
                                    </Label>
                                    <div className="grid gap-2">
                                        <div className="flex items-center justify-between text-[12px] text-muted-foreground bg-muted/20 p-2 rounded-md">
                                            <div className="flex items-center gap-2">
                                                <User className="w-3.5 h-3.5" />
                                                <span>Author</span>
                                            </div>
                                            <span className="font-medium text-foreground">{slide?.creator?.firstName || 'Current User'}</span>
                                        </div>
                                        <div className="flex items-center justify-between text-[12px] text-muted-foreground bg-muted/20 p-2 rounded-md">
                                            <div className="flex items-center gap-2">
                                                <Clock className="w-3.5 h-3.5" />
                                                <span>Updated</span>
                                            </div>
                                            <span className="font-medium text-foreground">{slide ? new Date(slide.updatedAt).toLocaleDateString() : 'Just now'}</span>
                                        </div>
                                        <div
                                            className="flex items-center justify-between text-[12px] text-muted-foreground bg-muted/20 p-2 rounded-md cursor-pointer hover:bg-muted/40 transition-colors"
                                            onClick={() => setStatus(status === 'private' ? 'public' : 'private')}
                                        >
                                            <div className="flex items-center gap-2">
                                                {status === 'private' ? <Lock className="w-3.5 h-3.5" /> : <Globe className="w-3.5 h-3.5" />}
                                                <span>Visibility</span>
                                            </div>
                                            <span className={`font-semibold capitalize ${status === 'public' ? 'text-green-600' : 'text-amber-600'}`}>{status}</span>
                                        </div>
                                    </div>
                                </div>
                                {id !== 'new' && (
                                    <div className="pt-4 border-t">
                                        <Button variant="ghost" size="sm" className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50 h-8 gap-2" onClick={handleDelete}>
                                            <Trash2 className="w-4 h-4" />
                                            Delete Presentation
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </DialogContent>
                    </Dialog>

                    <div className="w-px h-4 bg-border mx-1" />

                    <Button
                        variant="outline"
                        size="sm"
                        className="h-8 gap-2 px-4 shadow-none"
                        onClick={() => setIsPreviewing(true)}
                    >
                        <Play className="w-4 h-4 fill-current" />
                        Present
                    </Button>
                    <Button
                        size="sm"
                        className="h-8 gap-2 px-5 shadow-none"
                        onClick={() => handleSave()}
                        disabled={isSaving}
                    >
                        {isSaving ? <div className="h-4 w-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
                        Save
                    </Button>
                </div>
            </div>

            {/* Main Design Area */}
            <div className="flex-1 min-h-0 flex gap-4">
                {/* Slide Navigator Sidebar */}
                {
                    showNavigator && (
                        <div className="w-56 flex-shrink-0 flex flex-col gap-3 custom-scrollbar overflow-y-auto">
                            {slides.map((s, idx) => (
                                <div key={idx} className="group relative">
                                    <span className="absolute -left-3 top-2 text-[10px] font-medium text-muted-foreground/40">{idx + 1}</span>
                                    <div
                                        className={`w-full aspect-[16/9] bg-background border-2 rounded-xl p-3 overflow-hidden cursor-pointer transition-all ${idx === currentSlideIdx ? 'border-primary' : 'border-border hover:border-muted-foreground/30'}`}
                                        onClick={() => {
                                            setCurrentSlideIdx(idx);
                                        }}
                                    >
                                        <div
                                            className="scale-[0.25] origin-top-left w-[400%] h-[400%] p-8 text-[12px] max-w-none pointer-events-none overflow-hidden"
                                            style={{
                                                backgroundColor: theme.startsWith('#') ? theme : (theme === 'white' ? '#fff' : (theme === 'black' ? '#000' : '#fff')),
                                                color: (['black', 'night', 'moon', 'blood', 'league'].includes(theme) || (theme.startsWith('#') && (0.299 * parseInt(theme.slice(1, 3), 16) + 0.587 * parseInt(theme.slice(3, 5), 16) + 0.114 * parseInt(theme.slice(5, 7), 16)) / 255 < 0.5)) ? '#ffffff' : '#1a1a1a',
                                                fontFamily: 'inherit'
                                            }}
                                        >
                                            <div
                                                dangerouslySetInnerHTML={{
                                                    __html: DOMPurify.sanitize((s.includes('<p>') || s.includes('<h1>') || s.includes('<ul>')) ? s
                                                        .replace(/<p>\s*\[cols(-3)?\]\s*<\/p>|\[cols(-3)?\]/gi, '<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(0,1fr)); gap: 20px;">')
                                                        .replace(/<p>\s*\[col\]\s*<\/p>|\[col\]/gi, '<div>')
                                                        .replace(/<p>\s*\[\/col\]\s*<\/p>|\[\/col\]/gi, '</div>')
                                                        .replace(/<p>\s*\[\/cols\]\s*<\/p>|\[\/cols\]/gi, '</div>')
                                                        : s.replace(/^# (.*$)/gm, '<h1 style="font-size: 3.5em; font-weight: bold; margin-bottom: 0.5em; line-height: 1.2;">$1</h1>')
                                                            .replace(/^## (.*$)/gm, '<h2 style="font-size: 2.8em; font-weight: bold; margin-bottom: 0.5em; line-height: 1.2;">$1</h2>')
                                                            .replace(/^### (.*$)/gm, '<h3 style="font-size: 2.2em; font-weight: bold; margin-bottom: 0.5em; line-height: 1.2;">$1</h3>')
                                                            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                                                            .replace(/\*(.*?)\*/g, '<em>$1</em>')
                                                            .replace(/\[([^\]]+)\]\(textColor=([^\)]+)\)/g, '<span class="bn-color-$2">$1</span>')
                                                            .replace(/\\*\[cols-3\]\\*/gi, '<div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 20px;">')
                                                            .replace(/\\*\[cols\]\\*/gi, '<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">')
                                                            .replace(/\\*\[col\]\\*/gi, '<div>')
                                                            .replace(/\\*\[\/col\]\\*/gi, '</div>')
                                                            .replace(/\\*\[\/cols\]\\*/gi, '</div>')
                                                            .replace(/\n/g, '<br/>'),
                                                        { ADD_TAGS: ['div', 'span'], ADD_ATTR: ['style', 'class'] }
                                                    )
                                                }}
                                            />
                                        </div>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="absolute top-1 right-1 h-6 w-6 rounded-md opacity-0 group-hover:opacity-100 transition-opacity bg-background/80 hover:bg-destructive hover:text-destructive-foreground border border-border"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            removeSlide(idx);
                                        }}
                                    >
                                        <Trash2 className="w-3 h-3" />
                                    </Button>
                                </div>
                            ))}
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className="w-full h-12 flex items-center justify-center gap-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-all text-xs border-2 border-dashed border-border shadow-none shrink-0"
                                    >
                                        <Plus className="w-4 h-4" />
                                        Add Slide
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-56">
                                    {layouts.map((l, lidx) => (
                                        <DropdownMenuItem
                                            key={lidx}
                                            className="gap-2"
                                            onClick={() => {
                                                addSlide(lidx);
                                                setTimeout(() => setCurrentSlideIdx(slides.length), 0);
                                            }}
                                        >
                                            {l.name === "Two Columns" ? <Columns className="w-4 h-4" /> : <Layout className="w-4 h-4" />}
                                            {l.name}
                                        </DropdownMenuItem>
                                    ))}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    )
                }

                {/* Editor Surface */}
                <div className="flex-1 min-h-0 flex flex-col gap-4">
                    <Card className="flex-1 rounded-xl overflow-hidden border flex flex-col bg-background shadow-none">
                        {/* BlockNote Editor */}
                        <SlideBlockEditor
                            content={content}
                            onChange={(newMarkdown) => setContent(newMarkdown)}
                            currentSlideIdx={currentSlideIdx}
                        />
                    </Card>
                </div>
            </div>

            {/* Presentation Overlay */}
            {isPreviewing && (
                <SlidePresenter
                    content={content}
                    theme={theme}
                    onClose={() => setIsPreviewing(false)}
                />
            )}

            <style jsx global>{`
                .bn-color-red { color: #e03e3e !important; }
                .bn-color-orange { color: #d9730d !important; }
                .bn-color-yellow { color: #dfab01 !important; }
                .bn-color-green { color: #4d6461 !important; }
                .bn-color-blue { color: #0b6e99 !important; }
                .bn-color-purple { color: #6940a5 !important; }
                .bn-color-pink { color: #ad1a72 !important; }
                .bn-color-gray { color: #9b9a97 !important; }
                .bn-color-brown { color: #64473a !important; }
            `}</style>
        </div>
    );
}
