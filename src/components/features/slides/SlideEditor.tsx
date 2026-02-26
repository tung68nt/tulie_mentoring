"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
    ChevronLeft,
    Save,
    Play,
    Eye,
    Settings,
    Trash2,
    Globe,
    Lock,
    Type,
    Layout,
    Clock,
    User
} from 'lucide-react';
import Link from 'next/link';
import * as actions from '@/lib/actions/slide';
import SlidePresenter from './SlidePresenter';
import { Card } from '@/components/ui/card';

interface SlideEditorProps {
    id: string;
}

export default function SlideEditor({ id }: SlideEditorProps) {
    const router = useRouter();
    const [slide, setSlide] = useState<any>(null);
    const [content, setContent] = useState('');
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [theme, setTheme] = useState('black');
    const [status, setStatus] = useState('private');
    const [isSaving, setIsSaving] = useState(false);
    const [isPreviewing, setIsPreviewing] = useState(false);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        const loadSlide = async () => {
            if (id === 'new') {
                setTitle('New Presentation');
                setContent('# Welcome\n---\n## Slide 2');
                setIsLoaded(true);
                return;
            }

            try {
                const data = await actions.getSlideDetail(id);
                setSlide(data);
                setTitle(data.title);
                setDescription(data.description || '');
                setContent(data.content || '');
                setTheme(data.theme || 'black');
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

    const handleSave = async () => {
        setIsSaving(true);
        try {
            if (id === 'new') {
                const newSlide = await actions.createSlide({ title, description });
                await actions.updateSlide(newSlide.id, { content, theme, status });
                router.replace(`/slides/${newSlide.id}`);
            } else {
                await actions.updateSlide(id, { title, description, content, theme, status });
            }
        } catch (error) {
            console.error('Failed to save slide:', error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm('Bạn có chắc chắn muốn xóa bài thuyết trình này?')) return;
        try {
            await actions.deleteSlide(id);
            router.push('/slides');
        } catch (error) {
            console.error('Failed to delete slide:', error);
        }
    };

    if (!isLoaded) return <div className="p-8 text-center">Loading presentation...</div>;

    return (
        <div className="flex flex-col h-[calc(100vh-88px-40px)] animate-fade-in gap-6">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-center gap-4">
                    <Link href="/slides">
                        <Button variant="ghost" size="icon" className="rounded-xl h-10 w-10">
                            <ChevronLeft className="w-5 h-5" />
                        </Button>
                    </Link>
                    <div>
                        <input
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="bg-transparent border-none text-2xl font-semibold focus:ring-0 p-0 text-foreground w-full md:w-[400px] no-uppercase"
                            placeholder="Presentation Title"
                        />
                        <p className="text-sm text-muted-foreground mt-0.5">Markdown Presentation Creator</p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        className="rounded-xl gap-2 h-10"
                        onClick={() => setIsPreviewing(true)}
                    >
                        <Play className="w-4 h-4 fill-current" />
                        Presentation
                    </Button>
                    <Button
                        size="sm"
                        className="rounded-xl gap-2 h-10 px-4"
                        onClick={handleSave}
                        disabled={isSaving}
                    >
                        {isSaving ? <div className="h-4 w-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
                        Save Changes
                    </Button>
                    {id !== 'new' && (
                        <Button variant="ghost" size="icon" className="rounded-xl h-10 w-10 text-muted-foreground hover:text-red-500" onClick={handleDelete}>
                            <Trash2 className="w-4 h-4" />
                        </Button>
                    )}
                </div>
            </div>

            {/* Main Editor Grid */}
            <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-6 pb-6">
                {/* Left Panel: Editor */}
                <Card className="lg:col-span-8 rounded-xl overflow-hidden border-border/60 flex flex-col bg-background">
                    <div className="bg-muted/30 px-5 py-3 border-b border-border/60 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Type className="w-4 h-4 text-muted-foreground" />
                            <span className="text-[13px] font-medium">Markdown Editor</span>
                        </div>
                        <div className="text-[11px] text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-md border border-border/40">Dùng --- để phân tách các trang slide</div>
                    </div>
                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        className="flex-1 w-full p-6 text-[15px] font-mono leading-relaxed resize-none focus:outline-none bg-background custom-scrollbar"
                        placeholder="# Title\n\nContent here...\n\n---\n\n# Slide 2\n\n- Point 1\n- Point 2"
                    />
                </Card>

                {/* Right Panel: Settings */}
                <Card className="lg:col-span-4 rounded-xl overflow-hidden border-border/60 bg-muted/5 p-6 flex flex-col gap-6 shadow-none">
                    <div>
                        <h4 className="flex items-center gap-2 text-[14px] font-semibold mb-4 text-foreground">
                            <Settings className="w-4 h-4" />
                            Cấu hình slide
                        </h4>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-[12px] font-medium text-muted-foreground">Chế độ hiển thị</label>
                                <div className="flex p-1 bg-background rounded-lg border border-border/60">
                                    <button
                                        onClick={() => setStatus('private')}
                                        className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-[13px] transition-all font-medium ${status === 'private' ? 'bg-zinc-800 text-white dark:bg-zinc-100 dark:text-zinc-900' : 'text-muted-foreground hover:bg-muted'}`}
                                    >
                                        <Lock className="w-3.5 h-3.5" />
                                        Riêng tư
                                    </button>
                                    <button
                                        onClick={() => setStatus('public')}
                                        className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-[13px] transition-all font-medium ${status === 'public' ? 'bg-emerald-500 text-white' : 'text-muted-foreground hover:bg-muted'}`}
                                    >
                                        <Globe className="w-3.5 h-3.5" />
                                        Công khai
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[12px] font-medium text-muted-foreground">Chủ đề (Theme)</label>
                                <select
                                    value={theme}
                                    onChange={(e) => setTheme(e.target.value)}
                                    className="w-full bg-background rounded-lg border-border/60 py-2.5 px-3 text-[13px] transition-all focus:ring-1 focus:ring-primary outline-none appearance-none cursor-pointer"
                                >
                                    <option value="black">Màu tối (Mặc định)</option>
                                    <option value="white">Màu sáng</option>
                                    <option value="league">League</option>
                                    <option value="beige">Beige</option>
                                    <option value="sky">Sky</option>
                                    <option value="night">Night</option>
                                    <option value="serif">Serif</option>
                                    <option value="simple">Simple</option>
                                    <option value="solarized">Solarized</option>
                                    <option value="blood">Blood</option>
                                    <option value="moon">Moon</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[12px] font-medium text-muted-foreground">Mô tả</label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    className="w-full bg-background rounded-lg border-border/60 py-2.5 px-3 text-[13px] focus:ring-1 focus:ring-primary outline-none min-h-[100px] resize-none transition-all placeholder:text-muted-foreground/40"
                                    placeholder="Nội dung giới thiệu về bài thuyết trình này là gì?"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="mt-auto pt-6 border-t border-border/50 space-y-3">
                        <div className="flex items-center justify-between text-[12px]">
                            <span className="text-muted-foreground flex items-center gap-1.5 font-medium">
                                <Clock className="w-3.5 h-3.5 opacity-70" />
                                Cập nhật lúc
                            </span>
                            <span className="font-medium text-foreground">{slide ? new Date(slide.updatedAt).toLocaleString() : 'Vừa xong'}</span>
                        </div>
                        <div className="flex items-center justify-between text-[12px]">
                            <span className="text-muted-foreground flex items-center gap-1.5 font-medium">
                                <User className="w-3.5 h-3.5 opacity-70" />
                                Tác giả
                            </span>
                            <span className="font-medium text-foreground">{slide?.creator?.firstName || 'Current User'}</span>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Presentation Overlay */}
            {isPreviewing && (
                <SlidePresenter
                    content={content}
                    theme={theme}
                    onClose={() => setIsPreviewing(false)}
                />
            )}
        </div>
    );
}

