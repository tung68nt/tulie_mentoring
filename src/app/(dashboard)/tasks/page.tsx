import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getTasks } from "@/lib/actions/task";
import { KanbanBoard } from "@/components/features/tasks/kanban-board";
import { TaskListView } from "@/components/features/tasks/task-list-view";
import { TaskCalendarView } from "@/components/features/tasks/task-calendar-view";
import { TaskGanttView } from "@/components/features/tasks/task-gantt-view";
import { CreateTaskModal } from "@/components/features/tasks/create-task-modal";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LayoutGrid, List, Calendar as CalendarIcon, Clock } from "lucide-react";

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
                <TabsList className="bg-muted h-10 p-1 rounded-lg mb-6 self-start flex-nowrap overflow-x-auto">
                    <TabsTrigger value="kanban" className="rounded-md h-full px-4 data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all text-sm">
                        <LayoutGrid className="w-4 h-4 mr-1.5" />
                        Kanban
                    </TabsTrigger>
                    <TabsTrigger value="list" className="rounded-md h-full px-4 data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all text-sm">
                        <List className="w-4 h-4 mr-1.5" />
                        Danh sách
                    </TabsTrigger>
                    <TabsTrigger value="calendar" className="rounded-md h-full px-4 data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all text-sm">
                        <CalendarIcon className="w-4 h-4 mr-1.5" />
                        Lịch
                    </TabsTrigger>
                    <TabsTrigger value="gantt" className="rounded-md h-full px-4 data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all text-sm">
                        <Clock className="w-4 h-4 mr-1.5" />
                        Lịch trình
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="kanban" className="mt-0">
                    <KanbanBoard initialTasks={tasks} />
                </TabsContent>

                <TabsContent value="list" className="mt-0">
                    <TaskListView initialTasks={tasks} />
                </TabsContent>

                <TabsContent value="calendar" className="mt-0">
                    <TaskCalendarView initialTasks={tasks} />
                </TabsContent>

                <TabsContent value="gantt" className="mt-0">
                    <TaskGanttView initialTasks={tasks} />
                </TabsContent>
            </Tabs>
        </div>
    );
}
