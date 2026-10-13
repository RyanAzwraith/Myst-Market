import { useNavigate } from "react-router-dom";

import { Page, Heading } from "@/shared"

import { PageRoutes } from "@/app/PageRoutes"

import { SetPasswordForm } from "@/features/user"


export { SetPasswordPage }

function SetPasswordPage() {
    const navigate = useNavigate(); 
    return (
    <Page className="flex min-h-screen flex-col items-center justify-center gap-6 px-4">
        <Heading className="text-center text-3xl sm:text-4xl">
            Set Password
        </Heading>
        <SetPasswordForm 
        className={
            "w-full max-w-md space-y-4 rounded-xl border " +
            "border-gray-200 bg-white p-6 shadow-sm"
        }
        onSuccess={() => navigate(PageRoutes.profile)}
        />
    </Page>
    )
}