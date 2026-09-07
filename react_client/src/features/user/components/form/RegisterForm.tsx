import {
    EmailFormField,
    TextFormField,
} from '@/shared/FormFieldsComponent'
import { ErrorMsg } from '@/shared'

import { 
    useRegisterFormFields,
    useCreateMutation 
} from '../../service'
import { ServerException } from '@/core/errors';

import type { UserInput } from '../../schema';


export { 
    RegisterForm 
}


function RegisterForm({ onSubmit }: { 
    onSubmit: () => void }
) {
    const createMutation = useCreateMutation();
    const {
        name, email, errorMsg, setErrorMsg, validate, values, reset
    } = useRegisterFormFields()

    const handleSubmit = async (event: React.SubmitEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!validate()) return

        createMutation.mutate(values as UserInput, {
            onSuccess: async () => {
                reset()
                onSubmit()
            },
            onError: (error) => {
                if (error instanceof ServerException)
                    setErrorMsg(error.message);
            }
        })
    }

    return (
       <form onSubmit={handleSubmit}>
            <TextFormField field={name} />
            <EmailFormField field={email} />
            
            <ErrorMsg errorMsg={errorMsg} />
            <button type="submit">Send set password email</button>
        </form>
    ) 
};