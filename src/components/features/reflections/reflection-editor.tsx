"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BlockEditor } from "@/components/ui/block-editor";
import { upsertReflection } from "@/lib/actions/reflection";
import { Loader2, Save, CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";

interface ReflectionEditorProps {
    meetingId: string;
    meetingTitle: string;
    mentorName: string;
    initialContent?: string;
}

export function ReflectionEditor({ meetingId, meetingTitle, mentorName, initialContent }: ReflectionEditorProps) {
    const [content, setContent] = useState(initialContent || "");
    const [isSaving, setIsSaving] = useState(false);
    const [lastSaved, setLastSaved] = useState<Date | null>(null);
    const router = useRouter();

    const handleSave = async () => {
        if (!content || isSaving) return;

        setIsSaving(true);
        try {
            await upsertReflection(meetingId, content);
            setLastSaved(new Date());
            router.refresh();
        } catch (error) {
            console.error("Failed to save reflection:", error);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <Card className="px-4 py-3 border border-border/60 shadow-none bg-muted/10 rounded-lg">
                <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 min-w-0">
                        <Badge variant="outline" className="bg-background/50 border-border/50 text-[10px] font-medium shrink-0">Buổi học</Badge>
                        <span className="text-xs text-muted-foreground/60 shrink-0">{mentorName}</span>
                        <span className="text-xs text-muted-foreground/30 shrink-0">·</span>
                        <h3 className="text-sm font-semibold text-foreground truncate">{meetingTitle}</h3>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                        {lastSaved && (
                            <div className="flex items-center gap-1 text-[10px] text-muted-foreground font-medium">
                                <CheckCircle2 className="w-3 h-3 text-primary" />
                                {lastSaved.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                        )}
                        <Button
                            onClick={handleSave}
                            disabled={isSaving || !content}
                            className="rounded-lg shadow-none transition-all hover:bg-primary/90 h-8 text-xs px-3"
                            size="sm"
                        >
                            {isSaving ? (
                                <Loader2 className="w-3 h-3 mr-1.5 animate-spin" />
                            ) : (
                                <Save className="w-3 h-3 mr-1.5" />
                            )}
                            {isSaving ? "Đang lưu..." : "Lưu thu hoạch"}
                        </Button>
                    </div>
                </div>
            </Card>

            <div className="min-h-[300px]">
                <BlockEditor
                    initialContent={content}
                    onChange={setContent}
                    placeholder="Viết những gì bạn đã học được và những cảm nhận sau buổi học..."
                />
            </div>
        </div>
    );
}
