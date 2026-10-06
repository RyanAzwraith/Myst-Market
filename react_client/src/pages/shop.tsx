import { useNavigate } from "react-router-dom";

import { 
    Grid,
    LoadContent, 
    Page
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
    <Page> 
        <SearchLoader
        render={({ searchQuery, searchParams, products, images }) => 
        <>

            <QueryParamFields queryParams={searchParams} />
            <ProductSearchTitle searchParams={searchParams} />

            <Grid
            columns={6}
            children={
                <LoadContent
                hasMore={!searchQuery.hasNextPage}
                onClick={searchQuery.fetchNextPage}
                content={(products ?? []).map(p => 
                    <ProductCard 
                    key={p.id} 
                    product={p}
                    image={images[p.id]}
                    onClick={(product) => navigate(PageRoutes.product(product.slug))}
                    />
                )}/> }/> 
        </> }/> 
    </Page>
    )
}
