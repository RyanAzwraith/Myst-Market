import {
    EmailField,
    FormInputsContainer,
    FormInputsForm,
    TextField,
} from "@/hooks/FormInputs";
import { ErrorMsg } from '@/shared';

import { ServerException } from '@/core/errors';

import { 
    useUpdateFormInputs, 
    usePatchUserMutation
} from '../../service';
import type { UserInput } from '../../schema';


export {
    UpdateForm
}


function UpdateForm({ onSubmit } : {
    onSubmit?: () => void
}) {
    const updateProfileMutation = usePatchUserMutation();

    const updateFormInputs = useUpdateFormInputs();
    const {
        setErrorMsg, reset, getValidatedValues
    } = updateFormInputs;

    const handleSubmit = async (event: React.SubmitEvent<HTMLFormElement>) => {
        event.preventDefault();
        const values = getValidatedValues();
        if (!values) return 

        updateProfileMutation.mutate(values, {
            onSuccess:  ({user}) => {
                const { email, name } = user;
                reset({email, name})
                onSubmit?.()
            },
            onError: (error) => {
                if (error instanceof ServerException)
                    setErrorMsg(error.message);
            }
        })
    }

    return (
        <FormInputsForm
        formInputs={updateFormInputs}
        onSubmit={handleSubmit}
        submitLabel="Save"
        hasResetButton={true}
        />
    );
}

