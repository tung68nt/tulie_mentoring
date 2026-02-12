"use client";

import { Button } from "@/components/ui/button";
import { RefreshCw, AlertTriangle } from "lucide-react";

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    return (
        <div className="min-h-[60vh] flex items-center justify-center">
            <div className="text-center space-y-6 max-w-md px-4">
                <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto">
                    <AlertTriangle className="w-7 h-7 text-red-500" />
                </div>
                <div className="space-y-2">
                    <h1 className="text-xl font-semibold text-black">Đã có lỗi xảy ra</h1>
                    <p className="text-sm text-[#666]">{error.message || "Một lỗi không xác định đã xảy ra. Vui lòng thử lại."}</p>
                </div>
                <Button onClick={reset}>
                    <RefreshCw className="w-4 h-4 mr-1.5" />
                    Thử lại
                </Button>
            </div>
        </div>
    );
}
