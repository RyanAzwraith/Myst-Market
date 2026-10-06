
import { SearchTitle } from "@/shared";
import { useAdminSearchParams } from "../hook";

export {
    AdminSearchTitle
}

function AdminSearchTitle({ adminSearchParams }: { 
    adminSearchParams: ReturnType<typeof useAdminSearchParams> 
}) {
    const { bindings: { search, registration } } = adminSearchParams
    return <SearchTitle possibleTitles={[
        search.get() && `Searching: ${search.get()}`,
        registration.get().join(', '),
        "All Users"
    ]} />
}
