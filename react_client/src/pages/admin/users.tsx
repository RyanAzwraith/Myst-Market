import { 
    ModalTrigger,
    Grid,
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
    <Page>
        <AdminSearchLoader
        limit={20}
        render={({searchQuery, searchParams, users}) => 
        <>
            <QueryParamFields queryParams={searchParams} />
            <AdminSearchTitle adminSearchParams={searchParams} />
            <Grid
            columns={6}
            children={
                <LoadContent 
                hasMore={searchQuery.hasNextPage}
                onClick={searchQuery.fetchNextPage}
                content={users.map((user) => 
                    <ModalTrigger
                    button={
                        <AdminSummaryInfo user={user} />
                    }
                    render={_ => 
                        <AnalyticsInfo user={user} />
                    } />
                )}/>
            } />
        </> } />
    </Page>
    )
}