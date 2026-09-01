import { useNavigate } from "react-router-dom";
import { useState} from 'react'

import {
    EmailFormField,
    FormFieldsContainer,
    TextFormField,
} from "@/shared/FormFieldsComponent";
import { PopUpModalComponent } from "@/shared/PopUpModalComponent";

import { logger, ServerException } from '@/core'
import { PageRoutes } from "@/PageRoutes";

import { useLogoutMutation, type UserInput } from "../index";

import { 
    usePatchUserMutation, 
    useSendPasswordEmailMutation, 
    useUpdateFormFields,
    useUserDeleteMutation, 
} from "../service";
import { UserOrdersComponent } from "./UserOrdersComponent";
import { ProfileReviewsComponent } from "./ProfileReviewsComponent";

function ProfilePage() {
	const navigate = useNavigate();

    const logoutMutation = useLogoutMutation();
    const sendPasswordEmailMutation = useSendPasswordEmailMutation();

    const handleLogout = async () => {
        logoutMutation.mutate(undefined, {
            onSuccess: async () => {
                navigate(PageRoutes.login)
            },
            onError: () => {
                logger.error("Unexpected server error, unable to logout")
            }
        })
    } 

    const handleSetPassword = async () => {
        sendPasswordEmailMutation.mutate(undefined, {
            onError: (error) => {
                if (error instanceof ServerException) {
                    logger.error("Unexpected server error, unable to send email to set password")
                }
            }
        })
    }

    return (
        <div>
            <h1 className="text-lg font-semibold mb-4">Profile</h1>

            <button
            onClick={handleLogout}>
                Logout
            </button>

            <UpdateProfileComponent/>

            <button
            onClick={handleSetPassword}>
                Set password with email
            </button>
            <PopUpModalComponent
            content={onClose => <ConfirmDeletePopupContent onClose={onClose} />}>
                <span> Delete Profile</span>
            </PopUpModalComponent>

            <UserOrdersComponent />
            <ProfileReviewsComponent />
        </div>
    )

}

function UpdateProfileComponent() {
    const {
        name, email, errorMsg, setErrorMsg, validate, values, reset
    } = useUpdateFormFields();
    
    const updateProfileMutation = usePatchUserMutation();
    const [isEditing, setIsEditing] = useState(false);

    const handleSave = async (event: React.SubmitEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!validate()) return 

        updateProfileMutation.mutate(
            values as Partial<UserInput>, {
                onSuccess:  () => {
                    reset()
                    setIsEditing(false)
                },
                onError: (error) => {
                    if (error instanceof ServerException)
                        setErrorMsg(error.message);
                }
        })
    }

    return (
        	<form
            onSubmit={handleSave}>

            <FormFieldsContainer>
                <TextFormField field={name} readOnly={!isEditing} />
                <EmailFormField
                    field={email}
                    readOnly={!isEditing}
                />
            </FormFieldsContainer>
            
            {errorMsg &&
                <p className="text-sm text-red-600">{errorMsg}</p>}

            { !isEditing ?
            <button 
            type="button"
            onClick={() => setIsEditing(true)}>
                Update
            </button>
            :
            <>
                <button 
                disabled={!isEditing}
                type="submit">
                    Save
                </button>
                <button 
                type="button"
                onClick={() => {setIsEditing(false); reset()}}>
                    Cancel
                </button>
            </>
            }
            
        </form>
    )
}


function ConfirmDeletePopupContent(props:{
    onClose: () => void
}) {
    const deleteUserMutation = useUserDeleteMutation();
    
    const handleDelete = async () => {
        deleteUserMutation.mutate(undefined, {
            onSuccess: async () => {
                props.onClose()
            },
            onError: (error) => {
                if (error instanceof ServerException)
                    logger.error("Unexpected server error, unable to delete profile")
            }
        });
    }

    return(
        <>
            <h2>Are you sure you'd like to delete your Profile?</h2>
            <button onClick={handleDelete}>Yes</button>
            <button onClick={props.onClose}>No</button>
        </>
    )
}

export { ProfilePage };