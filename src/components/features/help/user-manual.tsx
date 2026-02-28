"use client";

import { X, HelpCircle, Book, Target, CheckCircle2, Calendar, QrCode, PenLine, FolderOpen, BookMarked, Users, MessageSquare, BarChart3, LayoutDashboard, ListTodo, Plus, Search, Bell, Settings, LogOut, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface UserManualProps {
    isOpen: boolean;
    onClose: () => void;
}

const sections = [
    {
        title: "Các thành phần chính",
        icon: LayoutDashboard,
        content: [
            {
                term: "Logo Tulie (T)",
                desc: "Nằm ở góc trên bên trái. Nhấn vào để quay lại trang chủ (tổng quan) từ bất kỳ đâu."
            },
            {
                term: "Thanh tìm kiếm",
                desc: "Giúp bạn tìm nhanh các tài liệu, công việc hoặc thông tin mentee/mentor trong hệ thống."
            },
            {
                term: "Icon thông báo (Chuông)",
                desc: "Nơi hiển thị các nhắc nhở về cuộc họp sắp tới, phản hồi mới hoặc các nhiệm vụ cần thực hiện."
            },
            {
                term: "Icon trợ giúp (?)",
                desc: "Chính là nút bạn vừa nhấn để xem hướng dẫn sử dụng này."
            }
        ]
    },
    {
        title: "Thuật ngữ hệ thống",
        icon: Info,
        content: [
            {
                term: "Mentor",
                desc: "Người dẫn dắt, hỗ trợ và định hướng cho bạn trong suốt chương trình."
            },
            {
                term: "Mentee",
                desc: "Người học, người nhận sự dẫn dắt và thực hiện các mục tiêu phát triển."
            },
            {
                term: "Mục tiêu (Goals)",
                desc: "Các đích đến dài hạn, có tính chiến lược thường kéo dài 3-6 tháng."
            },
            {
                term: "Công việc (Tasks)",
                desc: "Các bước nhỏ, cụ thể để hoàn thành mục tiêu. Có trạng thái: đang làm, hoàn thành, chờ."
            },
            {
                term: "Thu hoạch (Reflections)",
                desc: "Những bài học, kinh nghiệm quý báu được đúc kết lại sau mỗi giai đoạn hoặc sự kiện."
            }
        ]
    },
    {
        title: "Lịch & Điểm danh",
        icon: Calendar,
        content: [
            {
                term: "Đặt lịch hẹn",
                desc: "Mentor và mentee có thể xem lịch trống để sắp xếp các buổi gặp mặt (1:1)."
            },
            {
                term: "Mã QR / Check-in",
                desc: "Tại mỗi buổi họp, Mentor sẽ cung cấp mã QR. Mentee dùng tính năng 'Check-in' để quét và ghi nhận sự hiện diện."
            },
            {
                term: "Quản lý cuộc họp",
                desc: "Xem lại danh sách các buổi họp đã diễn ra và nội dung thảo luận (nếu có)."
            }
        ]
    },
    {
        title: "Theo dõi tiến độ",
        icon: ListTodo,
        content: [
            {
                term: "Nhật ký hằng ngày",
                desc: "Nơi ghi lại các hoạt động mỗi ngày: Lòng biết ơn, trọng tâm, bài học và tự do ghi chép."
            },
            {
                term: "Nhật ký hành trình (Portfolio)",
                desc: "Lưu trữ toàn bộ quá trình phát triển của bạn dưới dạng nhật ký hình ảnh và văn bản."
            },
            {
                term: "Báo cáo tiến độ",
                desc: "Biểu đồ và số liệu thống kê giúp bạn thấy rõ sự thay đổi của bản thân qua thời gian."
            }
        ]
    },
    {
        title: "Công cụ hỗ trợ",
        icon: BookMarked,
        content: [
            {
                term: "Wiki & Tài liệu",
                desc: "Hệ thống kiến thức nền tảng, các quy trình và tài liệu học tập dùng chung."
            },
            {
                term: "Whiteboard",
                desc: "Bảng vẽ trực tuyến dùng để brainstorming hoặc trình bày ý tưởng trong buổi họp."
            },
            {
                term: "Slides",
                desc: "Các bài thuyết trình, giáo án điện tử phục vụ cho việc học tập và giảng dạy."
            }
        ]
    },
    {
        title: "Tài khoản & Hỗ trợ",
        icon: Users,
        content: [
            {
                term: "Hồ sơ cá nhân",
                desc: "Cập nhật thông tin liên hệ, ảnh đại diện và đổi mật khẩu."
            },
            {
                term: "Yêu cầu hỗ trợ (Tickets)",
                desc: "Nếu gặp lỗi kỹ thuật hoặc cần sự giúp đỡ từ quản trị viên, hãy tạo một ticket tại đây."
            },
            {
                term: "Đăng xuất",
                desc: "Nhấn vào nút cuối cùng trên thanh menu để thoát khỏi hệ thống an toàn."
            }
        ]
    }
];

export function UserManual({ isOpen, onClose }: UserManualProps) {
    const [activeSection, setActiveSection] = useState(0);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center sm:justify-end">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-background/60 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            {/* Content Panel */}
            <div className={cn(
                "relative w-[95%] sm:w-[450px] max-w-lg h-[90vh] sm:h-full bg-background border border-border sm:border-l sm:border-t-0 sm:border-b-0 sm:border-r-0 flex flex-col shadow-none animate-in slide-in-from-bottom sm:slide-in-from-right duration-500 rounded-t-2xl sm:rounded-none",
            )}>
                {/* Header */}
                <div className="flex items-center justify-between px-6 h-20 border-b border-border shrink-0">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-2xl bg-primary/5 flex items-center justify-center text-primary border border-primary/10">
                            <HelpCircle className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-[16px] font-bold text-foreground no-uppercase leading-tight">Hướng dẫn sử dụng</h2>
                            <p className="text-[12px] text-muted-foreground/70 no-uppercase mt-0.5">Khám phá mọi tính năng của Tulie</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2.5 rounded-xl hover:bg-muted text-muted-foreground transition-all active:scale-95"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content Body */}
                <div className="flex-1 overflow-hidden flex flex-col sm:flex-row">
                    {/* Navigation sidebar */}
                    <div className="w-full sm:w-20 border-b sm:border-b-0 sm:border-r border-border bg-muted/5 flex sm:flex-col items-center py-2 sm:py-6 gap-2 sm:gap-4 overflow-x-auto sm:overflow-y-auto px-4 sm:px-0 scrollbar-none">
                        {sections.map((section, idx) => {
                            const Icon = section.icon;
                            return (
                                <button
                                    key={idx}
                                    onClick={() => setActiveSection(idx)}
                                    className={cn(
                                        "w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center transition-all shrink-0 relative group",
                                        activeSection === idx
                                            ? "bg-primary text-primary-foreground"
                                            : "text-muted-foreground/60 hover:bg-muted/80 hover:text-foreground"
                                    )}
                                    title={section.title}
                                >
                                    <Icon className="w-[20px] h-[20px]" />
                                    {activeSection === idx && (
                                        <div className="absolute left-0 w-1 h-6 bg-primary rounded-r-full -translate-x-0 hidden sm:block" />
                                    )}
                                    {activeSection === idx && (
                                        <div className="absolute bottom-0 w-6 h-1 bg-primary rounded-t-full sm:hidden" />
                                    )}
                                </button>
                            );
                        })}
                    </div>

                    {/* Section details */}
                    <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-8 scroll-smooth">
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <h3 className="text-[12px] font-bold text-primary no-uppercase tracking-widest mb-6 opacity-80">
                                {sections[activeSection].title}
                            </h3>

                            <div className="space-y-8">
                                {sections[activeSection].content.map((item, i) => (
                                    <div key={i} className="group flex gap-4">
                                        <div className="mt-1 w-1.5 h-1.5 rounded-full bg-primary/30 shrink-0 group-hover:bg-primary transition-colors duration-300 ml-1" />
                                        <div className="space-y-1.5">
                                            <h4 className="text-[14px] font-bold text-foreground no-uppercase tracking-tight">
                                                {item.term}
                                            </h4>
                                            <p className="text-[13px] text-muted-foreground/90 leading-relaxed no-uppercase no-italic font-normal max-w-[320px]">
                                                {item.desc}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {activeSection === 1 && (
                            <div className="mt-12 bg-primary/5 rounded-2xl p-5 border border-primary/10 animate-in zoom-in-95 duration-700">
                                <div className="flex items-center gap-3 mb-3">
                                    <Info className="w-4 h-4 text-primary" />
                                    <h4 className="text-[13px] font-bold text-primary no-uppercase">Lưu ý nhỏ</h4>
                                </div>
                                <p className="text-[12px] text-muted-foreground/80 leading-normal no-uppercase font-normal">
                                    Mọi dữ liệu bạn nhập đều được bảo mật và chỉ Mentor của bạn mới có quyền xem để hỗ trợ bạn tốt nhất.
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 sm:p-8 border-t border-border bg-muted/20">
                    <div className="flex flex-col gap-4">
                        <div className="text-[13px] text-muted-foreground no-uppercase font-normal leading-relaxed">
                            Vẫn còn thắc mắc? Đừng ngần ngại liên hệ với Mentor hoặc gửi ticket hỗ trợ nhé!
                        </div>
                        <button
                            onClick={onClose}
                            className="w-full h-11 rounded-xl bg-foreground text-background text-[13px] font-bold no-uppercase hover:opacity-90 transition-all active:scale-[0.98]"
                        >
                            Đã hiểu
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
