import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { getFormWithQuestions } from "@/lib/actions/evaluation";
import { FormBuilder } from "@/components/forms/evaluation-form-builder";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";

export default async function FormEditorPage({ params }: { params: Promise<{ id: string }> }) {
    const session = await auth();
    if (!session?.user) redirect("/login");

    const { id } = await params;
    const form = await getFormWithQuestions(id);
    if (!form) notFound();

    return (
        <div className="container mx-auto py-8 px-4 max-w-5xl">
            <div className="mb-10 flex items-center justify-between gap-4">
                <Link href="/facilitator/forms">
                    <Button variant="ghost" className="h-10 rounded-xl gap-2 font-bold text-muted-foreground hover:text-primary transition-all no-uppercase pl-2 pr-4 bg-muted/30">
                        <ChevronLeft className="w-4 h-4" />
                        Trở lại danh sách
                    </Button>
                </Link>
            </div>

            <FormBuilder form={JSON.parse(JSON.stringify(form))} />
        </div>
    );
}
