"use server";

import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { getWikiPageDetail } from "@/lib/actions/wiki";
import { WikiEditForm } from "@/components/features/wiki/wiki-edit-form";

export default async function EditWikiPageRoute({ params }: { params: Promise<{ wikiSlug: string; pageSlug: string }> }) {
    const session = await auth();
    if (!session?.user) redirect("/login");

    const role = (session.user as any).role;
    if (role === "mentee") redirect("/wiki");

    const { wikiSlug, pageSlug } = await params;
    let page;
    try {
        page = await getWikiPageDetail(pageSlug);
    } catch (e) {
        return notFound();
    }

    return <WikiEditForm page={page} wikiSlug={wikiSlug} />;
}
