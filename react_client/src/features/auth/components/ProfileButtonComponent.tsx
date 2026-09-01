import { UserCircleIcon as OutlineIcon } from "@heroicons/react/24/outline";
import { UserCircleIcon as SolidIcon } from "@heroicons/react/24/solid";
import { useNavigate } from "react-router-dom";

import { PopUpModalComponent } from "@/shared/PopUpModalComponent"
import { ToggleComponent } from "@/shared/ToggleComponent"
import {
    EmailFormField,
    FormFieldsContainer,
    PasswordFormField,
} from "@/shared/FormFieldsComponent";

import { PageRoutes } from "@/PageRoutes";
import { ServerException } from "@/core"

import { 
	useAuthState,
	useLoginFormFields, 
	useLoginMutation 
} from "../service";
import type { Login } from "../schema";


export {
	ProfileButtonComponent,
}

function ProfileButtonComponent() {
	const navigate = useNavigate();
	const isLoggedIn = useAuthState(state => state.isLoggedIn);

	return (
		<ToggleComponent
		state={isLoggedIn()}
		onChild={
			<SolidIcon 
			aria-label="solidIcon"
			aria-hidden="false"
			className="h-6 w-6" 
			onClick={() => navigate(PageRoutes.profile)} 
			/>
		}
		offChild={
			<PopUpModalComponent
			content={onClose => <LoginModalContent onClose={onClose}/>}
			>
				<OutlineIcon
				aria-label="outLineIcon"
				aria-hidden="false"
				className="h-6 w-6" 
				/>
			</PopUpModalComponent>
		}
		/>
	)
}

function LoginModalContent(props:{
	onClose: () => void
}) {
	const navigate = useNavigate();
	const loginFormFields = useLoginFormFields();
	const loginMutation = useLoginMutation();
	
	const handleSubmit = async (event: React.SubmitEvent<HTMLFormElement>) => {
			event.preventDefault();
			if (!loginFormFields.validate()) return
			loginMutation.mutate(
				loginFormFields.values as Login, 
				{
					onSuccess: () => {
						loginFormFields.reset()
						props.onClose();
					},
					onError: (error) => {
						if (error instanceof ServerException)
							loginFormFields.setErrorMsg(error.message);
					}
			});
		};
	
	return (
		<>
			<h1>Sign in</h1>
			<form onSubmit={handleSubmit} className="space-y-4">
                <FormFieldsContainer>
                    <EmailFormField field={loginFormFields.email} />
                    <PasswordFormField field={loginFormFields.password} />
                </FormFieldsContainer>

				{loginFormFields.errorMsg &&
                    <p className="text-sm text-red-600">{loginFormFields.errorMsg}</p>}
				<button type="submit">Login</button>
			</form>

			<button onClick={() => {
				props.onClose()
				navigate(PageRoutes.register)
			}}>
				Register
			</button>

			<button onClick={props.onClose}> Cancel </button>
		</>
	);

}
