import { getMentorships } from "@/lib/actions/mentorship";
import { getGoals } from "@/lib/actions/goal";

export default async function TestErrorPage() {
    try {
        console.log("Test: Fetching mentorships");
        const mentorships = await getMentorships();
        console.log("Test: Mentorships count:", mentorships.length);

        if (mentorships.length > 0) {
            console.log("Test: Fetching goals for first mentorship:", mentorships[0].id);
            const goals = await getGoals(mentorships[0].id);
            console.log("Test: Goals count:", goals.length);
        }

        return <div>All good! Check console for counts.</div>;
    } catch (err: any) {
        return (
            <div className="p-10 text-destructive">
                <h1 className="text-xl font-bold">Caught Error:</h1>
                <pre className="bg-muted p-4 mt-4 whitespace-pre-wrap text-xs">
                    {err.message}
                    {"\n\n"}
                    {err.stack}
                </pre>
            </div>
        );
    }
}
