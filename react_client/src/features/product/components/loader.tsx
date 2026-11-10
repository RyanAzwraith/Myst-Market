import { 
    type ReactNode 
} from "react";

import { 
    Loading,
} from "@/shared";

import { 

    type MediaDetail,
} from "../index";

import type { 
    Product,
    ProductAnalytics,
} from '../schema'
import { 
    useAnalyticsQuery, 
    useProductQuery, 
    useSearchQuery,
    useAdminSearchQuery,
    useFeaturedQuery,
    useNewestQuery,
    usePopularQuery,
    useTopQuery,
} from "../service";
import { 
    useAdminSearchParams,
    useAdminSelectEdit,
    useSearchParams,
} from "../hook";


export { 
    ProductLoader,
    AnalyticsLoader,
    SearchLoader,
    AdminSearchLoader,
    FeaturedLoader,
    PopularLoader,
    NewestLoader,
    TopLoader,
}


function ProductLoader({
    slug, render,
}: {
    slug: string | undefined
    render: (product: Product) => ReactNode
}) {
    const { data: product } = useProductQuery(slug)
    if (!product) return <Loading />
    return render(product)
}

function AnalyticsLoader({
    productId, render,
}: {
    productId: number
    render: (product: ProductAnalytics) => ReactNode
}) {
    const { data: product } = useAnalyticsQuery(productId)
    if (!product) return <Loading />
    return render(product)
}

function SearchLoader({ 
    render, limit=20 
}: {
    limit?: number,
    render: ( props : {
        searchQuery: ReturnType<typeof useSearchQuery>
        searchParams: ReturnType<typeof useSearchParams>
        products: Product[] | undefined
        images: Record<string, MediaDetail>
    }) => ReactNode
}) {
    const searchParams = useSearchParams()
    const searchQuery = useSearchQuery(limit, searchParams.values())
    const { products, images } = searchQuery.data ?? {}
    return render({ searchQuery, searchParams, products, images})
}

function AdminSearchLoader({ render, limit=20 }: {
    render: ( props : {
        searchQuery: ReturnType<typeof useAdminSearchQuery>
        searchParams: ReturnType<typeof useAdminSearchParams>
        selectEdit: ReturnType<typeof useAdminSelectEdit>
        products: Product[]
    }) => ReactNode,
    limit?: number
}) {
    const searchParams = useAdminSearchParams()
    const searchQuery = useAdminSearchQuery( limit, searchParams.values() )
    const products = searchQuery.data?.products ?? []
    const selectEdit = useAdminSelectEdit(products);
    return render({ searchQuery, searchParams, selectEdit, products })
}

function _LoaderFactory(
    query: (limit: number) => ReturnType<typeof useFeaturedQuery>
) {
    return ({ render, limit=20 }: {
        render: ( props : {
            products: (Product | ProductAnalytics)[]
            images: Record<string, MediaDetail>
        }) => ReactNode,
        limit?: number
    }) => {
        const {data} = query(limit)
        if (!data) return <Loading />
        const { products, images} = data 
        return render({ products, images })
    }
}

const FeaturedLoader = _LoaderFactory(useFeaturedQuery)
const PopularLoader = _LoaderFactory(usePopularQuery)
const NewestLoader = _LoaderFactory(useNewestQuery)
const TopLoader = _LoaderFactory(useTopQuery)
