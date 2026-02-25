import { auth } from "@/lib/auth";
import { getMeetings } from "@/lib/actions/meeting";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Calendar as CalendarIcon, MapPin, Video, Clock, User } from "lucide-react";
import Link from "next/link";
import { formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { CalendarView } from "@/components/features/meetings/calendar-view";

import { redirect } from "next/navigation";

export default async function CalendarPage() {
    const session = await auth();
    if (!session?.user) {
        redirect("/login");
    }
    const userId = session.user.id;
    const role = (session.user as any).role;

    try {
        const meetings = await getMeetings({ role, userId });
        const serializedMeetings = JSON.parse(JSON.stringify(meetings));

        return (
            <div className="space-y-10 pb-20 animate-fade-in">
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
                    <div className="space-y-1">
                        <h1 className="text-2xl font-semibold text-foreground no-uppercase">Lịch hoạt động</h1>
                        <p className="text-sm text-muted-foreground/60 no-uppercase font-medium">Quản lý và theo dõi các buổi họp sắp tới</p>
                    </div>
                    {(role === "admin" || role === "mentor") && (
                        <Button asChild className="rounded-xl shadow-none">
                            <Link href="/meetings/new">
                                <Plus className="w-4 h-4 mr-2" />
                                <span className="no-uppercase">Lên lịch mới</span>
                            </Link>
                        </Button>
                    )}
                </div>

                <CalendarView meetings={serializedMeetings} />
            </div>
        );
    } catch (error) {
        console.error("Failed to fetch meetings:", error);
        return (
            <div className="p-8 text-center">
                <p className="text-muted-foreground">Không thể tải dữ liệu lịch. Vui lòng thử lại sau.</p>
            </div>
        );
    }
}
