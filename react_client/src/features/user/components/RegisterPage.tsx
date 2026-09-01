import { useNavigate } from 'react-router-dom';
import { type UserInput } from '../index'

import { ServerException } from '@/core';
import {
    EmailFormField,
    FormFieldsContainer,
    TextFormField,
} from '@/shared/FormFieldsComponent'
import { PageRoutes } from "@/PageRoutes"

import { 
    useRegisterFormFields,
    useCreateMutation 
} from '../service'

export { RegisterPage };

function RegisterPage() {
	const navigate = useNavigate();
    const {
        name, email, errorMsg, setErrorMsg, validate, values, reset
    } = useRegisterFormFields()
    const createMutation = useCreateMutation();

    const handleSubmit = async (event: React.SubmitEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!validate()) return

        createMutation.mutate(
            values as UserInput, {
                onSuccess: async () => {
                    reset()
                    navigate(PageRoutes.login)
                },
                onError: (error) => {
                    if (error instanceof ServerException)
                        setErrorMsg(error.message);
                }
        })
};

	return (
		<div className="max-w-md mx-auto mt-8 p-4">
			<h1 className="text-lg font-semibold mb-4">Register</h1>
			<form onSubmit={handleSubmit} className="space-y-4">
                <FormFieldsContainer>
                    <TextFormField field={name} />
                    <EmailFormField field={email} />
                </FormFieldsContainer>
                
				{errorMsg &&
                    <p className="text-sm text-red-600">{errorMsg}</p>}
				<button type="submit">Send set password email</button>
			</form>

			<button onClick={() => {
				navigate(PageRoutes.login)
			}}>Login</button>
        </div>
    )
}   
