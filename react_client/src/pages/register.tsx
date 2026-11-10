import { useNavigate } from "react-router-dom";

import { PageRoutes } from "@/app/PageRoutes"

import { RegisterForm } from "@/features/user";
import { Page, Heading, Button } from "@/shared";


export { RegisterPage }


function RegisterPage() {
	const navigate = useNavigate()
	return (
	<Page className="register-page auth-page">
		<Heading className="auth-page-title">Register</Heading>

		<RegisterForm 
		className="register-form-card"
		onSuccess={() => navigate(PageRoutes.login)}
		/>

		<Button 
		variant="secondary"
		className="auth-switch-button"
		onClick={() => { navigate(PageRoutes.login)}}
		>
			Login
		</Button>
	</Page>
    )
}