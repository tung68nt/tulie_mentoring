import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getMilestones } from "@/lib/actions/milestone";
import { TimelineView } from "@/components/features/timeline/timeline-view";

export default async function TimelinePage() {
    const session = await auth();
    if (!session?.user) redirect("/login");

    const role = (session.user as any).role;
    const { milestones, programCycle } = await getMilestones();
    const isAdmin = ["admin", "manager", "program_manager"].includes(role);

    return (
        <div className="space-y-8 pb-10 animate-fade-in">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                    <h1 className="text-2xl font-semibold text-foreground">Lộ trình Chương trình</h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        {programCycle ? programCycle.name : "Chưa có chương trình nào đang hoạt động"}
                    </p>
                </div>
            </div>

            <TimelineView
                milestones={milestones}
                programCycle={programCycle}
                isAdmin={isAdmin}
            />
        </div>
    );
}
