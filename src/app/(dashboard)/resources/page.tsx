import { auth } from "@/lib/auth";
import { getResources } from "@/lib/actions/resource";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    FileText,
    Link as LinkIcon,
    Download,
    ExternalLink,
    Search,
    Plus,
    Filter,
    File,
    MoreVertical,
    FolderOpen
} from "lucide-react";
import { formatDate } from "@/lib/utils";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

export default async function ResourcesPage() {
    const session = await auth();
    const role = (session?.user as any).role;
    const categories = ["Thài liệu", "Biểu mẫu", "Video", "Sách điện tử", "Khác"];

    const resources = await getResources();

    const getIcon = (type: string) => {
        switch (type) {
            case "link": return <LinkIcon className="w-5 h-5 text-blue-500" />;
            case "document": return <FileText className="w-5 h-5 text-amber-500" />;
            default: return <File className="w-5 h-5 text-emerald-500" />;
        }
    };

    return (
        <div className="space-y-8 pb-10">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Thư viện Tài nguyên</h1>
                    <p className="text-gray-500 mt-1">Tổng hợp tài liệu, biểu mẫu và hướng dẫn trong chương trình</p>
                </div>
                {(role === "admin" || role === "mentor") && (
                    <Button asChild>
                        <Link href="/resources/new">
                            <Plus className="w-4 h-4 mr-2" />
                            Tải lên tài liệu
                        </Link>
                    </Button>
                )}
            </div>

            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Tìm kiếm tài liệu theo tên, từ khóa..."
                        className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-100 bg-white focus:outline-none focus:ring-2 focus:ring-gray-900 transition-all text-sm"
                    />
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="rounded-xl">
                        <Filter className="w-4 h-4 mr-2" />
                        Bộ lọc
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Sidebar Categories */}
                <div className="space-y-6">
                    <Card className="p-4">
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 px-2">Danh mục</h3>
                        <div className="space-y-1">
                            <button className="w-full text-left px-3 py-2 rounded-lg bg-gray-900 text-white text-sm font-bold flex items-center justify-between">
                                Tất cả tài liệu
                                <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded-md">{resources.length}</span>
                            </button>
                            {categories.map(cat => (
                                <button key={cat} className="w-full text-left px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-50 text-sm font-medium flex items-center justify-between transition-colors">
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </Card>

                    <Card className="bg-emerald-900 text-white p-6 border-none overflow-hidden relative">
                        <div className="relative z-10">
                            <h4 className="text-sm font-bold mb-2">Bạn có tài liệu hay?</h4>
                            <p className="text-xs text-white/70 leading-relaxed mb-4">Chia sẻ kiến thức của bạn với cộng đồng Mentoring ngay hôm nay.</p>
                            <Button size="sm" variant="outline" className="text-white border-white/30 hover:bg-white/10">Chia sẻ ngay</Button>
                        </div>
                        <FolderOpen className="absolute -bottom-4 -right-4 w-24 h-24 text-white/5 rotate-12" />
                    </Card>
                </div>

                {/* Resource Grid */}
                <div className="lg:col-span-3">
                    {resources.length === 0 ? (
                        <Card className="py-20 flex flex-col items-center justify-center text-center">
                            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-gray-400 mb-6">
                                <FileText className="w-8 h-8" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900">Chưa có tài liệu nào</h3>
                            <p className="text-sm text-gray-500 max-w-xs mt-1">
                                Hãy là người đầu tiên đóng góp tài liệu cho thư viện.
                            </p>
                        </Card>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {resources.map(res => (
                                <Card key={res.id} hover className="p-5 flex items-start gap-4">
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 bg-gray-50`}>
                                        {getIcon(res.type)}
                                    </div>
                                    <div className="flex-1 min-w-0 space-y-1">
                                        <div className="flex items-start justify-between">
                                            <h4 className="text-sm font-bold text-gray-900 truncate pr-2">{res.title}</h4>
                                            <button className="text-gray-400 hover:text-gray-900 transition-colors">
                                                <MoreVertical className="w-4 h-4" />
                                            </button>
                                        </div>
                                        <p className="text-xs text-gray-500 line-clamp-1">{res.description || "Không có mô tả."}</p>
                                        <div className="flex items-center gap-3 pt-2">
                                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{res.category}</span>
                                            <span className="w-1 h-1 bg-gray-200 rounded-full" />
                                            <span className="text-[10px] text-gray-400">{formatDate(res.createdAt)}</span>
                                        </div>
                                        <div className="flex items-center gap-2 pt-3">
                                            {res.type === "link" ? (
                                                <Button variant="outline" size="sm" className="h-8 text-[10px] font-bold uppercase tracking-widest px-3" asChild>
                                                    <a href={res.linkUrl!} target="_blank" rel="noopener noreferrer">
                                                        <ExternalLink className="w-3 h-3 mr-1.5" />
                                                        Truy cập link
                                                    </a>
                                                </Button>
                                            ) : (
                                                <Button variant="outline" size="sm" className="h-8 text-[10px] font-bold uppercase tracking-widest px-3">
                                                    <Download className="w-3 h-3 mr-1.5" />
                                                    Tải xuống
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
