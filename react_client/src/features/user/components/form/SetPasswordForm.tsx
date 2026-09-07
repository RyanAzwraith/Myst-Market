
import { 
    PasswordFormField,
    FormFieldsContainer
} from "@/shared/FormFieldsComponent";
import { ErrorMsg } from "@/shared";

import { ServerException } from "@/core";

import { 
    useSetPasswordFormFields,
    usePatchUserPasswordMutation,

} from "../../service";


export {
    SetPasswordForm,
}


function SetPasswordForm({ onSubmit }: {
    onSubmit?: () => void
}) {
    const patchUserPasswordMutation = usePatchUserPasswordMutation();
    const {
        password, rePassword, setErrorMsg, errorMsg, validate
    } = useSetPasswordFormFields();

	const handleSubmit = async (event: React.SubmitEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!validate()) return
        if (password.get() !== rePassword.get()) {
            setErrorMsg("Password must match");
            return
        }
        patchUserPasswordMutation.mutate(password.get(), {
            onSuccess: () => onSubmit?.(),
            onError: (error: any ) => {
                if (error instanceof ServerException)
                    setErrorMsg(error.message);
            }
        })
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <FormFieldsContainer>
                <PasswordFormField field={password} />
                <PasswordFormField field={rePassword} />
            </FormFieldsContainer>

            <ErrorMsg errorMsg={errorMsg} />
            <button type="submit">Submit</button>
        </form>
    )
}

