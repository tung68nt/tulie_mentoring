import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { Card } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, Mail } from "lucide-react";
import Link from "next/link";

import { JuniorMenteeMatrix } from "@/components/features/mentees/junior-mentee-matrix";

export default async function MenteesPage() {
    const session = await auth();
    if (!session?.user) {
        redirect("/login");
    }
    const userId = session.user.id;
    const role = (session.user as any).role;

    if (role !== "mentor" && role !== "admin" && role !== "manager" && role !== "program_manager") {
        redirect("/");
    }

    try {
        const isAdmin = role === "admin" || role === "manager" || role === "program_manager";
        const mentorFilter = isAdmin ? {} : { mentorId: userId };
        const mentorships = await prisma.mentorship.findMany({
            where: mentorFilter,
            include: {
                mentor: {
                    select: {
                        firstName: true,
                        lastName: true,
                        avatar: true,
                    }
                },
                mentees: {
                    include: {
                        mentee: {
                            include: { menteeProfile: true }
                        }
                    }
                },
                programCycle: true,
            }
        });

        const allMentees = mentorships.flatMap(m =>
            m.mentees.map(mt => ({
                ...mt,
                mentorshipId: m.id,
                programName: m.programCycle?.name,
                mentorName: `${m.mentor?.firstName} ${m.mentor?.lastName}`,
                mentorAvatar: m.mentor?.avatar,
            }))
        );

        const serialized = JSON.parse(JSON.stringify(allMentees));

        return (
            <div className="space-y-6 pb-10">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div className="space-y-1">
                        <h1 className="text-2xl font-semibold text-foreground">
                            {role === "mentor" ? "Mentees của tôi & Phân nhóm Junior" : "Hồ sơ & Phân nhóm Toàn bộ Mentees"}
                        </h1>
                        <p className="text-sm text-muted-foreground mt-0.5 max-w-xl">
                            Ma trận thông tin cá nhân, trắc nghiệm tính cách DISC, điểm mạnh và nhu cầu hỗ trợ để định hướng và phân chia 2 nhóm Junior hiệu quả.
                        </p>
                    </div>
                </div>

                <JuniorMenteeMatrix mentees={serialized} role={role} />
            </div>
        );
    } catch (error) {
        console.error("Failed to fetch mentees:", error);
        return (
            <div className="p-8 text-center bg-muted/30 rounded-xl border border-border">
                <p className="text-muted-foreground">Không thể tải dữ liệu. Vui lòng thử lại sau.</p>
            </div>
        );
    }
}
