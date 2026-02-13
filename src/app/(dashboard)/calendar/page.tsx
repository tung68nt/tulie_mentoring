import { auth } from "@/lib/auth";
import { getMeetings } from "@/lib/actions/meeting";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Calendar as CalendarIcon, MapPin, Video, Clock, User } from "lucide-react";
import Link from "next/link";
import { formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { CalendarView } from "@/components/features/meetings/calendar-view";

export default async function CalendarPage() {
    const session = await auth();
    const userId = session?.user?.id;
    const role = (session?.user as any).role;

    const meetings = await getMeetings({ role, userId });

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <h1 className="text-2xl font-semibold text-black">Lịch hoạt động</h1>
                    <p className="text-sm text-[#666] mt-1">Quản lý và theo dõi các buổi họp sắp tới</p>
                </div>
                {(role === "admin" || role === "mentor") && (
                    <Button asChild>
                        <Link href="/meetings/new">
                            <Plus className="w-4 h-4 mr-2" />
                            Lên lịch mới
                        </Link>
                    </Button>
                )}
            </div>

            <CalendarView meetings={meetings as any} />
        </div>
    );
}
