import { useNavigate } from "react-router-dom";

import { PageRoutes } from "@/app/PageRoutes"

import { RegisterForm } from "@/features/user";
import { Page, Heading, Button } from "@/shared";


export { RegisterPage }


function RegisterPage() {
	const navigate = useNavigate()
	return (
	<Page className="flex min-h-screen flex-col items-center justify-center gap-6 px-4">
		<Heading className="text-3xl sm:text-4xl">Register</Heading>

		<RegisterForm 
		className={
			"w-full max-w-md space-y-4 rounded-xl border " +
			"border-gray-200 bg-white p-6 shadow-sm"
		}
		onSuccess={() => navigate(PageRoutes.login)}
		/>

		<Button 
		variant="secondary"
		className="w-full max-w-md"
		onClick={() => { navigate(PageRoutes.login)}}
		>
			Login
		</Button>
	</Page>
    )
}