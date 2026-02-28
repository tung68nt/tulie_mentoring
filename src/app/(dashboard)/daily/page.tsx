import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { DailyTracker } from "@/components/features/daily/daily-tracker";

export const metadata = {
    title: "Nhật ký hằng ngày | Tulie Mentoring",
};

export default async function DailyPage() {
    const session = await auth();
    if (!session?.user?.id) {
        redirect("/login");
    }

    const role = (session.user as any).role;
    if (role !== "mentee") {
        return (
            <div className="flex items-center justify-center min-h-[50vh] text-muted-foreground">
                Trang này dành cho Mentee để ghi chép nhật ký và thói quen hằng ngày.
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            <div className="space-y-1">
                <h1 className="text-2xl font-semibold text-foreground">Nhật ký hằng ngày</h1>
                <p className="text-sm text-muted-foreground mt-1">
                    Ghi chép hành trình, xây dựng thói quen và theo dõi tiến độ mỗi ngày.
                </p>
            </div>

            <DailyTracker />
        </div>
    );
}
