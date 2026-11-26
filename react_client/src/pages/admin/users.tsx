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
    <Page className="users-page admin-page">
        <AdminSearchLoader
        limit={20}
        render={({searchQuery, searchParams, users}) => 
        <>
            <QueryParamFields queryParams={searchParams} />
            <AdminSearchTitle adminSearchParams={searchParams} />
            <LoadContent
            className="admin-user-list"
            hasMore={searchQuery.hasNextPage}
            onClick={searchQuery.fetchNextPage}
            content={users.map((user) => 
                <ModalTrigger
                className="admin-user-trigger"
                modalClassName="admin-modal-dialog"
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