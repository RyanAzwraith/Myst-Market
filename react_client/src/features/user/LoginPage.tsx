import { useRef } from "react";
import { useNavigate } from "react-router-dom";

import { ServerException } from "@/core"
import { useFormFields } from "@/utils/useFormFields"
import { InputLabelComponent } from "@/shared/InputLableComponent";
import { AppRoutes } from '@/AppRoutes'
import { useAuthState } from "./authState";
import { loginRoute } from "./authApi";

function LoginPage() {
    const login = useAuthState(state => state.login);
	const navigate = useNavigate();
	const firstInputRef = useRef<HTMLInputElement>(null);

	const { values, setters, errorMsg, setErrorMsg, reset, validate} = useFormFields([
		{
			name:"email",
			validateFunc: (v) => !v.trim() ? "Email required": !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? "Invalid email" : null
		}, {
			name:"password",
			validateFunc: (v) => !v ? "Password required" : null
		}
	])
	
	const handleSubmit = async (event: React.SubmitEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!validate()) return
        try {
            const {accessToken, userResponse} = await loginRoute({email: values.email, password: values.password});
			login(accessToken, userResponse)
            reset()
			navigate(AppRoutes.profile)
        } catch (error) {
            if (error instanceof ServerException)
                setErrorMsg(error.message);
        }
    };

    return (
		<div className="max-w-md mx-auto mt-8 p-4">
			<h1 className="text-lg font-semibold mb-4">Sign in</h1>
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
				navigate(AppRoutes.register)
			}}>Register</button>
		</div>
    )
}

export { LoginPage };