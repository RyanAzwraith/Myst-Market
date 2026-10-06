import { useNavigate } from "react-router-dom"

import { Page, Heading, Button } from "@/shared"

import { PageRoutes } from "@/app/PageRoutes"
import { LoginForm } from "@/features/auth"

export { LoginPage }

function LoginPage() {
    const navigate = useNavigate()
    return (
    <Page>
        <Heading>Sign in</Heading>

        <LoginForm
        onSuccess={() => navigate(PageRoutes.profile)}
        />

        <Button onClick={() => {
            navigate(PageRoutes.register)
        }}>
            Register
        </Button>
    </Page>
    )
}