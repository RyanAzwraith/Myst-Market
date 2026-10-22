import { useNavigate } from "react-router-dom";

import { 
    Container,
    Grid,
    LoadContent, 
    Page,
    Section,
} from "@/shared";

import { 
    QueryParamFields 
} from "@/hooks/QueryParams";

import { PageRoutes } from "@/app/PageRoutes";

import { 
    SearchLoader, 
    ProductSearchTitle,
    ProductCard,
} from "@/features/product"

export { ShopPage }

function ShopPage() {
    const navigate = useNavigate()

    return (
    <Page className="shop-page">
        <SearchLoader
        render={({ searchQuery, searchParams, products, images }) => 
        <Container className="shop-content">
            <QueryParamFields queryParams={searchParams} />
            <ProductSearchTitle
            className="shop-title"
            searchParams={searchParams}
            />
            <Grid
            columns={1}
            smColumns={2}
            mdColumns={3}
            lgColumns={4}
            gap="lg"
            className="shop-grid"
            >
                <LoadContent
                className="shop-products"
                hasMore={searchQuery.hasNextPage}
                onClick={searchQuery.fetchNextPage}
                content={(products ?? []).map(p => 
                    <ProductCard 
                    key={p.id} 
                    product={p}
                    image={images[p.id]}
                    onClick={(product) => navigate(
                        PageRoutes.product(product.slug)
                    )}
                    />
                )}/>
            </Grid>
        </Container>
        }/> 
    </Page>
    )
}
