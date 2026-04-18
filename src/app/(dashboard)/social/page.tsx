import { auth } from "@/lib/auth";
import { SocialFeed } from "@/components/features/social/social-feed";
import { ActivityFeed } from "@/components/features/social/activity-feed";
import { DiscoverPeople } from "@/components/features/social/discover-people";
import { prisma } from "@/lib/db";

export default async function SocialPage() {
    const session = await auth();
    if (!session?.user) return null;

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
        <div className="py-8 max-w-6xl mx-auto">
            <div className="mb-8 space-y-2 px-4">
                <h1 className="text-2xl font-bold tracking-tight text-foreground">Cộng đồng</h1>
                <p className="text-muted-foreground text-[14px]">
                    Nơi kết nối, chia sẻ kinh nghiệm và học hỏi giữa Mentor & Mentee.
                </p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 px-4">
                {/* Main Feed */}
                <div className="lg:col-span-2">
                    <SocialFeed 
                        currentUser={session.user} 
                        programCycleId={mentorship?.programCycleId || undefined} 
                    />
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    <ActivityFeed />
                    <DiscoverPeople currentUserId={session.user.id} />
                </div>
            </div>
        </div>
    );
}
