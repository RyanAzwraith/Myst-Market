import { createContext, useContext, useEffect, useState } from "react"
import type { User } from "@/models/user"
import { useQuery } from "node_modules/@tanstack/react-query/build/modern/_tsup-dts-rollup"
import { api } from "@/api/api"

interface UserContextType {
    user: User | undefined,
    setUser: (user: User | undefined) => void
}

export const UserContext = createContext<UserContextType | undefined>(undefined)

export function UserProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | undefined>(undefined) 

    const query = useQuery({
        queryKey: ["me"],
        queryFn: api.getUser,
        retry: false,
    })

    // sync query → context
    useEffect(() => {
        if (query.data) {
            setUser(query.data)
        }
    }, [query.data])
    
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