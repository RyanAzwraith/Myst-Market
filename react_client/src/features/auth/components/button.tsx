

import { LoginForm } from "./form";
import { useAuthState } from "../service";
import { PopUpModalComponent } from "@/shared/PopUpModalComponent";
import { UserCircleOutlineIcon as OutlineIcon } from "@/shared"
import { UserCircleSolidIcon as SolidIcon } from "@/shared"


export {
    ProfileButton,
}


function ProfileButton({onSolidClick, onRegisterClick}: {
    onSolidClick?: () => void
    onRegisterClick?: () => void
}) {
	const isLoggedIn = useAuthState(state => state.isLoggedIn);

    if (isLoggedIn()) return (
        <SolidIcon 
        onClick={onSolidClick} 
        />
    )
    return (
        <PopUpModalComponent
        content={onClose => 
        <div>
			<h1>Sign in</h1>
            <LoginForm onSubmit={onClose}/>
			<button onClick={() => {
				onClose()
				onRegisterClick?.()
			}}>
				Register
			</button>

			<button onClick={onClose}> Cancel </button>
        </div>
        }>
            <OutlineIcon/>
        </PopUpModalComponent>
	)
}