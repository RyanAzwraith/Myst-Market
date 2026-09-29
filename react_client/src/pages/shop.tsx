import { useNavigate } from "react-router-dom";

import { 
    ChevronDownIcon,
    List, 
    Page
} from "@/shared";

import { 
    QueryParamFields 
} from "@/hooks/QueryParams";

import { PageRoutes } from "@/app/PageRoutes";

import { 
    SearchLoader, 
    SearchTitle,
    Card,
} from "@/features/product"

export { ShopPage }

function ShopPage() {
    const navigate = useNavigate()

    return (
    <Page> 
        <SearchLoader
        render={({ searchQuery, searchParams, products, images }) => <>

            <QueryParamFields queryParams={searchParams} />
            <SearchTitle searchParams={searchParams} />

            <List
            items={products ?? []}
            renderItem={(p) => 
                <Card 
                key={p.id} 
                product={p}
                image={images[p.id]}
                onClick={(product) => navigate(PageRoutes.product(product.slug))}
                />
            }/>
            <ChevronDownIcon 
            onClick={searchQuery.fetchNextPage}
            hidden={!searchQuery.hasNextPage}
            />
            
        </> }/> 
    </Page>
    )
}
