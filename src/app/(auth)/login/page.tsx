import { LoginForm } from "@/components/forms/login-form";
import { getSystemSettings } from "@/lib/actions/settings";
import { Suspense } from "react";

export default async function LoginPage() {
    const settings = await getSystemSettings();

    return (
        <div className="min-h-screen flex items-center justify-center bg-white px-4">
            <div className="w-full max-w-md">
                <Suspense fallback={<div>Loading...</div>}>
                    <LoginForm
                        logoUrl={settings.auth_logo}
                        siteName={settings.site_name}
                    />
                </Suspense>
            </div>
        </div>
    );
}
