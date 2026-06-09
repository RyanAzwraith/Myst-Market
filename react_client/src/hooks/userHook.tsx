import { useQuery } from "@tanstack/react-query";
import { api } from "@/api/api";
import { useContext } from "react";
import { UserContext } from "@/providers/UserProvider";


export function useUser() {

    const userContext = useContext(UserContext)
    
    if (!userContext) {
        throw new Error("useUser must be used within UserProvider")
    }
        

    return useQuery({
        queryKey: ["user"],
        queryFn: api.getUser,
    })

    
}