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
function LoginForm( {onSuccess }: {
    onSuccess: () => void
}) {
    const form = useLoginFormInputs({onSuccess});

    return ( 
        <FormInputsForm
        formInputs={form}
        submitLabel="Login"
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
        button={
            <UserCircleOutlineIcon/>
        }
        render={onClose => 
        <>
            <Heading level={1}>Sign in</Heading>
            <LoginForm onSuccess={onClose}/>
            <Button onClick={() => {
                onClose()
                onOutlineClick?.()
            }}>
                Register
            </Button>
            <Button onClick={onClose}> Cancel </Button>
        </>
        }/>
    )
}