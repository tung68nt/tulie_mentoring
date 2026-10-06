import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getProcedures } from "@/lib/actions/procedure";
import { ProceduresList } from "@/components/features/procedures/procedures-list";

export default async function ProceduresPage() {
    const session = await auth();
    if (!session?.user) redirect("/login");

    const role = (session.user as any).role;
    const isAdmin = ["admin", "manager", "facilitator", "program_manager"].includes(role);

    let procedures: any[] = [];
    try {
        procedures = await getProcedures();
    } catch (error) {
        console.error("Failed to fetch procedures:", error);
    }

    return (
        <div className="space-y-8 pb-10 animate-fade-in">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                    <h1 className="text-2xl font-semibold text-foreground">Thủ tục & Biểu mẫu</h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        {isAdmin
                            ? "Quản lý các thủ tục, biểu mẫu yêu cầu mentor/mentee hoàn thành."
                            : "Các thủ tục và biểu mẫu bạn cần hoàn thành trong chương trình."}
                    </p>
                </div>
            </div>

            <ProceduresList
                procedures={procedures}
                role={role}
                userId={session.user.id!}
            />
        </div>
    );
}
