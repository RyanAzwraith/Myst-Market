import { useQuery} from "@tanstack/react-query"

import { server } from "@/core"

import { 
    itemSummary 
} from "./schema"
import {
    useCartState,
} from "./hook"


export {
    useResolveQuery
}

// Queries
function useResolveQuery() {
    const items = useCartState(state => state.items)
    return useQuery({
        queryKey: ["Item-resolution"],
        queryFn: () => server.items.resolve({ 
            items: items.map(itemSummary.from.item),
        }),
    })
}