import { create,} from 'zustand'
import { persist } from "zustand/middleware";
import { login_route, logout_route, patch_user_route, register_route, delete_user_route, refresh_route } from './authApi'

type UserModel = {
	id: number;
	email: string;
	name: string;
};

export type AuthState = {
    accessToken: string | null
    userModel: UserModel| null
    login: (email:string, password:string) => Promise<void>
    logout: () => Promise<void>
    register: (email:string, password:string, name:string) => Promise<void>
    refresh: () => Promise<void>
    patch: (email?:string, password?:string, name?:string) => Promise<void>
    deleteUser: () => Promise<void>
}

const useAuthState = create<AuthState>()(
    persist( 
        (set) => ({
            accessToken: null,
            userModel: null,
            login: async (email, password) => {
                const {accessToken, userResponse} = await login_route({email, password})
                set({ accessToken, userModel: userResponse})
            },
            logout: async () => {
                await logout_route()
                set({ accessToken: null, userModel: null})
            },
            register: async (email, password, name) => {
                const {accessToken, userResponse } = await register_route({email, password, name })
                set({accessToken, userModel: userResponse})
            },
            refresh: async () => {
                const { accessToken } = await refresh_route()
                set({ accessToken })
            },
            patch: async (email?, password?, name?) => {
                const userResponse = await patch_user_route({email, password, name})
                set({userModel: userResponse})
            },
            deleteUser: async () => {
                await delete_user_route()
                set({ accessToken: null, userModel: null})
            }
        }),
        {
            name: "auth-storage",
        }
    )
);

export { useAuthState }
