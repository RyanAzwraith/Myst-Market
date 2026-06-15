import { useRef } from 'react'
import { useNavigate } from 'react-router-dom';
import { useAuthState } from './authState'

import { useFormFields } from '@/utils/useFormFields'
import { ServerException } from '@/core';
import { InputLabelComponent } from '@/shared/InputLableComponent'
import { AppRoutes } from "@/AppRoutes"

function RegisterPage() {
    const register = useAuthState(state => state.register);
	const navigate = useNavigate();
    const firstInputRef = useRef<HTMLInputElement>(null);

    const { values, setters, errorMsg, setErrorMsg, reset, validate} = useFormFields([
		{
			name:"name",
			validateFunc: (v) => !v ? "Name required" : null
		}, {
			name:"email",
			validateFunc: (v) => !v ? "Email required": !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? "Invalid email" : null
		}, {
			name:"password",
			validateFunc: (v) => !v ? "Password required" : null
			
		}, {
            name:"passwordSecond",
			validateFunc: (v) => !v ? "Re enter password" : values.password !== v ? "Passwords must match" : null
		}
	])

    const handleSubmit = async (event: React.SubmitEvent<HTMLFormElement>) => {
            event.preventDefault();
            if (!validate()) return
            try {
                await register(values.email, values.password, values.name);
                reset()
				navigate(AppRoutes.profile)
            } catch (error) {
                if (error instanceof ServerException)
                    setErrorMsg(error.message);
            }
        };

    return (
        <div>
            <h1>Register</h1>
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

                <InputLabelComponent
				name="Re Enter Password"
				>
					<input
						type="password"
						value={values.passwordSecond}
						onChange={(e) => setters.passwordSecond(e.target.value)}
						className="w-full border p-2"
						placeholder="Password"
					/>
				</InputLabelComponent>
                
				{errorMsg && <p className="text-sm text-red-600">{errorMsg}</p>}
				<button type="submit">Register</button>
			</form>

			<button onClick={() => {
				navigate(AppRoutes.login)
			}}>Login</button>
        </div>
    )
}   

export { RegisterPage };

