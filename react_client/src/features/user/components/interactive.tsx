import { 
    Button, 
    ModalTrigger, 
    Span 
} from "@/shared";

import {
    FormInputsForm,
} from '@/hooks/FormInputs'


import { useLogoutMutation } from "../index";

import { 
    useDeleteMutation, 
    useSendPasswordEmailMutation 
} from "../service";

import { 
    useRegisterFormInputs,
    useSetPasswordFormInputs,
    useUpdateFormInputs,
} from '../hook'


export { 
    RegisterForm,
    UpdateForm,
    SetPasswordForm,
    LogoutButton,
    PasswordResetButton,
    DeleteUserButton
}


// Forms
function RegisterForm({ onSuccess }: { 
    onSuccess?: () => void }
) {
    const formInputs = useRegisterFormInputs({onSuccess})
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
    const formInputs = useSetPasswordFormInputs({onSuccess})
    return (
        <FormInputsForm 
        formInputs={formInputs}
        submitLabel="Send set password email"
        />
    ) 
}

function UpdateForm({ onSuccess }: {
    onSuccess?: () => void
}) {
    const updateFormInputs = useUpdateFormInputs({onSuccess});
    return (
        <FormInputsForm
        formInputs={updateFormInputs}
        submitLabel="Save"
        hasResetButton={true}
        />
    );
}


// Buttons
function LogoutButton({ onSuccess } : {
    onSuccess?: () => void
}) {
    const {mutate} = useLogoutMutation({ onSuccess });
    return (
        <Button 
        onClick={() => mutate()}
        >
            Logout
        </Button>
    )
}

function PasswordResetButton({ onSuccess } : {
    onSuccess?: () => void
}) {
    const { mutate } = useSendPasswordEmailMutation({onSuccess})
    return (
        <Button
        onClick={() => mutate()}>
            Set password with email
        </Button>
    )
}   

function DeleteUserButton({ onSuccess }: { 
    onSuccess?: () => void 
}) {
    const {mutate} = useDeleteMutation({onSuccess})
    return (
        <ModalTrigger
        button={
            <Span> Delete Profile</Span>
        }
        render={onClose => 
        <>
            <h2>Are you sure you'd like to delete your Profile?</h2>
            <Button 
            onClick={() => mutate(undefined, {onSuccess: () => onClose()})}
            >
                Yes
            </Button>
            <Button onClick={onClose} >No</Button>
        </>
        } />
    )
}