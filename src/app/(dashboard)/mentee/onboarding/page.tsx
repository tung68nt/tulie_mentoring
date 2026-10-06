import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getMenteeProfile } from "@/lib/actions/onboarding";
import { OnboardingForm } from "@/components/forms/onboarding-form";

export default async function MenteeOnboardingPage() {
    const session = await auth();

    if (!session?.user) {
        redirect("/login");
    }

    if ((session.user as any).role !== "mentee") {
        redirect("/");
    }

    // Check if already completed
    const profile = await getMenteeProfile();
    if (profile?.isOnboardingComplete) {
        redirect("/mentee");
    }

    return (
        <div className="py-8">
            <OnboardingForm />
        </div>
    );
}
