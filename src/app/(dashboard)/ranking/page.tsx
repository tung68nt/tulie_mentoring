import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { RankingDashboard } from "@/components/ranking/ranking-dashboard";

export default async function RankingPage() {
    const session = await auth();
    if (!session?.user) {
        redirect("/login");
    }

    const { id, role } = session.user as any;

    return (
        <div className="container mx-auto py-6">
            <RankingDashboard role={role} userId={id} />
        </div>
    );
}
