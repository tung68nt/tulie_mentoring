import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function RootPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const role = (session.user as any).role;

  switch (role) {
    case "admin":
      redirect("/admin");
    case "mentor":
      redirect("/mentor");
    case "mentee":
      redirect("/mentee");
    case "viewer":
      redirect("/reports");
    default:
      redirect("/login");
  }
}
