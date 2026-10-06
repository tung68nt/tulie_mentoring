import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getSlides } from "@/lib/actions/slide";
import { Button } from "@/components/ui/button";
import { PlusCircle, Presentation } from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default async function SlideListPage() {
    const session = await auth();
    if (!session?.user) {
        redirect("/login");
    }

    try {
        const slides = await getSlides();

        return (
            <div className="space-y-8 pb-10 animate-fade-in">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                        <h1 className="text-2xl font-semibold tracking-tight text-foreground no-uppercase">Slides</h1>
                        <p className="text-sm text-muted-foreground mt-1 max-w-lg">Tạo và chia sẻ các bài thuyết trình chuyên nghiệp từ Markdown.</p>
                    </div>
                    <Link href="/slides/new">
                        <Button className="rounded-lg h-10 px-6 font-medium gap-2">
                            <PlusCircle className="w-4 h-4" />
                            Tạo slide mới
                        </Button>
                    </Link>
                </div>

                {slides.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-xl bg-muted/20">
                        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                            <Presentation className="w-8 h-8 text-muted-foreground" />
                        </div>
                        <h3 className="text-lg font-semibold">Chưa có slide nào</h3>
                        <p className="text-sm text-muted-foreground mt-1 mb-6">Hãy bắt đầu tạo bài thuyết trình đầu tiên của bạn.</p>
                        <Link href="/slides/new">
                            <Button variant="outline" className="rounded-lg">Tạo ngay</Button>
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {slides.map((slide: any) => (
                            <Link key={slide.id} href={`/slides/${slide.id}`}>
                                <Card className="hover:border-primary/50 transition-all duration-300 rounded-xl overflow-hidden border-border/60 group h-full flex flex-col shadow-none">
                                    <CardHeader className="p-0">
                                        <div className="aspect-video bg-zinc-900 flex items-center justify-center relative overflow-hidden">
                                            <div className="text-center p-4">
                                                <Presentation className="w-8 h-8 text-zinc-700 mx-auto mb-2" />
                                                <span className="text-[10px] text-zinc-600 font-mono tracking-tighter block">Reveal.js Theme: {slide.theme}</span>
                                            </div>
                                            <div className="absolute top-2 right-2">
                                                <div className={`px-2 py-0.5 rounded-md text-[11px] font-semibold ${slide.status === 'public' ? 'bg-emerald-500 text-white' : 'bg-muted-foreground/20 text-muted-foreground'
                                                    }`}>
                                                    {slide.status === 'public' ? 'Công khai' : 'Riêng tư'}
                                                </div>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="p-4 flex-1 flex flex-col justify-between">
                                        <div>
                                            <h3 className="font-semibold truncate group-hover:text-primary transition-colors">{slide.title || 'Untitled'}</h3>
                                            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{slide.description || 'No description'}</p>
                                        </div>
                                        <p className="text-[11px] text-muted-foreground mt-4 italic">
                                            Cập nhật {slide.updatedAt ? new Date(slide.updatedAt).toLocaleDateString() : 'N/A'}
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
        console.error("Failed to fetch slides:", error);
        return (
            <div className="p-12 text-center border border-destructive/20 bg-destructive/5 rounded-xl">
                <p className="text-destructive font-medium">Không thể tải danh sách Slides. Vui lòng kiểm tra kết nối cơ sở dữ liệu.</p>
                <p className="text-xs text-muted-foreground mt-2">Lỗi: {error instanceof Error ? error.message : "Internal Server Error"}</p>
            </div>
        );
    }
}
