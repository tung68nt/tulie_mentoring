import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getTickets } from "@/lib/actions/ticket";
import { TicketList } from "@/components/features/tickets/ticket-list";
import { CreateTicketModal } from "@/components/features/tickets/create-ticket-modal";

export default async function TicketsPage() {
    const session = await auth();
    if (!session?.user) {
        redirect("/login");
    }

    let tickets: any[] = [];
    try {
        tickets = await getTickets();
    } catch (error) {
        console.error("Failed to fetch tickets:", error);
        return (
            <div className="space-y-8 pb-10 animate-fade-in">
                <div className="space-y-1">
                    <h1 className="text-2xl font-bold tracking-tight text-foreground">Yêu cầu hỗ trợ</h1>
                    <p className="text-sm text-muted-foreground mt-1">Không thể tải dữ liệu. Vui lòng thử lại sau.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 pb-10 animate-fade-in">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                    <h1 className="text-2xl font-bold tracking-tight text-foreground">Yêu cầu hỗ trợ</h1>
                    <p className="text-sm text-muted-foreground mt-1 max-w-lg">Tạo và theo dõi các yêu cầu hỗ trợ kỹ thuật hoặc chương trình để được giải đáp nhanh chóng.</p>
                </div>
                <CreateTicketModal />
            </div>

            <TicketList tickets={tickets} />
        </div>
    );
}
