
import { 
    kind,
    useFormInputs, 
    type FieldDefs 
} from '@/hooks/FormInputs';
import { useLoginMutation } from './service';
import type { Login } from './schema';


export { 
    useLoginFormInputs 
}


function useLoginFormInputs({onSuccess}: {
    onSuccess?: () => void
}) {
    const { mutate } = useLoginMutation({});
    const loginFormFields = {
        email:{
            kind: kind.email,
            label: "Email",
            placeholder: "Email",
        },
        password: {
            kind: kind.password,
            label: "Password",
            placeholder: "Password",
            validate: value => value ? null : "Password required",
        },
    } satisfies FieldDefs

    return useFormInputs({
        fields: loginFormFields,
        onSubmit: (values, setErrorMsg, reset) => 
            mutate(values as Login, {
                onSuccess: () => {
                    reset()
                    onSuccess?.()
                },
                onError: (error) => {
                    setErrorMsg(error.message)
                }
            })
    })
}