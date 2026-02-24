"use server";

import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { getWikiPageDetail } from "@/lib/actions/wiki";
import { WikiEditForm } from "./edit-form";

export default async function EditWikiPage({ params }: { params: { slug: string } }) {
    const session = await auth();
    if (!session?.user) redirect("/login");

    const role = (session.user as any).role;
    if (role === "mentee") redirect("/wiki");

    let page;
    try {
        page = await getWikiPageDetail(params.slug);
    } catch (e) {
        return notFound();
    }

    return <WikiEditForm page={page} />;
}
