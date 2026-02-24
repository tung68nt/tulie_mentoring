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
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <Card className="p-6 border-none shadow-sm bg-secondary/30 rounded-2xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <Badge variant="outline" className="bg-background/50 border-border/50 text-[10px] font-medium no-uppercase">Buổi học</Badge>
                            <span className="text-xs text-muted-foreground/60">{mentorName}</span>
                        </div>
                        <h3 className="text-lg font-semibold text-foreground leading-tight">{meetingTitle}</h3>
                    </div>
                    <div className="flex items-center gap-3">
                        {lastSaved && (
                            <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground font-medium pr-2">
                                <CheckCircle2 className="w-3 h-3 text-primary" />
                                Đã lưu lúc {lastSaved.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                        )}
                        <Button
                            onClick={handleSave}
                            disabled={isSaving || !content}
                            className="rounded-xl shadow-lg shadow-primary/10 transition-all hover:scale-[1.02] active:scale-[0.98]"
                            size="sm"
                        >
                            {isSaving ? (
                                <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" />
                            ) : (
                                <Save className="w-3.5 h-3.5 mr-2" />
                            )}
                            {isSaving ? "Đang lưu..." : "Lưu thu hoạch"}
                        </Button>
                    </div>
                </div>
            </Card>

            <div className="min-h-[400px]">
                <BlockEditor
                    initialContent={content}
                    onChange={setContent}
                    placeholder="Viết những gì bạn đã học được và những cảm nhận sau buổi học..."
                />
            </div>
        </div>
    );
}
