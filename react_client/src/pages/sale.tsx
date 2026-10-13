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
    <Page>
        <Container className="py-8">
            <SaleLoader 
            slug={slug} 
            render={(sale) => (
            <>
                <SaleCarousel saleId={sale.id} />
                <DetailedInfo sale={sale} />
            </>
            )} />
        </Container>
    </Page>
    )
}