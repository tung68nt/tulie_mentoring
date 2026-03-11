import { auth } from "@/lib/auth";
import { ChatLayout } from "@/components/features/chat/chat-layout";

export default async function ChatPage() {
    const session = await auth();
    if (!session?.user) return null;

    return (
        <div className="container py-6 min-h-[calc(100vh-180px)] flex flex-col">
            <div className="mb-4 space-y-1">
                <h1 className="text-2xl font-bold tracking-tight text-foreground">Tin nhắn</h1>
                <p className="text-muted-foreground text-[13px]">
                    Kênh trao đổi chính thức giữa các thành viên trong cộng đồng.
                </p>
            </div>
            
            <div className="flex-1 min-h-[500px]">
                <ChatLayout currentUser={session.user} />
            </div>
        </div>
    );
}
