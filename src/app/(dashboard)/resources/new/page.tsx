import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getMentorships } from "@/lib/actions/mentorship";
import { ResourceForm } from "@/components/features/resources/resource-form";

export default async function NewResourcePage() {
    const session = await auth();
    if (!session?.user) {
        redirect("/login");
    }
    const role = (session.user as any).role;

    if (role === "manager") {
        redirect("/resources");
    }
    const mentorships = (await getMentorships()).map((m: any) => ({
        id: m.id,
        label: `${m.mentor?.firstName ?? ""} ${m.mentor?.lastName ?? ""}`.trim() + (m.programCycle?.name ? ` – ${m.programCycle.name}` : ""),
    }));

    return (
        <div className="max-w-3xl mx-auto space-y-8">
            <div className="space-y-2">
                <h1 className="text-2xl font-semibold text-foreground">Thêm tài liệu mới</h1>
                <p className="text-muted-foreground text-sm">Lưu file, ghi chú và link tham khảo để không bị trôi trong nhóm chat</p>
            </div>

            <ResourceForm canPublic={role !== "mentee"} mentorships={mentorships} />
        </div>
    );
}
