
import { kind, type FieldDefs } from '@/hooks/FormInputs/schema'
import type { User } from './index'


export type {
    AuthState,
    Login,
}
export { 
    loginFormFields 
}


// Domain
type Login = {
    email: string
    password: string
}

// State
type AuthState = {
    accessToken: string | null
    user: User| null
    setUser: (user: User) => void
    login: (accessToken:string, user:User) => void
    logout: () => void
    refresh: (accessToken:string) => void
    isLoggedIn: () => boolean
}

// Hooks
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
