import type { ReactNode } from "react";


import { 
    useAuthState
} from "../index";

import type { User } from "../index";


export {
    LoggedInLoader,
}   


function LoggedInLoader({render}: {
    render: (user: User | null) => ReactNode
}) {
    const user = useAuthState(state => state.user)
    const isLoggedIn = useAuthState(state => state.isLoggedIn)
    return render(isLoggedIn() ? user : null)
}