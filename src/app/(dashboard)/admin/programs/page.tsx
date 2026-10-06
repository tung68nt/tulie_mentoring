import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getAllProgramCycles } from "@/lib/actions/program";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Plus, Calendar, Settings2, Trash2, Edit } from "lucide-react";
import { formatDate } from "@/lib/utils";
import Link from "next/link";
import { ProgramDialog } from "@/components/features/admin/program-dialog";
import { DeleteProgramButton } from "@/components/features/admin/delete-program-button";

export default async function AdminProgramsPage() {
    const session = await auth();
    const role = (session?.user as any)?.role;
    if (!session?.user || !["admin", "program_manager"].includes(role)) {
        redirect("/login");
    }

    try {
        const programs = await getAllProgramCycles();

        return (
            <div className="space-y-8 pb-10">
                <div className="flex items-center justify-between">
                    <div className="space-y-1">
                        <h1 className="text-2xl font-semibold text-foreground">Quản lý Chương trình (Cycles)</h1>
                        <p className="text-sm text-muted-foreground mt-1">Cấu hình các đợt Mentoring trong hệ thống</p>
                    </div>
                    <ProgramDialog mode="create">
                        <Button>
                            <Plus className="w-4 h-4 mr-2" />
                            Thêm chương trình
                        </Button>
                    </ProgramDialog>
                </div>

                <div className="rounded-xl border border-border bg-card overflow-hidden">
                    <Table>
                        <TableHeader className="bg-muted/50">
                            <TableRow>
                                <TableHead>Tên chương trình</TableHead>
                                <TableHead>Trạng thái</TableHead>
                                <TableHead>Thời gian</TableHead>
                                <TableHead className="text-right">Thao tác</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {programs.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="h-48 text-center text-muted-foreground">
                                        Chưa có chương trình nào được tạo.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                programs.map((program: any) => (
                                    <TableRow key={program.id}>
                                        <TableCell>
                                            <div className="font-semibold text-foreground">
                                                {program.name}
                                            </div>
                                            <p className="text-xs text-muted-foreground line-clamp-1 max-w-md">
                                                {program.description || "Không có mô tả"}
                                            </p>
                                        </TableCell>
                                        <TableCell>
                                            <Badge status={program.status} size="sm" />
                                        </TableCell>
                                        <TableCell className="text-muted-foreground whitespace-nowrap">
                                            <div className="flex items-center gap-2">
                                                <Calendar className="w-3.5 h-3.5" />
                                                <span className="text-xs">{formatDate(program.startDate)} - {formatDate(program.endDate)}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <ProgramDialog mode="edit" program={program}>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary transition-colors">
                                                        <Edit className="w-4 h-4" />
                                                    </Button>
                                                </ProgramDialog>
                                                <DeleteProgramButton
                                                    programId={program.id}
                                                    programName={program.name}
                                                />
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>
        );
    } catch (error) {
        console.error("Failed to fetch programs:", error);
        return (
            <div className="p-8 text-center border border-destructive/20 rounded-xl bg-destructive/5">
                <p className="text-destructive font-semibold">Không thể tải danh sách chương trình. Vui lòng thử lại sau.</p>
            </div>
        );
    }
}
