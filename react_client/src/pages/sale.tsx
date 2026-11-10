import { useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"

import { Container, Page } from "@/shared"

import { PageRoutes } from "@/app/PageRoutes"

import { SaleLoader } from "@/features/sale"
import { DetailedInfo, SaleCarousel } from "@/features/sale"


export { SalePage }


function SalePage() {
    const navigate = useNavigate()

    const { slug } = useParams()
    useEffect(() => {
        slug || navigate(PageRoutes.catalogue);
    }, [slug, navigate])

    if (!slug) return null
    return (
    <Page className="sale-page">
        <Container className="sale-content">
            <SaleLoader 
            slug={slug} 
            render={(sale) => (
            <div className="sale-detail-layout">
                <div className="sale-image-panel">
                    <SaleCarousel saleId={sale.id} />
                </div>
                <DetailedInfo sale={sale} />
            </div>
            )} />
        </Container>
    </Page>
    )
}