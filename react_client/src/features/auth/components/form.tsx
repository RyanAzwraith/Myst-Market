import type { SubmitEvent } from 'react';

import {
    FormInputsForm,
} from "@/hooks/FormInputs";

import { ServerException } from "@/core"

import { 
    useLoginMutation,
    useLoginFormInputs
} from "../service";


export { LoginForm }


function LoginForm( {onSubmit }: {
    onSubmit: () => void
}) {
    const loginMutation = useLoginMutation();
    const {
        reset, setErrorMsg, getValidatedValues
    } = useLoginFormInputs();

	const handleSubmit = (event: SubmitEvent<HTMLFormElement>) => {
        event.preventDefault();
        const values = getValidatedValues();
        if (!values) return
 
        loginMutation.mutate( values, {
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
        <FormInputsForm
        formInputs={useLoginFormInputs()}
        onSubmit={handleSubmit}
        submitLabel="Login"
        />
    )
}