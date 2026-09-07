import {
    EmailFormField,
    TextFormField,
} from "@/shared/FormFieldsComponent";
import { ErrorMsg } from '@/shared';

import { ServerException } from '@/core/errors';

import { 
    useUpdateFormFields, 
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
    const {
        name, email, errorMsg, setErrorMsg, validate, values, reset
    } = useUpdateFormFields();

    const handleSubmit = async (event: React.SubmitEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!validate()) return 

        updateProfileMutation.mutate(values as Partial<UserInput>, {
            onSuccess:  ({user}) => {
                reset({email: user.email, name: user.name})
                onSubmit?.()
            },
            onError: (error) => {
                if (error instanceof ServerException)
                    setErrorMsg(error.message);
            }
        })
    }

    return (
        <form onSubmit={handleSubmit}>
            <TextFormField 
            field={name} 
            />
            <EmailFormField
            field={email}
            />
            
            <ErrorMsg errorMsg={errorMsg} />

            <button type="submit">
                Save
            </button>

            <button 
            type="button"
            onClick={() => reset()}
            >
                Cancel
            </button>
            
        </form>
    );
}

