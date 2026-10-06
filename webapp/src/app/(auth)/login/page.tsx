import { LoginForm } from "@/components/forms/login-form";
import { getSystemSettings } from "@/lib/actions/settings";
import { UiStyleSwitch } from "@/components/ui/ui-style-switch";
import { Suspense } from "react";

export default async function LoginPage() {
    const settings = await getSystemSettings();

    return (
        <div className="min-h-screen flex items-center justify-center bg-background/50 relative px-4 transition-colors duration-500">
            <div className="w-full max-w-md relative z-10">
                <Suspense fallback={<div>Loading...</div>}>
                    <LoginForm
                        logoUrl={settings.auth_logo || "/logo.png"}
                        siteName={settings.site_name}
                    />
                </Suspense>
            </div>
        </div>
    );
}
