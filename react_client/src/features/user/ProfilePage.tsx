import { useNavigate } from "react-router-dom";
import { useRef, useState, useEffect} from 'react'

import { useAuthState } from './authState'
import { logger, ServerException } from '@/core'
import { InputLabelComponent } from "@/shared/InputLableComponent";
import { PopUpModalComponent } from "@/shared/PopUpModalComponent";
import { useFormFields } from "@/utils/useFormFields";
import { AppRoutes } from "@/AppRoutes";
import { logoutRoute, deleteUserRoute, postSetPasswordEmailRoute, patchUserRoute} from './authApi'

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
 // add are u sure delete popup

    const handleSetPassword = async () => {
        try {
            await postSetPasswordEmailRoute()
        } catch (error) {
            logger.error("Unexpected server error, unable to send email to set password")
        }
    }

    return (
        <div>
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
        </div>
    )
}

function UpdateProfileComponent () {
    const AuthState = useAuthState(state => state)
    const [isEditing, setIsEditing] = useState(false)

    const { values, setters, errorMsg, setErrorMsg, reset, validate} = useFormFields([
		{
			name:"name",
			validateFunc: (v) => !v ? "Name required" : null,
            initial: AuthState.userModel?.name
		},{
			name:"email",
			validateFunc: (v) => !v ? "Email required": !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? "Invalid email" : null,
            initial: AuthState.userModel?.email
		
        }
	])
	
	const handleSubmit = async (event: React.SubmitEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!validate()) return
        try {
            const {id, name, email} = await patchUserRoute({email: values.email, name: values.name});
            AuthState.setUserModel(id, email, name) 
        } catch (error) {
            if (error instanceof ServerException)
                setErrorMsg(error.message);
        }
        setIsEditing(false)

    };

    return (
			<form
            onSubmit={handleSubmit}>

            <InputLabelComponent
            name="name">
                <input
                    type="text"
                    value={values.name}
                    onChange={(e) => setters.name(e.target.value)}
                    className="w-full border p-2"
                    placeholder="Name"
                    readOnly={!isEditing}/>
            </InputLabelComponent>
            <InputLabelComponent
            name="email">
                <input
                    type="text"
                    value={values.email}
                    onChange={(e) => setters.email(e.target.value)}
                    className="w-full border p-2"
                    placeholder="Email"
                    readOnly={!isEditing}/>
            </InputLabelComponent>
            
            {errorMsg && <p className="text-sm text-red-600">{errorMsg}</p>}

            { !isEditing ?
            <button 
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
                onClick={() => {setIsEditing(false); reset()}}>
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
	const navigate = useNavigate();
    
    const handleDelete = async () => {
        try {
            await deleteUserRoute()
            logout()
        } catch (error) {
            logger.error("Unexpected server error, unable to delete profile")
        }
        props.onClose()
        navigate(AppRoutes.register)
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