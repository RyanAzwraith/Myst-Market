import { useNavigate } from "react-router-dom"

import { Page, Heading, Button } from "@/shared"

import { PageRoutes } from "@/app/PageRoutes"
import { LoginForm } from "@/features/auth"

export { LoginPage }

function LoginPage() {
    const navigate = useNavigate()
    return (
    <Page className="flex min-h-screen flex-col items-center justify-center gap-6 px-4">
        <Heading className="text-3xl sm:text-4xl">Sign in</Heading>

        <LoginForm
        className={
            "w-full max-w-md space-y-4 rounded-xl border " +
            "border-gray-200 bg-white p-6 shadow-sm"
        }
        onSuccess={() => navigate(PageRoutes.profile)}
        />

        <Button
        variant="secondary"
        className="w-full max-w-md"
        onClick={() => {
            navigate(PageRoutes.register)
        }}>
            Register
        </Button>
    </Page>
    )
}