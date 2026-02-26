import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import WhiteboardEditor from "@/components/features/whiteboard/WhiteboardEditor";

export default async function WhiteboardPage({ params }: { params: { id: string } }) {
    const session = await auth();
    if (!session?.user) {
        redirect("/login");
    }

    const { id } = await params;

    return (
        <div className="fixed inset-0 z-50 bg-background overflow-hidden">
            <WhiteboardEditor id={id} />
        </div>
    );
}
