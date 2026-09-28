
import { QueryParamFields } from "@/hooks/QueryParams";

import {    
    useAdminSearchParams,
    useSearchParams, 
} from "../service";


export {
    SearchParamsComponent,
    AdminSearchParamsComponent,
}

function SearchParamsComponent() {
    const { bindings: { search, ...bindings } } = useSearchParams()
    return <QueryParamFields bindings={bindings} />
}

function AdminSearchParamsComponent() {
    const { bindings: { search, ...bindings } } = useAdminSearchParams()
    return <QueryParamFields bindings={bindings} />
}