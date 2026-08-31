import { useNavigate } from "react-router-dom";
import { Profiler, useState} from 'react'

import { useAuthState } from './authState'
import { logger, ServerException } from '@/core'
import {
    EmailFormField,
    FormFieldsContainer,
    TextFormField,
} from "@/shared/FormFieldsComponent";
import { PopUpModalComponent } from "@/shared/PopUpModalComponent";
import {
    emailField,
    textField,
    useFormFields,
    validateEmail,
} from "@/utils/useFormFields";
import { AppRoutes } from "@/AppRoutes";
import { UserOrdersComponent } from "@/features/checkout/UserOrdersComponent";

import { logoutRoute, deleteUserRoute, postSetPasswordEmailRoute, patchUserRoute} from './authApi'
import { ProfileReviewsComponent } from "../review";

function ProfilePage() {
    const logout = useAuthState(state => state.logout)
	const navigate = useNavigate();
    
    const handleLogout = async () => {
        try{
            await logoutRoute()
            logout()
        } catch (error) {
            logger.error("Unexpected server error, unabel to logout")
        }
        navigate(AppRoutes.login)
    } 


    const handleSetPassword = async () => {
        try {
            await postSetPasswordEmailRoute()
        } catch (error) {
            logger.error("Unexpected server error, unable to send email to set password")
        }
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

function UpdateProfileComponent () {
    const userModel = useAuthState(state => state.userModel)
    const setUserModel = useAuthState(state => state.setUserModel)

    const [isEditing, setIsEditing] = useState(false)

    const form = useFormFields({
        name: textField({
            label: "Name",
            placeholder: "Name",
            initial: userModel?.name,
            validate: value => value.trim() ? null : "Name required",
        }),
        email: emailField({
            label: "Email",
            placeholder: "Email",
            initial: userModel?.email,
            validate: validateEmail,
        }),
    })
	
	const handleSubmit = async (event: React.SubmitEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!form.validate()) return 
        try {
            const {id, name, email, isAdmin} = await patchUserRoute({
                email: form.email.get(),
                name: form.name.get(),
            });
            setUserModel(id, email, name, isAdmin) 
            setIsEditing(false)
        } catch (error) {
            if (error instanceof ServerException)
                form.setErrorMsg(error.message);
        }

    };

    return (
			<form
            onSubmit={handleSubmit}>

            <FormFieldsContainer>
                <TextFormField field={form.name} readOnly={!isEditing} />
                <EmailFormField
                    field={form.email}
                    readOnly={!isEditing}
                />
            </FormFieldsContainer>
            
            {form.errorMsg &&
                <p className="text-sm text-red-600">{form.errorMsg}</p>}

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
                onClick={() => {setIsEditing(false); form.reset()}}>
                    Cancel
                </button>
            </>
            }
            
        </form>
            
    );
}

function ConfirmDeletePopupContent(props:{
    onClose: () => void
}) {
    const logout = useAuthState(state => state.logout)
    
    const handleDelete = async () => {
        try {
            await deleteUserRoute()
            logout()
        } catch (error) {
            logger.error("Unexpected server error, unable to delete profile")
        }
        props.onClose()
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