
import {
    FeaturedProductsSection,
    PopularProductsSection,
    NewestProductsSection,
    BiggestSalesSection,
    TestimonialsSection,
    RatingComponent,
} from "../index"

import { useStatsQuery } from "../service"

export {
    CataloguePage,
    AboutSection,
    StatsSection,
}

function CataloguePage() {
    return (
        <div>
            <h2>Catalogue</h2>
            <AboutSection/>
            <StatsSection />
            <FeaturedProductsSection limit={6}/>
            <PopularProductsSection limit={6} />
            <NewestProductsSection limit={6} />
            <BiggestSalesSection limit={3} />
            <TestimonialsSection limit={3} />
        </div>
    )
}

function AboutSection() {
    return (
        <div>
            <p> Wow Such Wow About Us Wow </p>
        </div>
    )
}
function StatsSection() {
    const {data: stats} = useStatsQuery()
    if (!stats) return null
    return (
        <div>
            <p>{stats.product_count} Items discovered</p>
            <p>{stats.customer_count} Adventurers served</p>
            <RatingComponent rating={stats.total_average_rating} />
            <p>Average Rating</p>

        </div>
    )
}