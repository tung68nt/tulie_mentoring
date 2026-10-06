import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { getFormWithQuestions, getMenteesForEvaluation } from "@/lib/actions/evaluation";
import { FormFillClient } from "@/components/forms/form-fill-client";

export default async function FormFillPage({ params }: { params: Promise<{ id: string }> }) {
    const session = await auth();
    if (!session?.user) redirect("/login");

    const { id } = await params;
    const [form, mentees] = await Promise.all([
        getFormWithQuestions(id),
        getMenteesForEvaluation(),
    ]);

    if (!form) notFound();

    return <FormFillClient form={JSON.parse(JSON.stringify(form))} mentees={JSON.parse(JSON.stringify(mentees))} />;
}
