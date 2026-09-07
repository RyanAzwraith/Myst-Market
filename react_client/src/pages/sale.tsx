import { useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"

import { Page } from "@/shared"

import { PageRoutes } from "@/app/PageRoutes"

import { SaleDisplay } from "@/features/sale"


export { SalePage }


function SalePage() {
    const navigate = useNavigate()

    const { saleSlug } = useParams()
    useEffect(() => {
        if (!saleSlug) 
            navigate(PageRoutes.catalogue);
    }, [saleSlug, navigate])

    return (
        <Page>
            <SaleDisplay saleSlug={saleSlug} />
        </Page>
    )
}