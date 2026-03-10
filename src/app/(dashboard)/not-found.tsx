import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, AlertCircle } from "lucide-react";

export default function NotFound() {
    return (
        <div className="min-h-[60vh] flex items-center justify-center">
            <div className="text-center space-y-6 max-w-md px-4">
                <div className="w-16 h-16 rounded-full bg-muted border border-border flex items-center justify-center mx-auto">
                    <AlertCircle className="w-7 h-7 text-muted-foreground" />
                </div>
                <div className="space-y-2">
                    <h1 className="text-4xl font-bold text-foreground">404</h1>
                    <p className="text-sm text-muted-foreground">Trang bạn đang tìm không tồn tại hoặc đã bị di chuyển.</p>
                </div>
                <Button variant="outline" asChild>
                    <Link href="/">
                        <ArrowLeft className="w-4 h-4 mr-1.5" />
                        Quay lại trang chủ
                    </Link>
                </Button>
            </div>
        </div>
    );
}
