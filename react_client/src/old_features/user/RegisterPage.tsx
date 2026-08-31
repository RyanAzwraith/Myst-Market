import { useNavigate } from 'react-router-dom';
import { useAuthState } from './authState'

import {
    emailField,
    textField,
    useFormFields,
    validateEmail,
} from '@/utils/useFormFields'
import { ServerException } from '@/core';
import {
    EmailFormField,
    FormFieldsContainer,
    TextFormField,
} from '@/shared/FormFieldsComponent'
import { AppRoutes } from "@/AppRoutes"
import { registerRoute } from './authApi';

function RegisterPage() {
	const navigate = useNavigate();

    const form = useFormFields({
        name: textField({
            label: "Name",
            placeholder: "Name",
            validate: value => value.trim() ? null : "Name required",
        }),
        email: emailField({
            label: "Email",
            placeholder: "Email",
            validate: validateEmail,
        }),
    })

    const handleSubmit = async (event: React.SubmitEvent<HTMLFormElement>) => {
            event.preventDefault();
            if (!form.validate()) return
            try {
                await registerRoute({
                    email: form.email.get(),
                    name: form.name.get(),
                });
				form.reset()
				navigate(AppRoutes.login)
            } catch (error) {
                if (error instanceof ServerException) {
					form.setErrorMsg(error.message);
				}
            }
        };

	return (
		<div className="max-w-md mx-auto mt-8 p-4">
			<h1 className="text-lg font-semibold mb-4">Register</h1>
			<form onSubmit={handleSubmit} className="space-y-4">
                <FormFieldsContainer>
                    <TextFormField field={form.name} />
                    <EmailFormField field={form.email} />
                </FormFieldsContainer>
                
				{form.errorMsg &&
                    <p className="text-sm text-red-600">{form.errorMsg}</p>}
				<button type="submit">Send set password email</button>
			</form>

			<button onClick={() => {
				navigate(AppRoutes.login)
			}}>Login</button>
        </div>
    )
}   

export { RegisterPage };
