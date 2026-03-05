"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getSystemSettings, updateSystemSettings } from "@/lib/actions/settings";
import { toast } from "sonner";
import { Image as ImageIcon, Globe, Sidebar as SidebarIcon, Lock, Save, Loader2 } from "lucide-react";

export default function AdminSettingsPage() {
    const [settings, setSettings] = useState<Record<string, string>>({
        site_name: "Tulie Mentoring",
        favicon: "",
        sidebar_logo: "",
        auth_logo: "",
    });
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        const fetchSettings = async () => {
            const data = await getSystemSettings();
            setSettings(prev => ({ ...prev, ...data }));
            setIsLoading(false);
        };
        fetchSettings();
    }, []);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await updateSystemSettings(settings);
            toast.success("Đã cập nhật cấu hình hệ thống");
        } catch (error) {
            toast.error("Không thể cập nhật cấu hình");
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 animate-spin text-primary/40" />
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8 p-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
                <h1 className="text-2xl font-bold text-foreground no-uppercase">Cấu hình hệ thống</h1>
                <p className="text-muted-foreground text-sm mt-1">Thay đổi nhận diện thương hiệu, logo và favicon của ứng dụng.</p>
            </div>

            <div className="grid gap-6">
                {/* General Settings */}
                <Card className="p-6 border border-border/60 shadow-none rounded-2xl">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                            <Globe className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="font-bold text-foreground no-uppercase">Cấu hình chung</h2>
                            <p className="text-[12px] text-muted-foreground">Tên website và các thông tin cơ bản</p>
                        </div>
                    </div>
                    <div className="space-y-4">
                        <Input
                            label="Tên ứng dụng (Site Name)"
                            value={settings.site_name}
                            onChange={(e) => setSettings({ ...settings, site_name: e.target.value })}
                            placeholder="Ví dụ: Tulie Mentoring"
                        />
                        <Input
                            label="Favicon URL"
                            value={settings.favicon}
                            onChange={(e) => setSettings({ ...settings, favicon: e.target.value })}
                            placeholder="https://example.com/favicon.ico"
                            endIcon={<ImageIcon className="w-4 h-4 text-muted-foreground/40" />}
                        />
                    </div>
                </Card>

                {/* Sidebar Logo */}
                <Card className="p-6 border border-border/60 shadow-none rounded-2xl">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-500">
                            <SidebarIcon className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="font-bold text-foreground no-uppercase">Logo Sidebar</h2>
                            <p className="text-[12px] text-muted-foreground">Logo hiển thị ở menu bên trái</p>
                        </div>
                    </div>
                    <div className="grid md:grid-cols-2 gap-8 items-start">
                        <div className="space-y-4">
                            <Input
                                label="Logo Sidebar URL"
                                value={settings.sidebar_logo}
                                onChange={(e) => setSettings({ ...settings, sidebar_logo: e.target.value })}
                                placeholder="https://example.com/logo-sidebar.png"
                            />
                            <p className="text-[11px] text-muted-foreground italic">* Nên sử dụng ảnh có nền trong suốt (PNG/SVG) và kích thước vuông.</p>
                        </div>
                        <div className="p-6 rounded-xl border border-dashed border-border flex flex-col items-center justify-center bg-muted/5">
                            <span className="text-[10px] font-bold text-muted-foreground/40 mb-4 no-uppercase">Xem trước Sidebar Logo</span>
                            {settings.sidebar_logo ? (
                                <img src={settings.sidebar_logo} alt="Sidebar Logo Preview" className="h-10 w-auto object-contain" />
                            ) : (
                                <div className="w-10 h-10 bg-primary rounded-md flex items-center justify-center">
                                    <span className="text-primary-foreground font-bold text-xs">{settings.site_name?.charAt(0) || 'T'}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </Card>

                {/* Auth Logo */}
                <Card className="p-6 border border-border/60 shadow-none rounded-2xl">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-500">
                            <Lock className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="font-bold text-foreground no-uppercase">Logo Đăng nhập / Đăng ký</h2>
                            <p className="text-[12px] text-muted-foreground">Logo hiển thị ở các trang xác thực</p>
                        </div>
                    </div>
                    <div className="grid md:grid-cols-2 gap-8 items-start">
                        <div className="space-y-4">
                            <Input
                                label="Logo Auth URL"
                                value={settings.auth_logo}
                                onChange={(e) => setSettings({ ...settings, auth_logo: e.target.value })}
                                placeholder="https://example.com/logo-auth.png"
                            />
                        </div>
                        <div className="p-6 rounded-xl border border-dashed border-border flex flex-col items-center justify-center bg-muted/5">
                            <span className="text-[10px] font-bold text-muted-foreground/40 mb-4 no-uppercase">Xem trước Auth Logo</span>
                            {settings.auth_logo ? (
                                <img src={settings.auth_logo} alt="Auth Logo Preview" className="h-16 w-auto object-contain" />
                            ) : (
                                <div className="text-center">
                                    <div className="w-8 h-8 bg-primary/20 rounded-full mx-auto mb-2" />
                                    <span className="text-xs text-muted-foreground italic">Chưa có logo</span>
                                </div>
                            )}
                        </div>
                    </div>
                </Card>
            </div>

            <div className="flex justify-end pt-4">
                <Button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="rounded-xl px-8 shadow-none h-12"
                >
                    {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                    Lưu cấu hình hệ thống
                </Button>
            </div>
        </div>
    );
}
