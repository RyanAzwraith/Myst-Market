import { logger } from "@/core/logger";

import { PopUpModalComponent } from "@/shared/PopUpModalComponent";

import { ServerException } from "@/core/errors";

import { useLogoutMutation } from "../index";

import { useSendPasswordEmailMutation } from "../service";

import { DeleteUserModal } from "./modal";

export {
    LogoutButton,
    PasswordResetButton,
    DeleteUserButton
}


function LogoutButton({ onLogout } : {
    onLogout?: () => void
}) {
    const logoutMutation = useLogoutMutation();

    const handleLogout = () => {
        logoutMutation.mutate(undefined, {
            onSuccess: async () => onLogout?.(),
            onError: () => {
                logger.error("Unexpected server error, unable to logout")
            }
        })
    } 

    return (
        <button 
        onClick={handleLogout}
        >
            Logout
        </button>
    )
}

function PasswordResetButton({ onPasswordReset } : {
    onPasswordReset?: () => void
}) {
    const sendPasswordEmailMutation = useSendPasswordEmailMutation()
    const handleSetPassword = async () => {
        sendPasswordEmailMutation.mutate(undefined, {
        onSuccess: () => onPasswordReset?.(),
        onError: (error) => {
            if (error instanceof ServerException) {
                logger.error("Unexpected server error, unable to send email to set password")
            }
        }})
    }

    return (
        <button
        onClick={handleSetPassword}>
            Set password with email
        </button>
    )
}   

function DeleteUserButton({ onDelete }: { 
    onDelete?: () => void 
}) {
    return (
        <PopUpModalComponent
        content={onClose => 
            <DeleteUserModal 
            onClose={onClose} 
            onDelete={onDelete}
            />
        }>
            <span> Delete Profile</span>
        </PopUpModalComponent>
    )
}