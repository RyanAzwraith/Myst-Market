import { 
    UserCircleOutlineIcon, 
    UserCircleSolidIcon ,
    ModalTrigger,
    Heading,
    Button
} from "@/shared"

import {
    FormInputsForm,
} from "@/hooks/FormInputs";

import { 
    useLoginFormInputs 
} from '../hooks';
import { useAuthState } from "../state";



export { 
    LoginForm, 
    ProfileMenuButton
}

// Forms
function LoginForm({ onSuccess, className }: {
    onSuccess: () => void
    className?: string
}) {
    const form = useLoginFormInputs({onSuccess});

    return ( 
        <FormInputsForm
        formInputs={form}
        submitLabel="Login"
        className={`login-form ${className ?? ""}`}
        />
    )
}

// Menu Buttons
function ProfileMenuButton({onSolidClick, onOutlineClick}: {
    onSolidClick: () => void,
    onOutlineClick: () => void
}) {
    const isLoggedIn = useAuthState(state => state.isLoggedIn);

    if (isLoggedIn()) return (
        <UserCircleSolidIcon
        buttonClassName="profile-menu-button"
        onClick={onSolidClick} 
        />
    )
    return (
        <ModalTrigger
		dropdown
        mobileFullScreen
        wrapperClassName="profile-menu-button"
        button={
            <UserCircleOutlineIcon/>
        }
        dialogLabel="Sign in"
        modalClassName="profile-menu-modal"
        render={onClose => 
        <div className="profile-menu-content">
        <div className="profile-menu-header">
            <Heading level={2} className="profile-menu-title">
                Sign in
            </Heading>
            <Button
            variant="secondary"
            className="profile-menu-close-button"
            onClick={onClose}>
                Close
            </Button>
        </div>
            <LoginForm onSuccess={onClose}/>
            <div className="profile-menu-actions">
                <Button
                className="profile-menu-action"
                onClick={() => {
                onClose()
                onOutlineClick?.()
                }}>
                    Register
                </Button>
                <Button
                variant="secondary"
                className="profile-menu-action"
                onClick={onClose}
                >
                    Cancel
                </Button>
            </div>
        </div>
        }/>
    )
}