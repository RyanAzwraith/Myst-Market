import { useRef, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import { ServerException } from "@/core"
import { useFormFields } from "@/utils/useFormFields"
import { InputLabelComponent } from "@/shared/InputLableComponent";
import { AppRoutes } from '@/AppRoutes'
import { useAuthState } from "./authState";
import { patchUserPasswordRoute } from "./authApi";

function SetPasswordPage() {
    const login = useAuthState(state => state.login);
	const navigate = useNavigate();
	const firstInputRef = useRef<HTMLInputElement>(null);
	
    const [searchParams] = useSearchParams();
    const token = searchParams.get("token");
    useEffect(() => {if (!token) navigate(AppRoutes.login)}, [token]);

	const { values, setters, errorMsg, setErrorMsg, reset, validate} = useFormFields([
		{
			name:"password",
			validateFunc: (v) => !v ? "Password required" : null
		}, {
			name:"secondaryPassword",
			validateFunc: (v) => v !== values.password ? "Password must match" : null
		}
	])
	
	const handleSubmit = async (event: React.SubmitEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!validate()) return
        try {
            const {accessToken, userResponse} = await patchUserPasswordRoute({password: values.password});
			login(accessToken, userResponse)
            navigate(AppRoutes.profile)
        } catch (error) {
            if (error instanceof ServerException)
                setErrorMsg(error.message);
        }
    };
	
    return (
		<div className="max-w-md mx-auto mt-8 p-4">
			<h1 className="text-lg font-semibold mb-4">Set Password</h1>
			<form onSubmit={handleSubmit} className="space-y-4">
				<InputLabelComponent
				name="password"
				>
					<input
                    ref={firstInputRef}
                    type="password"
                    value={values.password}
                    onChange={(e) => setters.password(e.target.value)}
                    className="w-full border p-2"
                    placeholder="Password"
					/>
				</InputLabelComponent>
				<InputLabelComponent
				name="Re-enter"
				>
					<input
						type="password"
						value={values.secondaryPassword}
						onChange={(e) => setters.secondaryPassword(e.target.value)}
						className="w-full border p-2"
						placeholder="Re-enter"
					/>
				</InputLabelComponent>

				{errorMsg && <p className="text-sm text-red-600">{errorMsg}</p>}
				<button type="submit">Submit</button>
			</form>
		</div>
    )
}

export { SetPasswordPage };