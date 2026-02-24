import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getTasks } from "@/lib/actions/task";
import { KanbanBoard } from "@/components/features/tasks/kanban-board";
import { CreateTaskModal } from "@/components/features/tasks/create-task-modal";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LayoutGrid, List, Calendar as CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default async function TasksPage() {
    const session = await auth();
    if (!session?.user) {
        redirect("/login");
    }

    const tasks = await getTasks();

    return (
        <div className="space-y-10 pb-20 animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold tracking-tight text-foreground no-uppercase">Quản lý công việc</h1>
                    <p className="text-sm text-muted-foreground mt-1 max-w-lg">
                        Theo dõi và quản lý các công việc cần thực hiện để đạt được mục tiêu cá nhân.
                    </p>
                </div>
                <CreateTaskModal />
            </div>

            <Tabs defaultValue="kanban" className="w-full">
                <TabsList className="bg-muted/50 p-1.5 rounded-2xl mb-8 h-auto">
                    <TabsTrigger value="kanban" className="rounded-xl px-6 py-3 data-[state=active]:bg-background shadow-none transition-all">
                        <LayoutGrid className="w-4 h-4 mr-2" />
                        <span className="no-uppercase font-medium">Kanban</span>
                    </TabsTrigger>
                    <TabsTrigger value="list" className="rounded-xl px-6 py-3 data-[state=active]:bg-background shadow-none transition-all">
                        <List className="w-4 h-4 mr-2" />
                        <span className="no-uppercase font-medium">Danh sách</span>
                    </TabsTrigger>
                    <TabsTrigger value="calendar" className="rounded-xl px-6 py-3 data-[state=active]:bg-background shadow-none transition-all">
                        <CalendarIcon className="w-4 h-4 mr-2" />
                        <span className="no-uppercase font-medium">Lịch</span>
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="kanban" className="mt-0">
                    <KanbanBoard initialTasks={tasks} />
                </TabsContent>

                <TabsContent value="list" className="mt-0">
                    <div className="p-20 text-center bg-muted/20 border border-dashed border-border rounded-3xl">
                        <p className="text-sm text-muted-foreground font-medium">Chế độ xem danh sách đang được cập nhật...</p>
                    </div>
                </TabsContent>

                <TabsContent value="calendar" className="mt-0">
                    <div className="p-20 text-center bg-muted/20 border border-dashed border-border rounded-3xl">
                        <p className="text-sm text-muted-foreground font-medium">Chế độ xem lịch đang được cập nhật...</p>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
