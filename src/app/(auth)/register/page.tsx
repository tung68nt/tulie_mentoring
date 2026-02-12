import { RegisterForm } from "@/components/forms/register-form";

export default function RegisterPage() {
    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-white">
            <div className="w-full max-w-md">
                <RegisterForm />
            </div>
        </div>
    );
}
