
import { create } from 'zustand'
import { persist } from 'zustand/middleware';
import { useMutation } from '@tanstack/react-query';

import { 
    emailField, 
    passwordField, 
    useFormFields, 
    validateEmail 

} from '@/utils/useFormFields';

import { server } from '@/core/server';

import type {
    User,
} from './index'

import type { 
    AuthState,
    Login,
} from './schema'


export {
    useAuthState,

    useLoginMutation,
    useLogoutMutation,
    useRefreshMutation,

    useLoginFormFields,
}

const useAuthState = create<AuthState>()(
    persist( 
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
    )
);

// Requests
function useLoginMutation() {
    const login = useAuthState((state) => state.login)
    return useMutation({
        mutationFn: (login: Login) => server.auth.login({ login }),
        onSuccess: ({accessToken, user}) => login(accessToken, user),
    })
}

function useLogoutMutation() {
    const logout = useAuthState((state) => state.logout)
    return useMutation({
        mutationFn: () => server.auth.logout(),
        onSuccess: () => logout()
    })
}

function useRefreshMutation() {
    const refresh = useAuthState((state) => state.refresh)
    return useMutation({
        mutationFn: () => server.auth.refresh(),
        onSuccess: (data) =>  refresh(data.accessToken),
    })
}

// Hooks
const useLoginFormFields = () => 
    useFormFields({
        email: emailField({
            label: "Email",
            placeholder: "Email",
            validate: validateEmail,
        }),
        password: passwordField({
            label: "Password",
            placeholder: "Password",
            validate: value => value ? null : "Password required",
        }),
    })