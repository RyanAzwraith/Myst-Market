import { create } from 'zustand'
import { login_route, logout_route } from './userApi'

type UserModel = {
	id: number;
	email: string;
	isAdmin: boolean;
	isRegistered: boolean;
	name: string;
};

export type AuthState = {
    accessToken: string | null
    userModel: UserModel| null
    login: (email:string, password:string) => Promise<void>
    logout: () => Promise<void>
}
 
export const useAuthState = create<AuthState>()(set => ({
    accessToken: null,
    userModel: null,
    login: async (email, password) => {
        const {accessToken, userResponse} = await login_route({email, password})
        set({ accessToken, userModel: userResponse})
    },
    logout: async () => {
        await logout_route()
        set({ accessToken: null, userModel: null})
    }
}))
