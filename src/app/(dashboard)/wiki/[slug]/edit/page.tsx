"use server";

import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { getWikiPageDetail } from "@/lib/actions/wiki";
import { WikiEditForm } from "./edit-form";

export default async function EditWikiPage({ params }: { params: Promise<{ slug: string }> }) {
    const session = await auth();
    if (!session?.user) redirect("/login");

    const role = (session.user as any).role;
    if (role === "mentee") redirect("/wiki");

    const { slug } = await params;
    let page;
    try {
        page = await getWikiPageDetail(slug);
    } catch (e) {
        return notFound();
    }

    return <WikiEditForm page={page} />;
}
