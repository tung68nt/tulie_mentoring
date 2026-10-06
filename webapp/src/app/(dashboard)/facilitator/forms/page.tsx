import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getEvaluationForms } from "@/lib/actions/evaluation";
import { FormListClient } from "@/components/forms/form-list-client";

export default async function FacilitatorFormsPage() {
    const session = await auth();
    if (!session?.user) redirect("/login");

    const role = (session.user as any).role;
    if (!["admin", "facilitator", "program_manager"].includes(role)) {
        redirect("/login");
    }

    const forms = await getEvaluationForms();

    return <FormListClient forms={JSON.parse(JSON.stringify(forms))} />;
}
