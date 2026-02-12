import { auth } from "@/lib/auth";
import { getResources } from "@/lib/actions/resource";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";
import { ResourceList } from "@/components/features/resources/resource-list";

export default async function ResourcesPage() {
    const session = await auth();
    const role = (session?.user as any).role;
    const categories = ["Tài liệu", "Biểu mẫu", "Video", "Sách điện tử", "Khác"];

    const resources = await getResources();

    return (
        <div className="space-y-8 pb-10">
            <div className="flex items-center justify-between">
                <div className="space-y-2">
                    <h1 className="text-2xl font-semibold text-black">Thư viện Tài nguyên</h1>
                    <p className="text-[#666] text-sm">Tổng hợp tài liệu, biểu mẫu và hướng dẫn trong chương trình</p>
                </div>
                {(role === "admin" || role === "mentor") && (
                    <Button asChild>
                        <Link href="/resources/new">
                            <Plus className="w-4 h-4 mr-2" />
                            Tải lên tài liệu
                        </Link>
                    </Button>
                )}
            </div>

            <ResourceList resources={resources as any} categories={categories} />
        </div>
    );
}
