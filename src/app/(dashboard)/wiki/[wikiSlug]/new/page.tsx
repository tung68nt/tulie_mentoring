"use server";

import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { getWikiDetail } from "@/lib/actions/wiki";
import { NewWikiPageForm } from "@/components/features/wiki/new-wiki-page-form";

export default async function NewWikiPageRoute({ params }: { params: Promise<{ wikiSlug: string }> }) {
    const session = await auth();
    if (!session?.user) redirect("/login");

    const { wikiSlug } = await params;
    let wiki;
    try {
        wiki = await getWikiDetail(wikiSlug);
    } catch (e) {
        return notFound();
    }

    return <NewWikiPageForm wikiSlug={wiki.slug} wikiId={wiki.id} wikiTitle={wiki.title} />;
}
