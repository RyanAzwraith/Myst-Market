import { useNavigate } from "react-router-dom";

import { PageRoutes } from "@/app/PageRoutes"

import { RegisterForm } from "@/features/user";
import { Page, Heading, Button } from "@/shared";


export { RegisterPage }


function RegisterPage() {
	const navigate = useNavigate()
	return (
	<Page>
		<Heading>Register</Heading>

		<RegisterForm 
		onSuccess={() => navigate(PageRoutes.login)}
		/>

		<Button 
		onClick={() => { navigate(PageRoutes.login)}}
		>
			Login
		</Button>
	</Page>
    )
}