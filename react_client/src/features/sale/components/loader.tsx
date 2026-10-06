import type { ReactNode } from "react"

import { Loading } from "@/shared"

import type { MediaDetail } from "../index"

import type { 
    Sale,
} from "../schema"
import { 
    useBiggestQuery, 
    useSaleQuery,
    useAdminSearchQuery
} from "../service"
import {
    useAdminSearchParams, 
    useAdminSelectEdit,
} from "../hook"

export {
    SaleLoader,
    BiggestLoader,
    AdminSearchLoader
}



function SaleLoader({slug, render}:{
    slug: string,
    render: (sale: Sale) => React.ReactNode
}) {
    const {data: sale} = useSaleQuery(slug)
    if (!sale) return <Loading />
    return render(sale)
}

function BiggestLoader({limit, render}:{
    limit: number,
    render: (
        sales: Sale[], 
        images: Record<number, MediaDetail>
    ) => React.ReactNode
} ) {
    const {data} = useBiggestQuery(limit)
    if (!data) return <Loading />
    return render(data.sales, data.images)
}

function AdminSearchLoader({ render, limit=20 }: {
    render: ( props : {
        searchQuery: ReturnType<typeof useAdminSearchQuery>
        searchParams: ReturnType<typeof useAdminSearchParams>
        selectEdit: ReturnType<typeof useAdminSelectEdit>
        products: Sale[]
    }) => ReactNode,
    limit?: number
}) {
    const searchParams = useAdminSearchParams()
    const searchQuery = useAdminSearchQuery( limit, searchParams.values() )
    const products = searchQuery.data?.sales ?? []
    const selectEdit = useAdminSelectEdit(products);
    return render({ searchQuery, searchParams, selectEdit, products })
}

