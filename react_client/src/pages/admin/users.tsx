import { AdminSearchDisplay } from "@/features/user"
import { Page } from "@/shared/elements/page"


export { UsersPage }


function UsersPage() {
    return (
        <Page>
            <AdminSearchDisplay limit={20} />
        </Page>
    )
}