
import { 
    SalesQueryParamsSection,
    SalesDisplay,
} from "@/old_features/admin";

export { SalesPage }

function SalesPage() {
    return (
        <div> 
            <SalesQueryParamsSection />
            <SalesDisplay />
        </div>
    )
}
