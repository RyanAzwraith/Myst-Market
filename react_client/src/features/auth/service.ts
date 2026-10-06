
import { useMutation } from '@tanstack/react-query';

import { 
    server,
    logger 
} from '@/core';

import type { 
    Login,
} from './schema'
import { useAuthState } from './state'
import { input } from '@testing-library/user-event/dist/cjs/event/index.js';

export {
    useLoginMutation,
    useLogoutMutation,
    useRefreshMutation,
}


// Mutations
function useLoginMutation({ onSuccess, onError }: { 
    onSuccess?: () => void, 
    onError?: () => void 
}) {
    const login = useAuthState((state) => state.login)
    return useMutation({
        mutationFn: (login: Login) => server.auth.login({ login }),
        onSuccess: ({accessToken, user}) => {
            login(accessToken, user)
            onSuccess?.()
        },
        onError: () => {
            logger.error("Unexpected server error, unable to login")
            onError?.()
        },
    })
}

function useLogoutMutation({ onSuccess, onError }: { 
    onSuccess?: () => void, 
    onError?: () => void 
}) {
    const logout = useAuthState((state) => state.logout)
    return useMutation({
        mutationFn: () => server.auth.logout(),
        onSuccess: () => {
            logout()
            onSuccess?.()
        },
        onError: () => {
            logger.error("Unexpected server error, unable to logout")
            onError?.()
        }
    })
}

function useRefreshMutation({ onSuccess, onError }: { 
    onSuccess?: () => void, 
    onError?: () => void 
}) {
    const refresh = useAuthState((state) => state.refresh)
    return useMutation({
        mutationFn: async () => {
            const response = await server.auth.refresh()
            return response.accessToken
        },
        onSuccess: (accessToken) =>  {
            refresh(accessToken)
            onSuccess?.()
        },
        onError: () => {
            onError?.()
        }
    })
}

