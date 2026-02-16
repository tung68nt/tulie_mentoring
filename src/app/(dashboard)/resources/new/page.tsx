import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ResourceForm } from "@/components/features/resources/resource-form";

export default async function NewResourcePage() {
    const session = await auth();
    const role = (session?.user as any).role;

    if (role !== "admin" && role !== "mentor") {
        redirect("/resources");
    }

    return (
        <div className="max-w-3xl mx-auto space-y-8">
            <div className="space-y-2">
                <h1 className="text-2xl font-semibold text-foreground">Thêm tài liệu mới</h1>
                <p className="text-muted-foreground text-sm">Chia sẻ tài liệu với cộng đồng Mentoring</p>
            </div>

            <ResourceForm />
        </div>
    );
}
