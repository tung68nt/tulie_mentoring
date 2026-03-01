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
        title: "Tổng quan Dashboard",
        icon: LayoutDashboard,
        content: [
            {
                term: "Bảng tin (Home)",
                desc: "Nơi tổng hợp mọi thứ quan trọng nhất: buổi họp sắp tới, mục tiêu đang thực hiện và biểu đồ tiến độ gần đây của bạn."
            },
            {
                term: "Tiến độ rèn luyện",
                desc: "Lưới 10 ngày (hoặc hơn) thể hiện sự kỷ luật của bạn. Các ô xanh đậm là những ngày bạn đã ghi nhật ký đầy đủ."
            },
            {
                term: "Widget Mục tiêu",
                desc: "Hiển thị nhanh các mục tiêu quan trọng nhất. Bạn có thể theo dõi phần trăm hoàn thành ngay tại đây."
            },
            {
                term: "Thành phần thanh Menu",
                desc: "Từ trên xuống: Dashboard, Wiki kiến thức, Lịch hoạt động, Danh sách công việc, Nhật ký hành trình, và Hỗ trợ."
            }
        ]
    },
    {
        title: "Cuộc họp & Điểm danh",
        icon: Calendar,
        content: [
            {
                term: "Chủ động lên lịch",
                desc: "Trong vai trò Mentee, bạn có thể chủ động nhấn 'Lên lịch mới' trên trang Lịch để đề xuất buổi gặp với Mentor, thay vì chờ đợi."
            },
            {
                term: "Tham gia họp Online",
                desc: "Với các buổi gọi video, chỉ cần nhấn 'Tham gia & Check-in'. Hệ thống sẽ tự động điểm danh khi bạn mở link họp."
            },
            {
                term: "Check-in Offline",
                desc: "Quét mã QR do Mentor cung cấp hoặc nhập mã 6 ký tự để ghi nhận sự hiện diện tại buổi họp trực tiếp."
            },
            {
                term: "Check-out (Điểm danh ra)",
                desc: "Đừng quên nhấn Check-out khi kết thúc buổi họp để ghi lại chính xác thời lượng bạn đã tham gia."
            }
        ]
    },
    {
        title: "Mục tiêu & Công việc",
        icon: Target,
        content: [
            {
                term: "Thiết lập Mục tiêu (Goals)",
                desc: "Xác định các mục tiêu chiến lược (Career, Skill, Project...). Chia nhỏ mục tiêu lớn thành các giá trị định lượng (ví dụ: 0-100%)."
            },
            {
                term: "Mục tiêu nhỏ (Sub-goals)",
                desc: "Mỗi mục tiêu lớn có thể chứa nhiều mục tiêu nhỏ với trọng số khác nhau để tính toán tiến độ chính xác nhất."
            },
            {
                term: "Bảng Kanban (Tasks)",
                desc: "Quản lý công việc hàng ngày qua 4 trạng thái: Cần làm, Đang làm, Đợi review, và Hoàn thành. Kéo thả để cập nhật trạng thái."
            },
            {
                term: "Ghi chú & Đính kèm",
                desc: "Trong mỗi công việc, bạn có thể lưu lại mô tả chi tiết, đính kèm tài liệu hoặc thảo luận trực tiếp với Mentor."
            }
        ]
    },
    {
        title: "Nhật ký & Thu hoạch",
        icon: PenLine,
        content: [
            {
                term: "Thực hành Lòng biết ơn",
                desc: "Hãy khởi đầu mỗi ngày bằng việc ghi lại những điều khiến bạn cảm thấy trân trọng để nuôi dưỡng tâm thế tích cực."
            },
            {
                term: "Trọng tâm & Bài học",
                desc: "Xác định việc quan trọng nhất cần làm và đúc kết lại ít nhất một kinh nghiệm mới sau mỗi ngày làm việc."
            },
            {
                term: "Nhật ký tự do",
                desc: "Viết thoải mái suy nghĩ của bạn (Free-writing) để giải tỏa căng thẳng và khơi nguồn sáng tạo."
            },
            {
                term: "Thu hoạch buổi họp",
                desc: "Sau mỗi buổi họp, hãy viết 'Session Reflection' để tổng kết các nội dung chính đã học được từ Mentor."
            }
        ]
    },
    {
        title: "Kiến thức & Tài liệu",
        icon: BookMarked,
        content: [
            {
                term: "Thư viện tài liệu",
                desc: "Nơi lưu trữ các file, link bài viết và giáo trình do Admin hoặc Mentor chia sẻ riêng cho lộ trình của bạn."
            },
            {
                term: "Wiki Agency",
                desc: "Các quy trình chuẩn, triết lý vận hành và kiến thức nền tảng của Tulie giúp bạn hòa nhập nhanh hơn."
            },
            {
                term: "Phân loại tags",
                desc: "Sử dụng các nhãn (tags) để lọc nhanh tài liệu theo chủ đề (Marketing, Tech, Management...)."
            }
        ]
    },
    {
        title: "Tài khoản & Hỗ trợ",
        icon: Users,
        content: [
            {
                term: "Hồ sơ cá nhân (Portfolio)",
                desc: "Xây dựng thương hiệu cá nhân qua các chỉ số MBTI, DISC, kỹ năng và mục tiêu dài hạn của bạn."
            },
            {
                term: "Vé hỗ trợ (Tickets)",
                desc: "Nếu hệ thống bị lỗi hoặc bạn có ý kiến đóng góp, hãy tạo Ticket để đội ngũ kỹ thuật xử lý nhanh nhất."
            },
            {
                term: "Cài đặt & Bảo mật",
                desc: "Thay đổi mật khẩu định kỳ và cập nhật ảnh đại diện để Mentor dễ dàng nhận diện và hỗ trợ bạn."
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
                "relative w-[95%] sm:w-[450px] max-w-lg h-[90vh] sm:h-full bg-background border border-border sm:border-l sm:border-t-0 sm:border-b-0 sm:border-r-0 flex flex-col shadow-none animate-in slide-in-from-right duration-500 rounded-t-2xl sm:rounded-none",
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
                            <h3 className="text-[12px] font-bold text-primary no-uppercase mb-6 opacity-80">
                                {sections[activeSection].title}
                            </h3>

                            <div className="space-y-8">
                                {sections[activeSection].content.map((item, i) => (
                                    <div key={i} className="group flex gap-4">
                                        <div className="mt-1 w-1.5 h-1.5 rounded-full bg-primary/30 shrink-0 group-hover:bg-primary transition-colors duration-300 ml-1" />
                                        <div className="space-y-1.5">
                                            <h4 className="text-[14px] font-bold text-foreground no-uppercase">
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
