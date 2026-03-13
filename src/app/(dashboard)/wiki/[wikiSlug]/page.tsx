"use server";

import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { getWikiDetail } from "@/lib/actions/wiki";
import { WikiDetailView } from "@/components/features/wiki/wiki-detail-view";

export default async function WikiDetailPage({ params }: { params: Promise<{ wikiSlug: string }> }) {
    const session = await auth();
    if (!session?.user) redirect("/login");

    const { wikiSlug } = await params;
    const role = (session.user as any).role;
    let wiki;
    try {
        wiki = await getWikiDetail(wikiSlug);
    } catch (e) {
        return notFound();
    }

    return <WikiDetailView wiki={wiki} role={role} />;
}
