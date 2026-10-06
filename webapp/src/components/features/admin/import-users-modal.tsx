"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Upload, FileSpreadsheet, AlertCircle, Download, AlertTriangle, CheckCircle2 } from "lucide-react";
import * as XLSX from "xlsx";
import { toast } from "sonner";
import { bulkCreateUsers } from "@/lib/actions/user";

export function ImportUsersModal({ children }: { children: React.ReactNode }) {
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [duplicateResult, setDuplicateResult] = useState<{
        duplicateEmails: string[];
        newCount: number;
        totalParsed: number;
    } | null>(null);

    const handleDownloadTemplate = () => {
        const templateData = [
            { email: "mentee1@example.com", firstName: "Nguyễn Văn", lastName: "A", role: "mentee", password: "123456" },
            { email: "mentor1@example.com", firstName: "Trần Thị", lastName: "B", role: "mentor", password: "123456" },
        ];
        const ws = XLSX.utils.json_to_sheet(templateData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Users");
        // Set column widths
        ws["!cols"] = [
            { wch: 25 }, // email
            { wch: 15 }, // firstName
            { wch: 10 }, // lastName
            { wch: 10 }, // role
            { wch: 10 }, // password
        ];
        XLSX.writeFile(wb, "template_nguoi_dung.xlsx");
        toast.success("Đã tải file mẫu");
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsLoading(true);
        setDuplicateResult(null);

        try {
            const data = await file.arrayBuffer();
            const workbook = XLSX.read(data);
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const json = XLSX.utils.sheet_to_json(worksheet) as any[];

            if (!json || json.length === 0) {
                toast.error("File trống hoặc không đúng định dạng", { description: "Vui lòng có các cột: email, firstName, lastName, role" });
                setIsLoading(false);
                return;
            }

            // Validate and map data
            const usersPayload = json.map((row) => ({
                email: (row.email || row.Email || "").trim(),
                firstName: (row.firstName || row.FirstName || row["First Name"] || "").trim(),
                lastName: (row.lastName || row.LastName || row["Last Name"] || "").trim(),
                role: (row.role || row.Role || "mentee").toLowerCase().trim(),
                password: (row.password || row.Password || "123456").toString().trim(),
            })).filter(u => u.email);

            if (usersPayload.length === 0) {
                toast.error("Không tìm thấy dữ liệu hợp lệ", { description: "Vui lòng kiểm tra lại định dạng file excel." });
                setIsLoading(false);
                return;
            }

            const result = await bulkCreateUsers(usersPayload);

            if (result.success) {
                if (result.duplicateEmails && result.duplicateEmails.length > 0) {
                    // Show duplicate information
                    setDuplicateResult({
                        duplicateEmails: result.duplicateEmails,
                        newCount: result.count || 0,
                        totalParsed: usersPayload.length,
                    });
                } else {
                    toast.success(`Đã thêm thành công ${result.count} người dùng`);
                    setIsOpen(false);
                }
            } else {
                toast.error("Có lỗi xảy ra", { description: result.error });
            }

        } catch (error: any) {
            console.error("Import error", error);
            toast.error("Lỗi khi đọc file Excel", { description: error.message });
        } finally {
            setIsLoading(false);
            if (e.target) e.target.value = "";
        }
    };

    const handleClose = () => {
        setDuplicateResult(null);
        setIsOpen(false);
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => { if (!open) handleClose(); else setIsOpen(true); }}>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className="sm:max-w-md rounded-2xl">
                <DialogHeader>
                    <DialogTitle className="text-xl">Import Người dùng từ Excel</DialogTitle>
                </DialogHeader>

                {duplicateResult ? (
                    /* Duplicate result view */
                    <div className="space-y-4 pt-2">
                        {duplicateResult.newCount > 0 && (
                            <div className="flex items-start gap-3 p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900">
                                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">
                                        Đã thêm {duplicateResult.newCount} người dùng mới
                                    </p>
                                </div>
                            </div>
                        )}

                        <div className="flex items-start gap-3 p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900">
                            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                            <div>
                                <p className="text-sm font-semibold text-amber-700 dark:text-amber-400">
                                    {duplicateResult.duplicateEmails.length} email đã tồn tại (bỏ qua)
                                </p>
                                <p className="text-xs text-amber-600/80 dark:text-amber-400/60 mt-1">
                                    Các email sau đã có trong hệ thống và không được ghi đè:
                                </p>
                            </div>
                        </div>

                        <div className="max-h-40 overflow-y-auto rounded-lg border border-border bg-muted/20 p-3">
                            <ul className="space-y-1">
                                {duplicateResult.duplicateEmails.map((email) => (
                                    <li key={email} className="text-xs font-mono text-muted-foreground flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                                        {email}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <DialogFooter>
                            <Button onClick={handleClose} className="w-full">Đóng</Button>
                        </DialogFooter>
                    </div>
                ) : (
                    /* Upload view */
                    <div className="space-y-6 pt-4">
                        <div className="bg-muted/30 p-4 rounded-xl space-y-3 text-sm border border-border/50">
                            <div className="flex items-center gap-2 font-semibold text-primary">
                                <AlertCircle className="w-4 h-4" />
                                <span>Hướng dẫn định dạng file</span>
                            </div>
                            <p className="text-muted-foreground leading-relaxed">
                                File Excel cần có dòng tiêu đề ở hàng đầu tiên với ít nhất các cột sau (không phân biệt hoa thường):
                            </p>
                            <ul className="list-disc pl-5 space-y-1 text-muted-foreground font-mono text-xs">
                                <li><span className="font-semibold text-foreground">email</span> (bắt buộc)</li>
                                <li><span className="font-semibold text-foreground">firstName</span></li>
                                <li><span className="font-semibold text-foreground">lastName</span></li>
                                <li><span className="font-semibold text-foreground">role</span> (mentee, mentor, facilitator...)</li>
                                <li><span className="font-semibold text-foreground">password</span> (mặc định: 123456)</li>
                            </ul>
                        </div>

                        <Button
                            variant="outline"
                            className="w-full gap-2"
                            onClick={handleDownloadTemplate}
                        >
                            <Download className="w-4 h-4" />
                            Tải file mẫu (.xlsx)
                        </Button>

                        <div className="flex items-center justify-center w-full">
                            <label className={`flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-xl cursor-pointer bg-muted/10 hover:bg-muted/30 hover:border-primary/50 transition-all ${isLoading ? 'opacity-50 pointer-events-none' : ''}`}>
                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                    <FileSpreadsheet className="w-10 h-10 mb-3 text-muted-foreground/60" />
                                    <p className="mb-2 text-sm text-muted-foreground">
                                        <span className="font-semibold text-primary block text-center mb-1">{isLoading ? "Đang xử lý..." : "Nhấn để tải lên file Excel"}</span>
                                        Hỗ trợ .xlsx, .xls
                                    </p>
                                    <p className="text-[10px] text-muted-foreground/60">
                                        Hệ thống sẽ không ghi đè dữ liệu cũ, chỉ thêm mới
                                    </p>
                                </div>
                                <input
                                    type="file"
                                    className="hidden"
                                    accept=".xlsx, .xls"
                                    onChange={handleFileUpload}
                                    disabled={isLoading}
                                />
                            </label>
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
