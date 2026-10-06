"use client";

import { useState, useTransition, useRef, useEffect } from "react";
import { Pencil, Check, X } from "lucide-react";
import { updateMeeting } from "@/lib/actions/meeting";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface EditableTitleProps {
    meetingId: string;
    title: string;
    canEdit: boolean;
}

export function EditableTitle({ meetingId, title, canEdit }: EditableTitleProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [value, setValue] = useState(title);
    const [isPending, startTransition] = useTransition();
    const inputRef = useRef<HTMLInputElement>(null);
    const router = useRouter();

    useEffect(() => {
        if (isEditing && inputRef.current) {
            inputRef.current.focus();
            inputRef.current.select();
        }
    }, [isEditing]);

    const handleSave = () => {
        if (!value.trim() || value === title) {
            setValue(title);
            setIsEditing(false);
            return;
        }
        startTransition(async () => {
            try {
                await updateMeeting(meetingId, { title: value.trim() });
                router.refresh();
                setIsEditing(false);
            } catch (error: any) {
                toast.error(error.message || "Có lỗi xảy ra");
                setValue(title);
                setIsEditing(false);
            }
        });
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") handleSave();
        if (e.key === "Escape") {
            setValue(title);
            setIsEditing(false);
        }
    };

    if (!canEdit) {
        return <h1 className="text-3xl font-semibold text-foreground leading-tight">{title}</h1>;
    }

    if (isEditing) {
        return (
            <div className="flex items-center gap-2">
                <input
                    ref={inputRef}
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onBlur={handleSave}
                    className="text-3xl font-semibold text-foreground leading-tight bg-transparent border-b-2 border-primary outline-none w-full"
                    disabled={isPending}
                />
                <button
                    onClick={handleSave}
                    className="p-1 rounded hover:bg-muted text-primary shrink-0"
                    disabled={isPending}
                >
                    <Check className="w-5 h-5" />
                </button>
                <button
                    onClick={() => { setValue(title); setIsEditing(false); }}
                    className="p-1 rounded hover:bg-muted text-muted-foreground shrink-0"
                    disabled={isPending}
                >
                    <X className="w-5 h-5" />
                </button>
            </div>
        );
    }

    return (
        <div className="group flex items-center gap-2">
            <h1 className="text-3xl font-semibold text-foreground leading-tight">{title}</h1>
            <button
                onClick={() => setIsEditing(true)}
                className="p-1 rounded hover:bg-muted text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                title="Chỉnh sửa tên cuộc họp"
            >
                <Pencil className="w-4 h-4" />
            </button>
        </div>
    );
}
