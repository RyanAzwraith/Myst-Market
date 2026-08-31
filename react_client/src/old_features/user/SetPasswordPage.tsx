import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import { ServerException } from "@/core"
import {
    passwordField,
    useFormFields,
} from "@/utils/useFormFields"
import {
    FormFieldsContainer,
    PasswordFormField,
} from "@/shared/FormFieldsComponent";
import { AppRoutes } from '@/AppRoutes'
import { useAuthState } from "./authState";
import { patchUserPasswordRoute } from "./authApi";

function SetPasswordPage() {
    const login = useAuthState(state => state.login);
    const navigate = useNavigate();
	
    const [searchParams] = useSearchParams();
    const token = searchParams.get("token");
    useEffect(() => {if (!token) navigate(AppRoutes.login)}, [token]);

    const form = useFormFields({
        password: passwordField({
            label: "Password",
            placeholder: "Password",
            validate: value => value ? null : "Password required",
        }),
        secondaryPassword: passwordField({
            label: "Re-enter",
            placeholder: "Re-enter",
            validate: value => value ? null : "Password required",
        }),
    })
	
	const handleSubmit = async (event: React.SubmitEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (form.password.get() !== form.secondaryPassword.get()) {
            form.setErrorMsg("Password must match");
            return
        }
        if (!form.validate()) return
        try {
            const {accessToken, userResponse} =
                await patchUserPasswordRoute({
                    password: form.password.get(),
                });
			login(accessToken, userResponse)
            navigate(AppRoutes.profile)
        } catch (error) {
            if (error instanceof ServerException)
                form.setErrorMsg(error.message);
        }
    };
	
    return (
		<div className="max-w-md mx-auto mt-8 p-4">
			<h1 className="text-lg font-semibold mb-4">Set Password</h1>
			<form onSubmit={handleSubmit} className="space-y-4">
                <FormFieldsContainer>
                    <PasswordFormField field={form.password} />
                    <PasswordFormField field={form.secondaryPassword} />
                </FormFieldsContainer>

				{form.errorMsg &&
                    <p className="text-sm text-red-600">{form.errorMsg}</p>}
				<button type="submit">Submit</button>
			</form>
		</div>
    )
}

export { SetPasswordPage };