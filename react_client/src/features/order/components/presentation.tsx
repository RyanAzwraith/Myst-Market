import {SearchTitle} from "@/shared"

import type { useAdminSearchParams } from "../hook"


export { 
    AdminSearchTitle 
}


function AdminSearchTitle({ adminSearchParams }: { 
    adminSearchParams: ReturnType<typeof useAdminSearchParams> 
}) {
    const { bindings: { searchName, status } } = adminSearchParams
    return <SearchTitle possibleTitles={[
        searchName.get() && `Searching: ${searchName.get() as string}`,
        status.get().join(', '),
        "All Orders"
    ]} />
}
