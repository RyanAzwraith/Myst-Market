import { create,} from 'zustand'
import { persist } from "zustand/middleware";
import { login_route, logout_route, refresh_route } from './authApi'

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
    refresh: () => Promise<void>
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
            refresh: async () => {
                const { accessToken } = await refresh_route()
                set({ accessToken })
            },
        }),
        {
            name: "auth-storage",
        }
    )
);

export { useAuthState }
