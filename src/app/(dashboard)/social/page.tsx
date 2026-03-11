import { auth } from "@/lib/auth";
import { SocialFeed } from "@/components/features/social/social-feed";
import { prisma } from "@/lib/db";

export default async function SocialPage() {
    const session = await auth();
    if (!session?.user) return null;

    // Get active program cycle for this user
    const mentorship = await prisma.mentorship.findFirst({
        where: {
            OR: [
                { mentorId: session.user.id },
                { mentees: { some: { menteeId: session.user.id } } }
            ],
            status: "active"
        },
        select: { programCycleId: true }
    });

    return (
        <div className="container py-8 max-w-4xl mx-auto">
            <div className="mb-8 space-y-2">
                <h1 className="text-3xl font-bold tracking-tight text-foreground">Cộng đồng</h1>
                <p className="text-muted-foreground text-[14px]">
                    Nơi kết nối, chia sẻ kinh nghiệm và học hỏi giữa Mentor & Mentee.
                </p>
            </div>
            
            <SocialFeed 
                currentUser={session.user} 
                programCycleId={mentorship?.programCycleId || undefined} 
            />
        </div>
    );
}
