import { useNavigate } from "react-router-dom";

import { PageRoutes } from '@/PageRoutes'
import { ServerException } from "@/core"

import {
    EmailFormField,
    FormFieldsContainer,
    PasswordFormField,
} from "@/shared/FormFieldsComponent";

import type { Login } from "../schema";
import { 
    useLoginMutation,
    useLoginFormFields
} from "../service";

function LoginPage() {
	const navigate = useNavigate();
    const loginMutation = useLoginMutation();
    const loginFormFields = useLoginFormFields();

	const handleSubmit = async (event: React.SubmitEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!loginFormFields.validate()) return
 
        loginMutation.mutate(
            loginFormFields.values as Login, 
            {
            onSuccess: () => {
                loginFormFields.reset()
                navigate(PageRoutes.profile)
            },
            onError: (error) => {
                if (error instanceof ServerException)
                    loginFormFields.setErrorMsg(error.message);
            }
        });

    };

    return (
		<div className="max-w-md mx-auto mt-8 p-4">
			<h1 className="text-lg font-semibold mb-4">Sign in</h1>
			<form onSubmit={handleSubmit} className="space-y-4">
                <FormFieldsContainer>
                    <EmailFormField field={loginFormFields.email} />
                    <PasswordFormField field={loginFormFields.password} />
                </FormFieldsContainer>

				{loginFormFields.errorMsg &&
                    <p className="text-sm text-red-600">{loginFormFields.errorMsg}</p>}
				<button type="submit">Login</button>
			</form>

			<button onClick={() => {
				navigate(PageRoutes.register)
			}}>Register</button>
		</div>
    )
}

export { LoginPage };