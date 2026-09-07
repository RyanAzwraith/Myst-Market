import { useNavigate } from "react-router-dom"

import { Page } from "@/shared"

import { PageRoutes } from "@/app/PageRoutes"
import { LoginForm } from "@/features/auth"

export { LoginPage }

function LoginPage() {
    const navigate = useNavigate()
    return (
        <Page>
			<h1>Sign in</h1>

            <LoginForm
            onSubmit={() => navigate(PageRoutes.profile)}
            />
    
			<button onClick={() => {
				navigate(PageRoutes.register)
			}}>Register</button>
        </Page>
    )
}