import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import WhiteboardEditorClient from "@/components/features/whiteboard/WhiteboardEditorClient";

export default async function WhiteboardPage({ params }: { params: { id: string } }) {
    const session = await auth();
    if (!session?.user) {
        redirect("/login");
    }

    const { id } = await params;

    return (
        <div className="fixed inset-0 z-50 bg-background overflow-hidden">
            <WhiteboardEditorClient id={id} />
        </div>
    );
}
