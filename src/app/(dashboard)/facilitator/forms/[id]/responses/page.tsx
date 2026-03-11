import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { getFormWithQuestions, getFormResponses, getFormAnalytics } from "@/lib/actions/evaluation";
import { ResponsesClient } from "@/components/forms/responses-client";

export default async function FormResponsesPage({ params }: { params: Promise<{ id: string }> }) {
    const session = await auth();
    if (!session?.user) redirect("/login");

    const role = (session.user as any).role;
    if (!["admin", "facilitator", "program_manager"].includes(role)) {
        redirect("/login");
    }

    const { id } = await params;
    const [form, responses, analytics] = await Promise.all([
        getFormWithQuestions(id),
        getFormResponses(id),
        getFormAnalytics(id),
    ]);

    if (!form) notFound();

    return (
        <ResponsesClient
            form={JSON.parse(JSON.stringify(form))}
            responses={JSON.parse(JSON.stringify(responses))}
            analytics={JSON.parse(JSON.stringify(analytics))}
        />
    );
}
