import { useNavigate, useParams } from "react-router-dom";
import { useEffect } from "react";

import { Page, Container, SaleBadge } from "@/shared";

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
            <div
            className={`product-detail-theme product-detail-theme-${product.rarityName}`}
            >
                <div className="product-image-panel">
                    <ProductCarousel productId={product.id} />
                    <SaleBadge
                    sale={product.sale}
                    size="large"
                    className="product-detail-sale-badge"
                    onClick={(sale) => navigate(
                        PageRoutes.sale(sale.slug)
                    )}
                    />
                </div>
                <Container className="product-detail">
                    <DetailedInfo product={product} />
                    
                    <AddToCartButton product={product} />
                </Container>
                <ReviewsSection productId={product.id}/>
            </div> }/> 
        </Container>
    </Page>
    )
}
