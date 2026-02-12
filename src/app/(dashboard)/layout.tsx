import { auth } from "@/lib/auth";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await auth();

    if (!session?.user) {
        redirect("/login");
    }

    const user = {
        id: session.user.id!,
        firstName: (session.user as any).firstName,
        lastName: (session.user as any).lastName,
        role: (session.user as any).role,
        avatar: session.user.image,
    };

    return (
        <div className="min-h-screen bg-white">
            <Sidebar role={user.role} />

            {/* Main Content Area */}
            <div className="lg:ml-[var(--sidebar-width)] min-h-screen flex flex-col">
                <Header
                    userName={`${user.firstName} ${user.lastName || ""}`}
                    userRole={user.role}
                    avatar={user.avatar}
                />

                <main className="flex-1 px-6 sm:px-8 lg:px-10 pt-20 pb-10 max-w-7xl mx-auto w-full">
                    <div className="animate-fade-in">
                        {children}
                    </div>
                </main>

                <footer className="p-6 text-center text-xs text-[#999] border-t border-[#eaeaea]">
                    © {new Date().getFullYear()} ISME Mentoring Program (IMP) - Đại học Kinh tế Quốc dân. All rights reserved.
                </footer>
            </div>
        </div>
    );
}
