import { create,} from 'zustand'
import { persist } from "zustand/middleware";

type UserModel = {
	id: number;
	email: string;
	name: string;
    isAdmin: boolean
}

type AuthState = {
    accessToken: string | null
    userModel: UserModel| null
    setUserModel: (id:number, email:string, name:string, isAdmin:boolean) => void
    login: (accessToken:string, userModel:UserModel) => void
    logout: () => void
    refresh: (accessToken:string) => void
}

const useAuthState = create<AuthState>()(
    persist( 
        (set) => ({
            accessToken: null,
            userModel: null,
            setUserModel: (id, email, name, isAdmin) => {
                set({ userModel: { id, email, name, isAdmin } })
            } ,
            login: (accessToken, userModel) => {
                set({ accessToken, userModel})
            },
            logout: () => {
                set({ accessToken: null, userModel: null})
            },
            refresh: (accessToken) => {
                set({ accessToken })
            },
        }),
        {
            name: "auth-storage",
             partialize: (state) => ({
                userModel: state.userModel
            }),
        }
    )
);


export { useAuthState, type AuthState, type UserModel }
