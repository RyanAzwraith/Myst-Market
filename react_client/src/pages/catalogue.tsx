import { useNavigate } from "react-router-dom"

import { 
    Heading,
    Inline,
    List, 
    Page,
    Row,
    Text,
} from "@/shared"

import { PageRoutes } from "@/app/PageRoutes"

import { 
    StatsInfo 
    
} from "@/features/app"
import {
    FeaturedLoader, 
    PopularLoader, 
    NewestLoader,
    CardCarousel as ProductCardCarousel,
} from "@/features/product"
import {
    BiggestLoader,
    SaleCard,

} from "@/features/sale"
import {
    ReviewCard,
    TestimonialLoader
} from "@/features/review"
import type { 
    Sale 

} from "@/features/sale"


export { CataloguePage }


function CataloguePage() {
    const navigate = useNavigate()
        
    const handleSaleCardClick = (sale: Sale) => 
        navigate(`${PageRoutes.sale}/${sale.slug}`)

    return (
    <Page>
        <Heading>Catalogue</Heading>
        
        <Text> Wow Such Wow About Us Wow </Text>

        <StatsInfo />

        <Heading level={2}>Featured Products</Heading>
        <FeaturedLoader
        limit={15}
        render={({ products, images }) => 
            <ProductCardCarousel products={products} images={images} />
        }/>

        <Heading level={2}>Popular Products</Heading>
        <PopularLoader
        limit={15}
        render={({ products, images }) => 
            <ProductCardCarousel products={products} images={images} />
        }/>
        
        <Heading level={2}>Newest Products</Heading>
        <NewestLoader
        limit={15}
        render={({ products, images }) => 
            <ProductCardCarousel products={products} images={images} />
        }/>

        <Heading level={2}>Biggest Sales</Heading>
        <BiggestLoader
        limit={3}
        render={(sales, images) => (
            <Inline
            children={
                <List
                items={sales}
                render={(s) => 
                    <SaleCard 
                    sale={s}
                    key={`${s.slug}-${s.id}`}
                    image={images[s.id]}
                    onClick={() => handleSaleCardClick(s)}
                    />
                }/>
            } />
        )}/>
        
        <Heading level={2}>Testimonials</Heading>
        <TestimonialLoader
        limit={3}
        render={(reviews) => (
            <Inline
            children={
                <List
                items={reviews}
                render={(r) => 
                    <ReviewCard 
                    review={r} 
                    key={`${r.userName}`} 
                    />
                }/>
            } />
        )}/>
    </Page>
    )
}
