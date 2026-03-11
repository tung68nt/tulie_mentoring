import { auth } from "@/lib/auth";
import { ChatLayout } from "@/components/features/chat/chat-layout";

export default async function ChatPage() {
    const session = await auth();
    if (!session?.user) return null;

    return (
        <div className="container py-8 h-[calc(100vh-80px)]">
            <div className="mb-6 space-y-1">
                <h1 className="text-3xl font-bold tracking-tight text-foreground">Tin nhắn</h1>
                <p className="text-muted-foreground text-[14px]">
                    Kênh trao đổi chính thức giữa các thành viên trong cộng đồng.
                </p>
            </div>
            
            <ChatLayout currentUser={session.user} />
        </div>
    );
}
