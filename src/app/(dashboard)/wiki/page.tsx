import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getWikiPages } from "@/lib/actions/wiki";
import { WikiList } from "@/components/features/wiki/wiki-list";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import Link from "next/link";

export default async function WikiPage() {
    const session = await auth();
    if (!session?.user) {
        redirect("/login");
    }

    const pages = await getWikiPages();
    const canCreate = true; // All roles can now create wiki pages

    return (
        <div className="space-y-8 pb-10 animate-fade-in">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold tracking-tight text-foreground no-uppercase">Wiki & Tài liệu</h1>
                    <p className="text-sm text-muted-foreground mt-1 max-w-lg">Kho lưu trữ kiến thức, tài liệu và quy trình quan trọng trong chương trình Mentoring.</p>
                </div>
                {canCreate && (
                    <Link href="/wiki/new">
                        <Button className="rounded-xl no-uppercase h-11 px-6 font-medium gap-2">
                            <PlusCircle className="w-4 h-4" />
                            Tạo trang mới
                        </Button>
                    </Link>
                )}
            </div>

            <WikiList pages={pages} />
        </div>
    );
}
