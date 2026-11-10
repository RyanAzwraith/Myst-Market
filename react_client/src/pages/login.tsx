import { useNavigate } from "react-router-dom"

import { Page, Heading, Button } from "@/shared"

import { PageRoutes } from "@/app/PageRoutes"
import { LoginForm } from "@/features/auth"

export { LoginPage }

function LoginPage() {
    const navigate = useNavigate()
    return (
    <Page className="login-page auth-page">
        <Heading className="auth-page-title">Sign in</Heading>

        <LoginForm
        className="login-form-card"
        onSuccess={() => navigate(PageRoutes.profile)}
        />

        <Button
        variant="secondary"
        className="auth-switch-button"
        onClick={() => {
            navigate(PageRoutes.register)
        }}>
            Register
        </Button>
    </Page>
    )
}