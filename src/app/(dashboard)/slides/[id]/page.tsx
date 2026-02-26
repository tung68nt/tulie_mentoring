import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import SlideEditor from "@/components/features/slides/SlideEditor";

export default async function SlidePage({ params }: { params: { id: string } }) {
    const session = await auth();
    if (!session?.user) {
        redirect("/login");
    }

    const { id } = await params;

    return (
        <div className="flex flex-col h-full overflow-hidden">
            <SlideEditor id={id} />
        </div>
    );
}
