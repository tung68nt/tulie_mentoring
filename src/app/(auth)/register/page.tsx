import { RegisterForm } from "@/components/forms/register-form";

export default function RegisterPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
            <div className="w-full max-w-md">
                <RegisterForm />
            </div>
        </div>
    );
}
