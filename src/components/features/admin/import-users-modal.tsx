"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Upload, FileSpreadsheet, AlertCircle } from "lucide-react";
import * as XLSX from "xlsx";
import { toast } from "sonner";
import { bulkCreateUsers } from "@/lib/actions/user";

export function ImportUsersModal({ children }: { children: React.ReactNode }) {
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsLoading(true);

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

            // Validating required fields minimally
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
                toast.success(`Đã thêm thành công ${result.count} người dùng`);
                setIsOpen(false);
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

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className="sm:max-w-md rounded-2xl">
                <DialogHeader>
                    <DialogTitle className="text-xl">Import Người dùng từ Excel</DialogTitle>
                </DialogHeader>

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

                    <div className="flex items-center justify-center w-full">
                        <label className={`flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-xl cursor-pointer bg-muted/10 hover:bg-muted/30 hover:border-primary/50 transition-all ${isLoading ? 'opacity-50 pointer-events-none' : ''}`}>
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                <FileSpreadsheet className="w-10 h-10 mb-3 text-muted-foreground/60" />
                                <p className="mb-2 text-sm text-muted-foreground">
                                    <span className="font-semibold text-primary block text-center mb-1">{isLoading ? "Đang xử lý..." : "Nhấn để tải lên file Excel"}</span>
                                    Hỗ trợ .xlsx, .xls
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
            </DialogContent>
        </Dialog>
    );
}
