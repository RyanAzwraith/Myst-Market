import { useNavigate, useParams } from "react-router-dom";
import { useEffect } from "react";

import { Page } from "@/shared";

import { PageRoutes } from "@/app/PageRoutes";

import { 
    ProductLoader, 
    DetailedInfo, 
    ReviewsSection,
} from "@/features/product";
import { 
    AddToCartButton 
} from "@/features/item";

export { ProductPage }


function ProductPage() {
    const navigate = useNavigate()

    const { slug } = useParams()
    useEffect(() => {
        if (!slug) navigate(PageRoutes.shop);
    }, [slug, navigate])
    
    return (
    <Page> 
        <ProductLoader 
        slug={slug}
        render={(product) => <>

            <DetailedInfo 
            product={product}
            onSaleClick={(sale) => navigate(PageRoutes.sale(sale.slug))}
            />
            <AddToCartButton product={product} />
            <ReviewsSection productId={product.id}/>

        </> }/> 
    </Page>
    )
}
