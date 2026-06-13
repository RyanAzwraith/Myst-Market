/** biome-ignore-all lint/a11y/noStaticElementInteractions: <explanation> */
/** biome-ignore-all lint/a11y/useButtonType: <explanation> */
/** biome-ignore-all assist/source/organizeImports: <explanation> */
/** biome-ignore-all lint/a11y/useSemanticElements: <explanation> */
import { UserCircleIcon as OutlineIcon } from "@heroicons/react/24/outline";
import { UserCircleIcon as SolidIcon } from "@heroicons/react/24/solid";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import { ServerException } from "@/core"
import { PopUpModalComponent } from "@/shared/PopUpModalComponent";
import { ToggleComponent } from "@/shared/ToggleComponent";
import { useAuthState } from "./userState";

function ProfileButtonComponent() {
	const navigate = useNavigate();

	return (
		<ToggleComponent
		state={useAuthState().userModel != null}
		onChild={
			<SolidIcon 
			className="h-6 w-6" 
			onClick={() => navigate("/profile")} 
			/>
		}
		offChild={
			<PopUpModalComponent
			content={onClose => <LoginModalContent onClose={onClose}/>}
			>
				<OutlineIcon className="h-6 w-6" />
			</PopUpModalComponent>
		}
		/>
	)
}

function LoginModalContent(props: {
	onClose: () => void 
}) {
	const login = useAuthState().login;
	const navigate = useNavigate();
	const firstInputRef = useRef<HTMLInputElement>(null);

	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [errorMsg, setErrorMsg] = useState<string | null>(null);

	useEffect(() => firstInputRef.current?.focus(),[])
	

	const handleSubmit = async (event: React.SubmitEvent<HTMLFormElement>) => {
		event.preventDefault();
		if (!email) return setErrorMsg("Email required");
		if (!password) return setErrorMsg("Password required");
		if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return setErrorMsg("Invalid email");

		setErrorMsg(null);

		try {
			await login(email, password);
			props.onClose();
		} catch (error) {
			if (error instanceof ServerException)
				setErrorMsg(error.message);
		}
	};

	return (
		<>
			<h2>Sign in</h2>
			<form onSubmit={handleSubmit} className="space-y-4">
				<label className="block text-sm text-slate-700">
					<span className="sr-only">Email</span>
					<input
						ref={firstInputRef}
						type="text"
						value={email}
						onChange={(event) => setEmail(event.target.value)}
						className="w-full border p-2"
						placeholder="Email"
					/>
				</label>
				<label className="block text-sm text-slate-700">
					<span className="sr-only">Password</span>
					<input
						type="password"
						value={password}
						onChange={(event) => setPassword(event.target.value)}
						className="w-full border p-2"
						placeholder="Password"
					/>
				</label>
				{errorMsg && <p className="text-sm text-red-600">{errorMsg}</p>}
				<button type="submit">Login</button>
			</form>

			<button onClick={() => {
				navigate("/register")
				props.onClose()
			}}>Register</button>

			<button onClick={props.onClose}> Cancel </button>
		</>
	);
}

export { ProfileButtonComponent };
