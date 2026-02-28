import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getWhiteboards } from "@/lib/actions/whiteboard";
import { Button } from "@/components/ui/button";
import { PlusCircle, PenLine } from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default async function WhiteboardListPage() {
    const session = await auth();
    if (!session?.user) {
        redirect("/login");
    }

    try {
        const whiteboards = await getWhiteboards();

        return (
            <div className="space-y-8 pb-10 animate-fade-in">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Whiteboard</h1>
                        <p className="text-sm text-muted-foreground mt-1 max-w-lg">Sáng tạo, phác thảo ý tưởng và cộng tác trực quan trên bảng trắng.</p>
                    </div>
                    <Link href="/whiteboard/new">
                        <Button className="rounded-lg h-10 px-6 font-medium gap-2">
                            <PlusCircle className="w-4 h-4" />
                            Tạo bảng mới
                        </Button>
                    </Link>
                </div>

                {whiteboards.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-xl bg-muted/20">
                        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                            <PenLine className="w-8 h-8 text-muted-foreground" />
                        </div>
                        <h3 className="text-lg font-semibold">Chưa có bảng nào</h3>
                        <p className="text-sm text-muted-foreground mt-1 mb-6">Hãy bắt đầu tạo bảng đầu tiên của bạn.</p>
                        <Link href="/whiteboard/new">
                            <Button variant="outline" className="rounded-lg">Tạo ngay</Button>
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {whiteboards.map((board: any) => (
                            <Link key={board.id} href={`/whiteboard/${board.id}`}>
                                <Card className="hover:border-primary/50 transition-all duration-300 rounded-xl overflow-hidden border-border/60 group shadow-none">
                                    <CardHeader className="p-0">
                                        <div className="aspect-video bg-muted relative overflow-hidden">
                                            {board.thumbnail ? (
                                                /* eslint-disable-next-line @next/next/no-img-element */
                                                <img
                                                    src={board.thumbnail}
                                                    alt={board.title}
                                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center">
                                                    <PenLine className="w-8 h-8 text-muted-foreground/30" />
                                                </div>
                                            )}
                                            <div className="absolute top-2 right-2">
                                                <div className={`px-2 py-0.5 rounded-md text-[11px] font-semibold ${board.status === 'public' ? 'bg-emerald-500 text-white' : 'bg-muted-foreground/20 text-muted-foreground'
                                                    }`}>
                                                    {board.status === 'public' ? 'Công khai' : 'Riêng tư'}
                                                </div>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="p-4">
                                        <h3 className="font-semibold truncate group-hover:text-primary transition-colors">{board.title || 'Untitled'}</h3>
                                        <p className="text-[11px] text-muted-foreground mt-1">
                                            Cập nhật {board.updatedAt ? new Date(board.updatedAt).toLocaleDateString() : 'N/A'}
                                        </p>
                                    </CardContent>
                                </Card>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        );
    } catch (error) {
        console.error("Failed to fetch whiteboards:", error);
        return (
            <div className="p-12 text-center border border-destructive/20 bg-destructive/5 rounded-xl">
                <p className="text-destructive font-medium">Không thể tải danh sách Whiteboards. Vui lòng kiểm tra kết nối cơ sở dữ liệu.</p>
                <p className="text-xs text-muted-foreground mt-2">Lỗi: {error instanceof Error ? error.message : "Internal Server Error"}</p>
            </div>
        );
    }
}
