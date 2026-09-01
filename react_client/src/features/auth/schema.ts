
import type { User } from './index'

export type {
    AuthState,
    Login,
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

