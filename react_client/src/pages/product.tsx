import { useNavigate, useParams } from "react-router-dom";
import { useEffect } from "react";

import { Page } from "@/shared/elements/page";

import { PageRoutes } from "@/app/PageRoutes";

import { ProductDisplay } from "@/features/product";


export { ProductPage }


function ProductPage() {
    const navigate = useNavigate()

    const { slug } = useParams()
    useEffect(() => {
        if (!slug) 
            navigate(PageRoutes.shop);
    }, [slug, navigate])

    return (
        <Page>
            <ProductDisplay slug={slug} />
        </Page>
    )
}