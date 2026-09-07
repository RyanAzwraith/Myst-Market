
import { ServerException } from "@/core"

import {
    EmailFormField,
    PasswordFormField,
} from "@/shared/FormFieldsComponent";
import { ErrorMsg } from '@/shared';

import type { Login } from "../schema";
import { 
    useLoginMutation,
    useLoginFormFields
} from "../service";

export { LoginForm }


function LoginForm( {onSubmit }: {
    onSubmit: () => void
}) {
    const loginMutation = useLoginMutation();
    const {
        email, password, errorMsg, validate, reset, setErrorMsg, values
    } = useLoginFormFields();

	const handleSubmit = async (event: React.SubmitEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!validate()) return
 
        loginMutation.mutate( values as Login, {
            onSuccess: () => {
                reset()
                onSubmit()
            },
            onError: (error) => {
                if (error instanceof ServerException)
                    setErrorMsg(error.message);
            }
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <EmailFormField field={email} />
            <PasswordFormField field={password} />

            <ErrorMsg errorMsg={errorMsg} />

            <button type="submit">Login</button>
        </form>
    )
}