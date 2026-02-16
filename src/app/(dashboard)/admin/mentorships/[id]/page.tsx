import { getMentorshipDetail } from "@/lib/actions/mentorship";
import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { MentorshipDetailView } from "@/components/features/mentorships/mentorship-detail";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function AdminMentorshipDetailPage({ params }: PageProps) {
    const session = await auth();
    if (!session?.user || (session.user as any).role !== "admin") {
        redirect("/login");
    }

    const { id } = await params;
    const mentorship = await getMentorshipDetail(id);

    if (!mentorship) {
        notFound();
    }

    return (
        <div className="space-y-6">
            <Button variant="ghost" size="sm" asChild className="-ml-2">
                <Link href="/admin/mentorships">
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    Quay lại danh sách
                </Link>
            </Button>

            <MentorshipDetailView mentorship={JSON.parse(JSON.stringify(mentorship))} userRole="admin" />
        </div>
    );
}
