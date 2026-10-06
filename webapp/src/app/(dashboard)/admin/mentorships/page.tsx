import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { MentorshipLayout } from "@/components/features/mentorships/mentorship-layout";

export default async function MentorshipsPage() {
    const session = await auth();
    const role = (session?.user as any)?.role;
    if (!session?.user || !["admin", "program_manager", "manager"].includes(role)) {
        redirect("/login");
    }
    try {
        const mentorshipsData = await prisma.mentorship.findMany({
            include: {
                mentor: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        avatar: true,
                    },
                },
                mentees: {
                    include: {
                        mentee: {
                            select: {
                                id: true,
                                firstName: true,
                                lastName: true,
                                avatar: true,
                            },
                        },
                    },
                },
                programCycle: true,
            },
            orderBy: {
                createdAt: "desc",
            },
        });
        const mentorships = JSON.parse(JSON.stringify(mentorshipsData));

        return <MentorshipLayout mentorships={mentorships} />;
    } catch (error: any) {
        console.error("Failed to fetch mentorships:", error);
        return (
            <div className="p-8 border border-destructive/20 rounded-xl bg-destructive/5">
                <p className="text-destructive font-semibold mb-2">Đã có lỗi xảy ra khi tải dữ liệu Mentorship:</p>
                <code className="text-xs bg-background p-2 rounded block overflow-auto whitespace-pre-wrap">
                    {error?.message || String(error)}
                </code>
            </div>
        );
    }
}
