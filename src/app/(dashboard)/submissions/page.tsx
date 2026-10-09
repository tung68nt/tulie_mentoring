import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { SubmissionForm } from "@/components/features/submissions/submission-form";
import { SubmissionList } from "@/components/features/submissions/submission-list";
import { listSubmissions } from "@/lib/actions/submission";

export default async function SubmissionsPage({ searchParams }: { searchParams: Promise<{ status?: string; mentee?: string }> }) {
    const session = await auth();
    if (!session?.user) redirect("/login");
    const role = (session.user as any).role as string;
    const { status, mentee } = await searchParams;

    const items = await listSubmissions({ status, menteeId: mentee });
    const mode = role === "mentee" ? "mentee" : role === "mentor" || role === "admin" || role === "program_manager" ? "reviewer" : "viewer";

    return (
        <div className="space-y-8 pb-10">
            <div className="space-y-1">
                <h1 className="text-2xl font-semibold text-foreground">Bài tập và thực hành</h1>
                <p className="text-sm text-muted-foreground">
                    {mode === "mentee" ? "Nộp file hoặc link bài tập, thực hành để mentor nhận xét." : "Bài nộp của các mentee trong phạm vi bạn phụ trách."}
                </p>
            </div>
            {mode === "mentee" && <SubmissionForm />}
            <SubmissionList items={items} mode={mode} />
        </div>
    );
}
