import { UserCircleIcon as OutlineIcon } from "@heroicons/react/24/outline";
import { UserCircleIcon as SolidIcon } from "@heroicons/react/24/solid";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import { ServerException } from "@/core"
import { PopUpModalComponent } from "@/shared/PopUpModalComponent"
import { ToggleComponent } from "@/shared/ToggleComponent"
import { useFormFields } from "@/utils/useFormFields"
import { InputLabelComponent } from "@/shared/InputLableComponent";
import { AppRoutes } from "@/AppRoutes";
import { useAuthState } from "./authState";
import { loginRoute } from "./authApi";

function ProfileButtonComponent() {
	const navigate = useNavigate();
	const accessToken = useAuthState(state => state.accessToken)

	return (
		<ToggleComponent
		state={accessToken != null}
		onChild={
			<SolidIcon 
			aria-label="solidIcon"
			aria-hidden="false"
			className="h-6 w-6" 
			onClick={() => navigate(AppRoutes.profile)} 
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
	const login = useAuthState(state => state.login);
	const navigate = useNavigate();
	const firstInputRef = useRef<HTMLInputElement>(null);

	const { values, setters, errorMsg, setErrorMsg, reset, validate} = useFormFields([
		{
			name:"email",
			validateFunc: (v) => !v.trim() ? "Email required": !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? "Invalid email" : null
		},{
			name:"password",
			validateFunc: (v) => !v ? "Password required" : null
		}
	])
	
	const handleSubmit = async (event: React.SubmitEvent<HTMLFormElement>) => {
			event.preventDefault();
			if (!validate()) return
			try {
				const {accessToken, userResponse } = await loginRoute({email: values.email, password: values.password})
				login(accessToken, userResponse);
				props.onClose();
				reset()
			} catch (error) {
				if (error instanceof ServerException)
					setErrorMsg(error.message);
			}
		};
	
	return (
		<>
			<h1>Sign in</h1>
			<form onSubmit={handleSubmit} className="space-y-4">
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
					/>
				</InputLabelComponent>

				{errorMsg && <p className="text-sm text-red-600">{errorMsg}</p>}
				<button type="submit">Login</button>
			</form>

			<button onClick={() => {
				props.onClose()
				navigate(AppRoutes.register)
			}}>
				Register
			</button>

			<button onClick={props.onClose}> Cancel </button>
		</>
	);

}

export { ProfileButtonComponent };
