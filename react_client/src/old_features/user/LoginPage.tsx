import { useNavigate } from "react-router-dom";

import { ServerException } from "@/core"
import {
    emailField,
    passwordField,
    useFormFields,
    validateEmail,
} from "@/utils/useFormFields"
import {
    EmailFormField,
    FormFieldsContainer,
    PasswordFormField,
} from "@/shared/FormFieldsComponent";
import { AppRoutes } from '@/AppRoutes'
import { useAuthState } from "./authState";
import { loginRoute } from "./authApi";

function LoginPage() {
    const login = useAuthState(state => state.login);
	const navigate = useNavigate();

	const fields = {
        email: emailField({
            label: "Email",
            placeholder: "Email",
            validate: validateEmail,
        }),
        password: passwordField({
            label: "Password",
            placeholder: "Password",
            validate: value => value ? null : "Password required",
        }),
    };
	const form = useFormFields(fields);
	
	const handleSubmit = async (event: React.SubmitEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!form.validate()) return
        try {
            const {accessToken, userResponse} = await loginRoute({
                email: form.email.get(),
                password: form.password.get(),
            });
			login(accessToken, userResponse)
            form.reset()
			navigate(AppRoutes.profile)
        } catch (error) {
            if (error instanceof ServerException)
                form.setErrorMsg(error.message);
        }
    };

    return (
		<div className="max-w-md mx-auto mt-8 p-4">
			<h1 className="text-lg font-semibold mb-4">Sign in</h1>
			<form onSubmit={handleSubmit} className="space-y-4">
                <FormFieldsContainer>
                    <EmailFormField field={form.email} />
                    <PasswordFormField field={form.password} />
                </FormFieldsContainer>

				{form.errorMsg &&
                    <p className="text-sm text-red-600">{form.errorMsg}</p>}
				<button type="submit">Login</button>
			</form>

			<button onClick={() => {
				navigate(AppRoutes.register)
			}}>Register</button>
		</div>
    )
}

export { LoginPage };