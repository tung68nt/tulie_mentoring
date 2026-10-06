"use client";

import { PolarAngleAxis, PolarGrid, PolarRadiusAxis, Radar, RadarChart, ResponsiveContainer } from "recharts";
import { Card } from "@/components/ui/card";
import { PieChart } from "lucide-react";

interface FeedbackRadarProps {
    feedbacks: any[];
}

export function FeedbackRadar({ feedbacks }: FeedbackRadarProps) {
    if (feedbacks.length === 0) {
        return (
            <Card className="p-8 rounded-xl border border-dashed border-border/80 bg-muted/10 flex flex-col items-center justify-center text-center shadow-none min-h-[300px]">
                <PieChart className="w-8 h-8 text-muted-foreground/30 mb-3" />
                <p className="text-sm text-muted-foreground font-medium mb-1">Thiếu dữ liệu đánh giá</p>
                <p className="text-xs text-muted-foreground/60 w-3/4">Hệ thống cần ít nhất 1 phản hồi từ đối tác để bắt đầu vẽ biểu đồ năng lực của bạn.</p>
            </Card>
        );
    }

    // Calculate averages
    let totalRating = 0;
    let totalComm = 0;
    let totalEngage = 0;

    feedbacks.forEach(f => {
        totalRating += (f.rating || 0);
        totalComm += (f.communication || 0);
        totalEngage += (f.engagement || 0);
    });

    const count = feedbacks.length;
    const data = [
        { subject: "Mức hài lòng", A: totalRating / count, fullMark: 5 },
        { subject: "Giao tiếp", A: totalComm / count, fullMark: 5 },
        { subject: "Tương tác", A: totalEngage / count, fullMark: 5 },
        // Dummy values to make radar shape (triangle/diamond)
    ];

    if (data.length < 3) {
        // Just for radar to render a polygon minimum 3 points
    }

    return (
        <Card className="p-6 rounded-xl border border-border/60 shadow-none">
            <h3 className="text-[13px] font-semibold text-foreground mb-4">Biểu đồ năng lực (Trung bình)</h3>
            <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
                        <PolarGrid stroke="#e2e8f0" />
                        <PolarAngleAxis
                            dataKey="subject"
                            tick={{ fill: 'currentColor', fontSize: 11, fontWeight: 500 }}
                            className="text-muted-foreground"
                        />
                        <PolarRadiusAxis
                            angle={30}
                            domain={[0, 5]}
                            tick={false}
                            axisLine={false}
                        />
                        <Radar
                            name="Điểm đánh giá"
                            dataKey="A"
                            stroke="#0f172a"
                            fill="#0f172a"
                            fillOpacity={0.15}
                        />
                    </RadarChart>
                </ResponsiveContainer>
            </div>
            <div className="mt-2 text-center">
                <p className="text-[11px] font-medium text-muted-foreground">Tổng hợp từ {count} lượt đánh giá</p>
            </div>
        </Card>
    );
}
