
import { create } from 'zustand'
import { persist } from 'zustand/middleware';

import type {
    User,
} from './index'


export {
    useAuthState,
}


type AuthState = {
    accessToken: string | null
    user: User| null
    setUser: (user: User) => void
    login: (accessToken:string, user:User) => void
    logout: () => void
    refresh: (accessToken:string) => void
    isLoggedIn: () => boolean
}

const useAuthState = create<AuthState>()( persist( 
    (set, get) => ({
        accessToken: null,
        user: null,
        setUser: (user: User) => {
            set({ user: user })
        },
        login: (accessToken, user) => {
            set({ accessToken, user})
        },
        logout: () => {
            set({ accessToken: null, user: null})
        },
        refresh: (accessToken) => {
            set({ accessToken })
        },
        isLoggedIn: () => {
            return get().accessToken !== null;
        }
    }),
    {
        name: "auth-storage",
            partialize: (state) => ({
            user: state.user
        }),
    }
))

