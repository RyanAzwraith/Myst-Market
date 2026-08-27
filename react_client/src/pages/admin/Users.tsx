import { 
    UsersQueryParamsSection,
    UsersDisplay,
} from "@/old_features/admin";

export { UsersPage }

function UsersPage() {
    return (
        <div> 
            <UsersQueryParamsSection />
            <UsersDisplay />
        </div>
    )
}
