
import { 
    ProductsQueryParamsSection,
    ProductsDisplay,
} from "@/old_features/admin";

export { ProductsPage }

function ProductsPage() {
    return (
        <div> 
            <ProductsQueryParamsSection />
            <ProductsDisplay />
        </div>
    )
}
