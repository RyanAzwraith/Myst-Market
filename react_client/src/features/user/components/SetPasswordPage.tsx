import { 
    useNavigate, 
} from "react-router-dom";

import {
    FormFieldsContainer,
    PasswordFormField,
} from "@/shared/FormFieldsComponent";

import { ServerException } from "@/core"
import { PageRoutes } from '@/PageRoutes'

import { 
    usePatchUserPasswordMutation, 
    useSetPasswordFormFields 
} from "../service"


export { SetPasswordPage };

function SetPasswordPage() {
    const {
        password, rePassword, setErrorMsg, errorMsg, validate
    } = useSetPasswordFormFields();
    const patchUserPasswordMutation = usePatchUserPasswordMutation();
    const navigate = useNavigate();

	const handleSubmit = async (event: React.SubmitEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!validate()) return
        if (password.get() !== rePassword.get()) {
            setErrorMsg("Password must match");
            return
        }
        patchUserPasswordMutation.mutate(
            password.get(),
            {
                onSuccess: async () => {
                    navigate(PageRoutes.profile)
                },
                onError: (error) => {
                    if (error instanceof ServerException)
                        setErrorMsg(error.message);
                }
            }
        )
    };
	
    return (
		<div className="max-w-md mx-auto mt-8 p-4">
			<h1 className="text-lg font-semibold mb-4">Set Password</h1>
			<form onSubmit={handleSubmit} className="space-y-4">
                <FormFieldsContainer>
                    <PasswordFormField field={password} />
                    <PasswordFormField field={rePassword} />
                </FormFieldsContainer>

				{errorMsg &&
                    <p className="text-sm text-red-600">{errorMsg}</p>}
				<button type="submit">Submit</button>
			</form>
		</div>
    )
}
