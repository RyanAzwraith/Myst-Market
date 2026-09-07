import { useNavigate } from "react-router-dom";


import { Page } from "@/shared";

import { 
    SearchParamsComponent,
    SearchDisplay,
    ProductCard
} from "@/features/product"

export { ShopPage }

function ShopPage() {
    const navigate = useNavigate()
    return (
        <Page>
            <SearchParamsComponent />
            <SearchDisplay
            renderProduct={(product, image) => (
                <ProductCard 
                key={product.id} 
                product={product}
                image={image}
                onClick={(product) => navigate(`/product/${product.slug}`)}
                onSaleClick={(sale) => navigate(`/sale/${sale!.slug}`)}
                />
            )}
            />
        </Page>
    )
}