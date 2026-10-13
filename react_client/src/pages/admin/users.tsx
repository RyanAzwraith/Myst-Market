import { 
    ModalTrigger,
    LoadContent,
    Page
} from "@/shared";

import { 
    QueryParamFields 
} from "@/hooks/QueryParams";

import { 
    AdminSearchTitle,
    AdminSummaryInfo,
    AdminSearchLoader,
    AnalyticsInfo,
} from "@/features/user"


export { UsersPage }


function UsersPage() {
    return (
    <Page className="min-h-screen bg-slate-50 px-4 py-8">
        <AdminSearchLoader
        limit={20}
        render={({searchQuery, searchParams, users}) => 
        <>
            <QueryParamFields queryParams={searchParams} />
            <AdminSearchTitle adminSearchParams={searchParams} />
            <LoadContent
            className="space-y-3"
            hasMore={searchQuery.hasNextPage}
            onClick={searchQuery.fetchNextPage}
            content={users.map((user) => 
                <ModalTrigger
                className={
                    "block w-full rounded-lg border bg-white p-4 text-left " +
                    "shadow-sm transition hover:bg-gray-50"
                }
                modalClassName="max-h-[90vh] overflow-y-auto"
                button={
                    <AdminSummaryInfo user={user} />
                }
                render={_ => 
                    <AnalyticsInfo user={user} />
                } />
            )}/>
        </> } />
    </Page>
    )
}