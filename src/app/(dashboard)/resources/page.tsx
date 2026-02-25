import { auth } from "@/lib/auth";
import { getResources } from "@/lib/actions/resource";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";
import { ResourceList } from "@/components/features/resources/resource-list";

import { redirect } from "next/navigation";

export default async function ResourcesPage() {
    const session = await auth();
    if (!session?.user) {
        redirect("/login");
    }
    const role = (session.user as any).role;
    const categories = ["Tài liệu", "Biểu mẫu", "Video", "Sách điện tử", "Khác"];

    try {
        const resources = await getResources();
        const serializedResources = JSON.parse(JSON.stringify(resources));

        return (
            <div className="space-y-10 pb-20 animate-fade-in">
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
                    <div className="space-y-1">
                        <h1 className="text-2xl font-semibold text-foreground no-uppercase">Thư viện Tài nguyên</h1>
                        <p className="text-sm text-muted-foreground/60 no-uppercase font-medium">Tổng hợp tài liệu, biểu mẫu và hướng dẫn chương trình</p>
                    </div>
                    {(role === "admin" || role === "mentor") && (
                        <Button asChild className="rounded-xl shadow-none">
                            <Link href="/resources/new">
                                <Plus className="w-4 h-4 mr-2" />
                                <span className="no-uppercase">Tải lên tài liệu</span>
                            </Link>
                        </Button>
                    )}
                </div>

                <ResourceList resources={serializedResources} categories={categories} />
            </div>
        );
    } catch (error) {
        console.error("Failed to fetch resources:", error);
        return (
            <div className="p-8 text-center">
                <p className="text-muted-foreground">Không thể tải tài nguyên. Vui lòng thử lại sau.</p>
            </div>
        );
    }
}
