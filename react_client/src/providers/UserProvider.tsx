import { createContext, useContext, useState } from "react"
import type { User } from "@/models/user"

interface UserContextType {
    user: User | null,
    setUser: (user: User | null) => void
}

export const UserContext = createContext<UserContextType | undefined>(undefined)

export function UserProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null) 

    return (
        <UserContext.Provider value={{ user, setUser}}>
            {children}
        </UserContext.Provider>
    )
}

export function useUser() {
    const userContext = useContext(UserContext)

    if (!userContext) {
        throw new Error("useUser must be used within UserProvider")
    }
    
    return userContext
}