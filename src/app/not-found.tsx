import Link from "next/link";

export default function NotFound() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-card px-4">
            <div className="text-center space-y-6 max-w-md">
                <div className="space-y-2">
                    <h1 className="text-[120px] font-bold text-foreground leading-none">404</h1>
                    <div className="w-16 h-[2px] bg-primary mx-auto" />
                </div>
                <div className="space-y-2">
                    <h2 className="text-xl font-semibold text-foreground">Trang không tồn tại</h2>
                    <p className="text-sm text-muted-foreground">
                        Trang bạn đang tìm kiếm không tồn tại hoặc đã bị di chuyển.
                    </p>
                </div>
                <Link
                    href="/"
                    className="inline-flex items-center justify-center h-10 px-6 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
                >
                    Về trang chủ
                </Link>
            </div>
        </div>
    );
}
