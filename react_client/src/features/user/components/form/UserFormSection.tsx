import {
    BooleanField,
    EmailField,
    TextField,
} from "@/hooks/FormInputs"
import { useAuthState } from "@/features/auth"
import type { useCheckoutFormFields } from "../../index"
export { UserFormSection }

function UserFormSection ({form} : {
    form: ReturnType<typeof useCheckoutFormFields>
}) {
    const user = useAuthState(state => state.user)
    const isLoggedIn = useAuthState(state => state.isLoggedIn)
    const { name, email, isCreatingAccount } = form

    if (isLoggedIn() && user) return (
        <div>
            <p>Account Information</p>
            <p>{user.name}</p>
            <p>{user.email}</p>
        </div>
    )
    return (
        <section>
            <h2>Account Information</h2>

            <TextField binding={name} />
            <EmailField binding={email} />
            <BooleanField binding={isCreatingAccount} />
        </section>
    )
}

