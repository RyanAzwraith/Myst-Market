import {
    FormInputsForm,
} from '@/hooks/FormInputs'

import { 
    useRegisterFormInputs,
    useSetPasswordFormInputs,
    useUpdateFormInputs,

} from '../service'


export { 
    RegisterForm,
    UpdateForm,
    SetPasswordForm,
}


function RegisterForm({ onSuccess }: { 
    onSuccess?: () => void }
) {
    const formInputs = useRegisterFormInputs(onSuccess)
    return (
        <FormInputsForm 
        formInputs={formInputs}
        submitLabel="Send set password email"
        />
    ) 
};

function SetPasswordForm({ onSuccess }: {
    onSuccess?: () => void
}) {
    const formInputs = useSetPasswordFormInputs(onSuccess)
    return (
        <FormInputsForm 
        formInputs={formInputs}
        submitLabel="Send set password email"
        />
    ) 
}

function UpdateForm({ onSuccess } : {
    onSuccess?: () => void
}) {
    const updateFormInputs = useUpdateFormInputs(onSuccess);
    return (
        <FormInputsForm
        formInputs={updateFormInputs}
        submitLabel="Save"
        hasResetButton={true}
        />
    );
}