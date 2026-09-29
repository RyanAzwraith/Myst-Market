import { Page } from "@/shared"
import { useNavigate } from "react-router-dom"

import { StatsSection } from "@/features/app"
import {
    type Product,
    Card,
} from "@/features/product"
import {
    BiggestSalesSection,
} from "@/features/sale"
import {
    TestimonialsSection,
} from "@/features/review"
import { PageRoutes } from "@/app/PageRoutes"
import type { MediaDetail, Sale } from "@/features/sale"
import { CarouselComponent } from "@/shared/composition/CarouselComponent"
import { 
    FeaturedLoader, 
    PopularLoader, 
    NewestLoader 
} from "@/features/product"


export { CataloguePage }


function CataloguePage() {
    const navigate = useNavigate()
        
    const handleSaleCardClick = (sale: Sale) => 
        navigate(`${PageRoutes.sale}/${sale.slug}`)

    return (
    <Page>
        <h2>Catalogue</h2>
        
        <p> Wow Such Wow About Us Wow </p>

        <StatsSection />

        <h2>Featured Products</h2>
        <FeaturedLoader
        limit={15}
        render={({ products, images }) => 
            <ProductsSection products={products} images={images} />
        }/>

        <h2>Popular Products</h2>
        <PopularLoader
        limit={15}
        render={({ products, images }) => 
            <ProductsSection products={products} images={images} />
        }/>
        
        <h2>Newest Products</h2>
        <NewestLoader
        limit={15}
        render={({ products, images }) => 
            <ProductsSection products={products} images={images} />
        }/>

        <BiggestSalesSection limit={3} onCardClick={handleSaleCardClick} />
        <TestimonialsSection limit={3} />
    </Page>
    )
}

function ProductsSection({
    products, images
}: {
    products: Product[]
    images: Record<string, MediaDetail>
}) {
    const navigate = useNavigate()
    return (
    <div>
        <CarouselComponent 
        limit={6}
        children={products.map((product) => 
            <Card 
            product={product} 
            key={`${product.id}`} 
            image={images[product.id]}
            onClick={() => navigate(PageRoutes.product(product.slug))}
            />
        )}/>
    </div>
    )
}