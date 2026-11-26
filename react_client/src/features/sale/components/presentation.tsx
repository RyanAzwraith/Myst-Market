import { useAdminSearchParams } from "../hook"
import { SearchTitle } from "@/shared"


export {
    AdminSearchTitle
}


function AdminSearchTitle({ adminSearchParams }: { 
    adminSearchParams: ReturnType<typeof useAdminSearchParams> 
}) {
    const { bindings: { search, activation } } = adminSearchParams
    return <SearchTitle
    className="sale-admin-search-title"
    possibleTitles={[
        search.get() && `Searching: ${search.get() as string}`,
        activation.get().join(', '),
        "All Sales"
    ]} />
}