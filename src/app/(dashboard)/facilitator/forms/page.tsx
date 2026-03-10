import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getEvaluationForms } from "@/lib/actions/evaluation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, PenLine, FileText, BarChart, Settings2 } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

export default async function FacilitatorFormsPage() {
    const session = await auth();
    if (!session?.user) redirect("/login");

    const forms = await getEvaluationForms();

    return (
        <div className="container mx-auto py-8 px-4 max-w-7xl">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h2 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-primary/90 to-primary/60 bg-clip-text text-transparent">Quản lý Evaluation Forms</h2>
                    <p className="text-muted-foreground mt-1">Thiết kế và tùy chỉnh các biểu mẫu đánh giá tiến độ mentorship.</p>
                </div>
                <Button className="h-11 rounded-xl gap-2 font-bold no-uppercase px-6 shadow-md transition-all hover:translate-y-[-2px]">
                    <Plus className="w-4 h-4" />
                    Tạo Form mới
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {forms.map((form: any) => (
                    <Card key={form.id} className="group border-none shadow-sm ring-1 ring-border rounded-2xl overflow-hidden hover:shadow-xl hover:ring-primary/20 transition-all duration-300 bg-background">
                        <CardHeader className="pb-3">
                            <div className="flex items-center justify-between gap-4 mb-2">
                                <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center text-primary border border-primary/10 group-hover:scale-110 transition-transform">
                                    <FileText className="w-5 h-5" />
                                </div>
                                <Badge variant={form.isActive ? "secondary" : "outline"} className={`text-[10px] font-bold py-0 ${form.isActive ? 'bg-green-500/10 text-green-600 border-none' : 'bg-muted/40 text-muted-foreground border-none'}`}>
                                    {form.isActive ? "ĐANG HOẠT ĐỘNG" : "NHÁP"}
                                </Badge>
                            </div>
                            <CardTitle className="text-lg font-bold group-hover:text-primary transition-colors">{form.title}</CardTitle>
                            <CardDescription className="line-clamp-2 text-[13px] leading-relaxed">
                                {form.description || "Không có mô tả chi tiết cho biểu mẫu này."}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="pb-4">
                            <div className="flex items-center gap-6">
                                <div className="flex flex-col">
                                    <span className="text-[12px] font-bold text-muted-foreground/60 uppercase tracking-wider">Câu hỏi</span>
                                    <span className="font-bold text-lg">{form._count.questions}</span>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[12px] font-bold text-muted-foreground/60 uppercase tracking-wider">Phản hồi</span>
                                    <span className="font-bold text-lg">{form._count.responses}</span>
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter className="bg-muted/30 p-4 pt-4 border-t border-border group-hover:bg-primary/5 transition-colors">
                            <Link href={`/facilitator/forms/${form.id}`} className="w-full">
                                <Button variant="ghost" className="w-full h-10 rounded-xl gap-2 font-bold text-muted-foreground hover:text-primary hover:bg-transparent transition-all no-uppercase group-hover:gap-3">
                                    <Settings2 className="w-4 h-4 opacity-70" />
                                    Thiết lập câu hỏi
                                </Button>
                            </Link>
                        </CardFooter>
                    </Card>
                ))}

                {forms.length === 0 && (
                    <div className="col-span-full py-16 text-center bg-muted/20 border-2 border-dashed border-muted rounded-3xl">
                        <Plus className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                        <p className="text-muted-foreground font-medium">Bạn chưa tạo biểu mẫu nào. Bắt đầu ngay!</p>
                    </div>
                )}
            </div>
        </div>
    );
}
