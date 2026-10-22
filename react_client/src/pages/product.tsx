import { useNavigate, useParams } from "react-router-dom";
import { useEffect } from "react";

import { Page, Container } from "@/shared";

import { PageRoutes } from "@/app/PageRoutes";

import { 
    ProductLoader, 
    DetailedInfo, 
    ReviewsSection,
    ProductCarousel,
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
    <Page className="product-page">
        <Container className="product-content">
            <ProductLoader 
            slug={slug}
            render={(product) => 
            <>
                <ProductCarousel productId={product.id} />
                <Container className="product-detail">
                    <DetailedInfo 
                    product={product}
                    onSaleClick={(sale) => navigate(PageRoutes.sale(sale.slug))}
                    />
                    
                    <AddToCartButton product={product} />
                </Container>
                <ReviewsSection productId={product.id}/>
             </> }/> 
        </Container>
    </Page>
    )
}
