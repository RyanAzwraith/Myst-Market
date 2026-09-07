import { Page } from "@/shared"
import { useNavigate } from "react-router-dom"

import { StatsSection } from "@/features/app"
import {
    FeaturedProductsSection,
    PopularProductsSection,
    NewestProductsSection,
    type Product,
} from "@/features/product"
import {
    BiggestSalesSection,
} from "@/features/sale"
import {
    TestimonialsSection,
} from "@/features/review"
import { PageRoutes } from "@/app/PageRoutes"
import type { Sale } from "@/features/sale"


export { CataloguePage }


function CataloguePage() {
    const navigate = useNavigate()
    
    const handleProductCardClick = (product: Product) => 
        navigate(`${PageRoutes.product}/${product.slug}`)
        
    const handleSaleCardClick = (sale: Sale) => 
        navigate(`${PageRoutes.sale}/${sale.slug}`)

    return (
        <Page>
            <h2>Catalogue</h2>
            
            <p> Wow Such Wow About Us Wow </p>

            <StatsSection />
            <FeaturedProductsSection limit={6} onCardClick={handleProductCardClick} />
            <PopularProductsSection limit={6} onCardClick={handleProductCardClick} />
            <NewestProductsSection limit={6} onCardClick={handleProductCardClick} />
            <BiggestSalesSection limit={3} onCardClick={handleSaleCardClick} />
            <TestimonialsSection limit={3} />
        </Page>
    )
}