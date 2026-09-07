import { useNavigate } from "react-router-dom";

import { Page } from "@/shared";

import { PageRoutes } from "@/app/PageRoutes"

import { RegisterForm } from "@/features/user";


export { RegisterPage }

function RegisterPage() {
	const navigate = useNavigate();

	return (
		<Page >
			<h1 className="text-lg font-semibold mb-4">Register</h1>

            <RegisterForm 
            onSubmit={() => navigate(PageRoutes.login)}
            />

			<button onClick={() => {
				navigate(PageRoutes.login)
			}}>Login</button>
        </Page>
    )
}