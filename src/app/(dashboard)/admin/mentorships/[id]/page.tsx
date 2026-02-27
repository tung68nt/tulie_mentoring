import { getMentorshipDetail } from "@/lib/actions/mentorship";
import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { MentorshipDetailView } from "@/components/features/mentorships/mentorship-detail";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function AdminMentorshipDetailPage({ params }: PageProps) {
    const session = await auth();

    if (!session?.user) {
        redirect("/login");
    }

    const role = (session.user as any).role;
    if (role !== "admin" && role !== "viewer") {
        redirect("/");
    }

    const { id } = await params;
    let mentorship = null;

    try {
        mentorship = await getMentorshipDetail(id);
    } catch (error) {
        console.error("Failed to fetch mentorship details:", error);
    }

    if (!mentorship) {
        notFound();
    }

    return (
        <div className="space-y-6">
            <Button variant="ghost" size="sm" asChild className="-ml-2">
                <Link href={role === "admin" ? "/admin/mentorships" : "/mentees"}>
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    Quay lại danh sách
                </Link>
            </Button>

            <MentorshipDetailView mentorship={JSON.parse(JSON.stringify(mentorship))} userRole={role} />
        </div>
    );
}
