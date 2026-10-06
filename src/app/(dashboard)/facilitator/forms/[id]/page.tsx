import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { getFormWithQuestions } from "@/lib/actions/evaluation";
import { FormBuilder } from "@/components/forms/evaluation-form-builder";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Eye, BarChart } from "lucide-react";
import Link from "next/link";

export default async function FormEditorPage({ params }: { params: Promise<{ id: string }> }) {
    const session = await auth();
    if (!session?.user) redirect("/login");

    const { id } = await params;
    const form = await getFormWithQuestions(id);
    if (!form) notFound();

    return (
        <div className="container mx-auto py-8 px-4 max-w-5xl">
            {/* Navigation */}
            <div className="mb-8 flex items-center justify-between gap-4">
                <Link href="/facilitator/forms">
                    <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground">
                        <ChevronLeft className="w-4 h-4" /> Trở lại
                    </Button>
                </Link>
                <div className="flex items-center gap-2">
                    <Link href={`/facilitator/forms/${id}/fill`}>
                        <Button variant="outline" size="sm" className="gap-1.5">
                            <Eye className="w-3.5 h-3.5" /> Điền đánh giá
                        </Button>
                    </Link>
                    <Link href={`/facilitator/forms/${id}/responses`}>
                        <Button variant="outline" size="sm" className="gap-1.5">
                            <BarChart className="w-3.5 h-3.5" /> Phản hồi ({form._count?.responses || 0})
                        </Button>
                    </Link>
                </div>
            </div>

            <FormBuilder form={JSON.parse(JSON.stringify(form))} />
        </div>
    );
}
