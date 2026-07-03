import { useRef } from 'react'
import { useNavigate } from 'react-router-dom';
import { useAuthState } from './authState'

import { useFormFields } from '@/utils/useFormFields'
import { ServerException } from '@/core';
import { InputLabelComponent } from '@/shared/InputLableComponent'
import { AppRoutes } from "@/AppRoutes"
import { registerRoute } from './authApi';

function RegisterPage() {
	const navigate = useNavigate();
    const firstInputRef = useRef<HTMLInputElement>(null);

    const { values, setters, errorMsg, setErrorMsg, reset, validate} = useFormFields([
		{
			name:"name",
			validateFunc: (v) => !v.trim() ? "Name required" : null
		}, {
			name:"email",
			validateFunc: (v) => !v.trim() ? "Email required": !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? "Invalid email" : null
		}
	])

    const handleSubmit = async (event: React.SubmitEvent<HTMLFormElement>) => {
            event.preventDefault();
            if (!validate()) return
            try {
                await registerRoute({email: values.email, name: values.name});
				reset()
				navigate(AppRoutes.login)
            } catch (error) {
                if (error instanceof ServerException) {
					setErrorMsg(error.message);
				}
            }
        };

	return (
		<div className="max-w-md mx-auto mt-8 p-4">
			<h1 className="text-lg font-semibold mb-4">Register</h1>
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
						type="text"
						value={values.email}
						onChange={(e) => setters.email(e.target.value)}
						className="w-full border p-2"
						placeholder="Email"
					/>
				</InputLabelComponent>
                
				{errorMsg && <p className="text-sm text-red-600">{errorMsg}</p>}
				<button type="submit">Send set password email</button>
			</form>

			<button onClick={() => {
				navigate(AppRoutes.login)
			}}>Login</button>
        </div>
    )
}   

export { RegisterPage };

