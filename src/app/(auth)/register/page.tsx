import { RegisterForm } from "@/components/forms/register-form";
import { getSystemSettings } from "@/lib/actions/settings";

export default async function RegisterPage() {
    const settings = await getSystemSettings();

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-white">
            <div className="w-full max-w-md">
                <RegisterForm
                    logoUrl={settings.auth_logo}
                    siteName={settings.site_name}
                />
            </div>
        </div>
    );
}
