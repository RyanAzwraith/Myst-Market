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
        className={className}
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
        onClick={onSolidClick} 
        />
    )
    return (
        <ModalTrigger
		dropdown
        button={
            <UserCircleOutlineIcon/>
        }
        dialogLabel="Sign in"
        modalClassName="sm:w-96"
        render={onClose => 
        <div className="space-y-4 text-gray-900">
            <Heading level={2} className="text-xl">Sign in</Heading>
            <LoginForm onSuccess={onClose}/>
            <div className="flex flex-wrap gap-2">
                <Button
                className="flex-1"
                onClick={() => {
                onClose()
                onOutlineClick?.()
                }}>
                    Register
                </Button>
                <Button
                variant="secondary"
                className="flex-1"
                onClick={onClose}
                >
                    Cancel
                </Button>
            </div>
        </div>
        }/>
    )
}