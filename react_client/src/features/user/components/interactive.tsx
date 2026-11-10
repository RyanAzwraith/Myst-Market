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
function RegisterForm({ onSuccess, className }: { 
    onSuccess?: () => void
    className?: string
}
) {
    const formInputs = useRegisterFormInputs({onSuccess})
    return (
        <FormInputsForm 
        formInputs={formInputs}
        submitLabel="Send set password email"
        className={`register-form ${className ?? ""}`}
        />
    ) 
};

function SetPasswordForm({ onSuccess, className }: {
    onSuccess?: () => void
    className?: string
}) {
    const formInputs = useSetPasswordFormInputs({onSuccess})
    return (
        <FormInputsForm 
        formInputs={formInputs}
        submitLabel="Send set password email"
        className={`set-password-form ${className ?? ""}`}
        />
    ) 
}

function UpdateForm({ onSuccess, className }: {
    onSuccess?: () => void
    className?: string
}) {
    const updateFormInputs = useUpdateFormInputs({onSuccess});
    return (
        <FormInputsForm
        formInputs={updateFormInputs}
        submitLabel="Save"
        hasResetButton={true}
        className={`user-update-form ${className ?? ""}`}
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
        className="user-logout-button"
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
        className="user-password-reset-button"
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
        wrapperClassName="user-delete-button"
        className="user-delete-trigger"
        modalClassName="user-delete-modal"
        button={
            <Span> Delete Profile</Span>
        }
        render={onClose => 
        <div className="user-delete-confirmation">
            <h2 className="user-delete-confirmation-title">
                Are you sure you'd like to delete your Profile?
            </h2>
            <div className="user-delete-confirmation-actions">
                <Button
                variant="danger"
            onClick={() => mutate(undefined, {onSuccess: () => onClose()})}
                >
                    Yes, delete
                </Button>
                <Button
                variant="secondary"
                onClick={onClose}
                >
                    Cancel
                </Button>
            </div>
        </div>
        } />
    )
}