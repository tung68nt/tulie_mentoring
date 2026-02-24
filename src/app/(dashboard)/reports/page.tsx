import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function ReportsPage() {
    const session = await auth();
    if (!session?.user) {
        redirect("/login");
    }

    return (
        <div className="space-y-10 pb-20 animate-fade-in">
            <div className="flex flex-col gap-1">
                <h1 className="text-3xl font-bold tracking-tight text-foreground no-uppercase">Báo cáo</h1>
                <p className="text-sm text-muted-foreground mt-1 max-w-lg">
                    Theo dõi tiến độ học tập và rèn luyện của bạn thông qua các số liệu thống kê chi tiết theo ngày, tuần và tháng.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="h-48 rounded-2xl bg-muted/20 border border-border/50 flex flex-col items-center justify-center p-8 space-y-3">
                        <div className="w-10 h-10 rounded-full bg-muted/40 animate-pulse" />
                        <div className="h-4 w-24 bg-muted/40 rounded animate-pulse" />
                        <div className="h-3 w-32 bg-muted/30 rounded animate-pulse" />
                    </div>
                ))}
            </div>

            <div className="p-20 text-center bg-muted/10 rounded-3xl border border-dashed border-border/60">
                <p className="text-sm text-muted-foreground font-medium no-uppercase">Hệ thống đang tổng hợp dữ liệu và sẽ sớm hiển thị...</p>
            </div>
        </div>
    );
}
