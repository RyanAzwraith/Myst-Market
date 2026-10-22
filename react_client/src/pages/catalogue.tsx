import { useNavigate } from "react-router-dom"

import { 
    Carousel,
    Heading,
    Page,
    Section,
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


export { CataloguePage }


function CataloguePage() {
    const navigate = useNavigate()
        
    return (
    <Page className="catalogue-page">
        <Section className="catalogue-intro">
            <Heading className="catalogue-title">Catalogue</Heading>
            <Text className="catalogue-description">
                Wow Such Wow About Us Wow
            </Text>
        </Section>

        <Section className="catalogue-stats-section">
            <StatsInfo />
        </Section>

        <Section className="catalogue-section">
            <Heading level={2} className="catalogue-section-title">
                Featured Products
            </Heading>
            <FeaturedLoader
            limit={15}
            render={({ products, images }) => 
                <ProductCardCarousel 
                products={products} 
                images={images} 
                onClick={product => navigate(PageRoutes.product(product.slug))}
                />
            }/>
        </Section>

        <Section className="catalogue-section">
            <Heading level={2} className="catalogue-section-title">
                Popular Products
            </Heading>
            <PopularLoader
            limit={15}
            render={({ products, images }) => 
                <ProductCardCarousel 
                products={products} 
                images={images} 
                onClick={product => navigate(PageRoutes.product(product.slug))}
                />
            }/>
        </Section>
        
        <Section className="catalogue-section">
            <Heading level={2} className="catalogue-section-title">
                Newest Products
            </Heading>
            <NewestLoader
            limit={15}
            render={({ products, images }) => 
                <ProductCardCarousel 
                products={products} 
                images={images} 
                onClick={product => navigate(PageRoutes.product(product.slug))}
                />
            }/>
        </Section>

        <Section className="catalogue-section">
            <Heading level={2} className="catalogue-section-title">
                Biggest Sales
            </Heading>
            <BiggestLoader
            limit={3}
            render={(sales, images) => (
                <Carousel
                content={sales.map((s) => 
                    <SaleCard 
                    sale={s}
                    key={`${s.slug}-${s.id}`}
                    image={images[s.id]}
                    onClick={(sale) => navigate(PageRoutes.sale(sale.slug))}
                    />
                )}
                limit={3}
                />
            )}/>
        </Section>
        
        <Section className="catalogue-section">
            <Heading level={2} className="catalogue-section-title">
                Testimonials
            </Heading>
            <TestimonialLoader
            limit={3}
            render={(reviews) => (
                <Carousel
                content={reviews.map((r) => 
                        <ReviewCard 
                        review={r} 
                        key={`${r.userName}`} 
                        />
                )}
                limit={3}
                />
            )}/>
        </Section>
    </Page>
    )
}
