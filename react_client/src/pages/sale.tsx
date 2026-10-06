import { useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"

import { Page } from "@/shared"

import { PageRoutes } from "@/app/PageRoutes"

import { SaleLoader } from "@/features/sale"
import { DetailedInfo } from "@/features/sale"


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
        <SaleLoader 
        slug={slug} 
        render={(sale) => 
            <DetailedInfo sale={sale} />
        } />
    </Page>
    )
}