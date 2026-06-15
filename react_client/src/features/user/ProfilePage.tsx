import { useNavigate } from "react-router-dom";
import { useRef, useState } from 'react'

import { useAuthState } from './authState'
import { logger, ServerException } from '@/core'
import { InputLabelComponent } from "@/shared/InputLableComponent";
import { useFormFields } from "@/utils/useFormFields";
import { AppRoutes } from "@/AppRoutes";

function ProfilePage() {
    const logout = useAuthState(state => state.logout)
    const deleteUser = useAuthState(state => state.deleteUser)
	const navigate = useNavigate();
    
    const handleLogout = async () => {
        try{
            await logout()
        } catch (error) {
            logger.error("Unexpected server error, unabel to logout")
        }
        navigate(AppRoutes.login)
    } 

    const handleDelete = async () => {
        try{
            await deleteUser()
        } catch (error) {
            logger.error("Unexpected server error, unabel to delete profile")
        }
        navigate(AppRoutes.register)
    } 

    return (
        <div>
            <button
            onClick={handleLogout}
            >
                Logout
            </button>

            <UpdateProfileComponent/>

            <button
            onClick={handleDelete}>
                Delete Profile
            </button>
            
        </div>
    )
}


function UpdateProfileComponent () {
    const AuthState = useAuthState()
    const [isEditing, setIsEditing] = useState(false)
    
    const firstInputRef = useRef<HTMLInputElement>(null);

    const { values, setters, errorMsg, setErrorMsg, reset, validate} = useFormFields([
		{
			name:"name",
			validateFunc: (v) => !v ? "Name required" : null,
            initial: AuthState.userModel?.name
		}, {
			name:"email",
			validateFunc: (v) => !v ? "Email required": !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? "Invalid email" : null,
            initial: AuthState.userModel?.email
		}, {
			name:"password",
			validateFunc: (v) => null
		}, {
            name:"passwordSecond",
			validateFunc: (v) => values.password !== v ? "Passwords must match" : null
		}
	])

    const handleSubmit = async (event: React.SubmitEvent<HTMLFormElement>) => {
            event.preventDefault();
            if (!validate()) return
            try {
                await AuthState.patch(values.email, values.password, values.name);
                setIsEditing(false)
            } catch (error) {
                if (error instanceof ServerException)
                    setErrorMsg(error.message);
            }
        };
    
    return (
        <div>
            
            <span>Edit: </span>
            <input 
            type="checkbox" 
            name="edit"
            onClick={() => setIsEditing(prev => !prev)}
            />

            <form onSubmit={handleSubmit} className="space-y-4">
				<InputLabelComponent
				name="name"
				>
					<input
						ref={firstInputRef}
						type="text"
						value={values.name}
						onChange={(e) => setters.name(e.target.value)}
						className="w-full border p-2"
						placeholder="Name"
                        readOnly={!isEditing}
					/>
				</InputLabelComponent>
                <InputLabelComponent
				name="email"
				>
					<input
						ref={firstInputRef}
						type="text"
						value={values.email}
						onChange={(e) => setters.email(e.target.value)}
						className="w-full border p-2"
						placeholder="Email"
                        readOnly={!isEditing}
					/>
				</InputLabelComponent>
				<InputLabelComponent
				name="password"
				>
					<input
						type="password"
						value={values.password}
						onChange={(e) => setters.password(e.target.value)}
						className="w-full border p-2"
						placeholder="Password"
                        readOnly={!isEditing}
					/>
				</InputLabelComponent>

                <InputLabelComponent
				name="Re Enter Password"
				>
					<input
						type="password"
						value={values.passwordSecond}
						onChange={(e) => setters.passwordSecond(e.target.value)}
						className="w-full border p-2"
						placeholder="Password"
                        readOnly={!isEditing}
					/>
				</InputLabelComponent>
                
				{errorMsg && <p className="text-sm text-red-600">{errorMsg}</p>}

				<button 
                disabled={!isEditing}
                type="submit">
                    Update
                </button>
			</form>
            
        </div>
    );
}

export { ProfilePage };