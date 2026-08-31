import { UserCircleIcon as OutlineIcon } from "@heroicons/react/24/outline";
import { UserCircleIcon as SolidIcon } from "@heroicons/react/24/solid";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { ServerException } from "@/core"
import { PopUpModalComponent } from "@/shared/PopUpModalComponent"
import { ToggleComponent } from "@/shared/ToggleComponent"
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
import { AppRoutes } from "@/AppRoutes";
import { useAuthState } from "./authState";
import { loginRoute } from "./authApi";

function ProfileButtonComponent() {
	const navigate = useNavigate();
	const accessToken = useAuthState(state => state.accessToken)

	return (
		<ToggleComponent
		state={accessToken != null}
		onChild={
			<SolidIcon 
			aria-label="solidIcon"
			aria-hidden="false"
			className="h-6 w-6" 
			onClick={() => navigate(AppRoutes.profile)} 
			/>
		}
		offChild={
			<PopUpModalComponent
			content={onClose => <LoginModalContent onClose={onClose}/>}
			>
				<OutlineIcon
				aria-label="outLineIcon"
				aria-hidden="false"
				className="h-6 w-6" 
				/>
			</PopUpModalComponent>
		}
		/>
	)
}

function LoginModalContent(props:{
	onClose: () => void
}) {
	const login = useAuthState(state => state.login);
	const navigate = useNavigate();
	const form = useFormFields({
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
    })
	
	const handleSubmit = async (event: React.SubmitEvent<HTMLFormElement>) => {
			event.preventDefault();
			if (!form.validate()) return
			try {
				const {accessToken, userResponse } = await loginRoute({
                    email: form.email.get(),
                    password: form.password.get(),
                })
				login(accessToken, userResponse);
				props.onClose();
				form.reset()
			} catch (error) {
				if (error instanceof ServerException)
					form.setErrorMsg(error.message);
			}
		};
	
	return (
		<>
			<h1>Sign in</h1>
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
				props.onClose()
				navigate(AppRoutes.register)
			}}>
				Register
			</button>

			<button onClick={props.onClose}> Cancel </button>
		</>
	);

}

export { ProfileButtonComponent };
