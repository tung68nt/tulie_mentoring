"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { setAvailability } from "@/lib/actions/availability";
import { Clock, Plus, Trash2, Check } from "lucide-react";

const DAYS = [
    { value: 1, label: "Thứ hai" },
    { value: 2, label: "Thứ ba" },
    { value: 3, label: "Thứ tư" },
    { value: 4, label: "Thứ năm" },
    { value: 5, label: "Thứ sáu" },
    { value: 6, label: "Thứ bảy" },
    { value: 0, label: "Chủ nhật" },
];

interface Slot {
    dayOfWeek: number;
    startTime: string;
    endTime: string;
    duration: number;
}

interface AvailabilitySettingsProps {
    initialSlots: Slot[];
}

export function AvailabilitySettings({ initialSlots }: AvailabilitySettingsProps) {
    const [slots, setSlots] = useState<Slot[]>(
        initialSlots.length > 0 ? initialSlots : [{ dayOfWeek: 1, startTime: "09:00", endTime: "17:00", duration: 60 }]
    );
    const [isPending, startTransition] = useTransition();
    const [saved, setSaved] = useState(false);

    const addSlot = () => {
        setSlots([...slots, { dayOfWeek: 1, startTime: "09:00", endTime: "17:00", duration: 60 }]);
        setSaved(false);
    };

    const removeSlot = (index: number) => {
        setSlots(slots.filter((_, i) => i !== index));
        setSaved(false);
    };

    const updateSlot = (index: number, field: keyof Slot, value: string | number) => {
        const updated = [...slots];
        (updated[index] as any)[field] = value;
        setSlots(updated);
        setSaved(false);
    };

    const handleSave = () => {
        startTransition(async () => {
            await setAvailability(slots);
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        });
    };

    return (
        <div className="space-y-4">
            {slots.map((slot, idx) => (
                <div key={idx} className="flex items-center gap-3 p-3 bg-[#fafafa] rounded-md border border-[#eaeaea]">
                    <select
                        value={slot.dayOfWeek}
                        onChange={e => updateSlot(idx, "dayOfWeek", parseInt(e.target.value))}
                        className="px-3 py-2 bg-white border border-[#eaeaea] rounded-md text-sm focus:outline-none focus:border-black transition-all"
                    >
                        {DAYS.map(d => (
                            <option key={d.value} value={d.value}>{d.label}</option>
                        ))}
                    </select>

                    <div className="flex items-center gap-2">
                        <input
                            type="time"
                            value={slot.startTime}
                            onChange={e => updateSlot(idx, "startTime", e.target.value)}
                            className="px-3 py-2 bg-white border border-[#eaeaea] rounded-md text-sm focus:outline-none focus:border-black transition-all"
                        />
                        <span className="text-xs text-[#999]">→</span>
                        <input
                            type="time"
                            value={slot.endTime}
                            onChange={e => updateSlot(idx, "endTime", e.target.value)}
                            className="px-3 py-2 bg-white border border-[#eaeaea] rounded-md text-sm focus:outline-none focus:border-black transition-all"
                        />
                    </div>

                    <select
                        value={slot.duration}
                        onChange={e => updateSlot(idx, "duration", parseInt(e.target.value))}
                        className="px-3 py-2 bg-white border border-[#eaeaea] rounded-md text-sm focus:outline-none focus:border-black transition-all"
                    >
                        <option value={30}>30 phút</option>
                        <option value={45}>45 phút</option>
                        <option value={60}>60 phút</option>
                        <option value={90}>90 phút</option>
                    </select>

                    <button
                        onClick={() => removeSlot(idx)}
                        className="p-2 text-[#999] hover:text-black hover:bg-[#fafafa] rounded-md transition-all"
                        disabled={slots.length <= 1}
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            ))}

            <div className="flex items-center gap-3">
                <Button variant="outline" size="sm" onClick={addSlot}>
                    <Plus className="w-4 h-4 mr-1" />
                    Thêm khung giờ
                </Button>
                <Button size="sm" onClick={handleSave} disabled={isPending}>
                    {saved ? (
                        <><Check className="w-4 h-4 mr-1" /> Đã lưu</>
                    ) : isPending ? (
                        "Đang lưu..."
                    ) : (
                        <><Clock className="w-4 h-4 mr-1" /> Lưu lịch rảnh</>
                    )}
                </Button>
            </div>
        </div>
    );
}
