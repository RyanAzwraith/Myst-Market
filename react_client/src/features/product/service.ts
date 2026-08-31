import { 
    useInfiniteQuery, 
    useMutation, 
    useQuery, 
    useQueryClient 
} from '@tanstack/react-query';

import { 
    booleanFilter,
    selectOneFilter,
    selectMultipleFilter,
    textFilter,
    useQueryParams,
} from '@/utils/useQueryParams';

import { getServer } from '@/core/server';

import type { 
    Sort, 
    SearchParams,
    AdminSort,
    AdminSearchParams,
} from './schema';
import { 
    adminSort,
    categories,
    rarities,
    sort,
} from './schema';


export {
    useSearchParams,
    useAdminSearchParams,
    useProductQuery,
    useProductImageQuery,
    useProductMediasQuery,
    useProductAnalyticsQuery,
    usePostProductMutation,
    usePatchProductMutation,
    useDeleteProductMutation,
    useSearchInfiniteQuery,
    useAdminSearchInfiniteQuery,
    useFeaturedProductsQuery,
    usePopularProductsQuery,
    useNewestProductsQuery,
    useTopProductsQuery,
    usePatchProductBulkMutation,
    useImportProductsMutation,
    useExportProductsMutation,
}

// Hooks
function useSearchParams() {
    const filters = {
        categories: selectMultipleFilter({
            label: "Category",
            options: categories,
        }),
        rarities: selectMultipleFilter({
            label: "Rarity",
            options: rarities,
        }),
        sortBy: selectOneFilter<Sort>({
            label: "sortBy",
            defaultValue: sort.popularity,
            options: sort
        }),        
        isAscending: booleanFilter({
            label: "Ascending",
        }),
        search: textFilter({
            label: "Search",
            placeholder: "Search products"
        }),
    }

    return useQueryParams(filters, '/shop')
}

function useAdminSearchParams() {

    const filters = {
        isDiscontinued: booleanFilter({
            label: "Discontinued",
        }),
        sortBy: selectOneFilter<AdminSort>({
            label: "sortBy",
            defaultValue: 'newest' as AdminSort,
            options: adminSort
        }),
        categories: selectMultipleFilter<string>({
            label: 'Categories',
            options: categories
        }),
        rarities: selectMultipleFilter<string>({
            label: 'Rarities',
            options: rarities
        }),
        search: textFilter({
            label: "Search",
            placeholder: "Search"
        }),
        isAscending: booleanFilter({
            label: "Ascending",
        }),
    }

    return useQueryParams(filters, '/admin/products')
}   

// Requests
function useProductQuery(slug?: string)  {
    return useQuery({
        queryKey: ["product", slug],
        enabled: !!slug,
        queryFn: () => 
            getServer().product.getBySlug(slug!),
        select: data => data.product
    })
}

function useProductImageQuery(id: number)  {
    return useQuery({
        queryKey: ["product", id],
        queryFn: () => 
            getServer().product.getImage(id),
        select: data => data.media
    })
}

function useProductMediasQuery(id: number)  {
    return useQuery({
        queryKey: ["product", id],
        queryFn: () => 
            getServer().product.getMedias(id),
        select: data => data.medias
    })
}

function useProductAnalyticsQuery(id?: number) {
    return useQuery({
        queryKey: ['admin', 'product-analytics', id],
        queryFn: () => getServer().product.getAnalytics(id!),
        enabled: !!id,
    })
}

function usePostProductMutation() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (req: {
            name: string
            categoryName: string
            rarityName: string
            priceAudCent: number
            slug: string
            description: string
            stock: number
        }) => getServer().product.create(req),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ['admin', 'products']
            })
        }
    })
}

function usePatchProductMutation(id: number) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn :(req: Partial<{
            name: string
            categoryName: string
            rarityName: string
            priceAudCent: number
            slug: string
            description: string
            stock: number
        }>) => getServer().product.patch(id, req),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ['admin', 'product-analytics', id]
            })
            queryClient.invalidateQueries({
                queryKey: ['admin', 'products']
            })
        }
    })
}

function useDeleteProductMutation() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: number) => getServer().product.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ['admin', 'products']
            })
        }
    })
}


function useSearchInfiniteQuery(
    limit: number | null = null,
    searchParams?: SearchParams,
) {
    return useInfiniteQuery({
        queryKey: ['products', { ...searchParams, limit }],
        queryFn: ({ pageParam }) => 
            getServer().products.search({
                searchParams: searchParams ?? null,
                limit: limit,
                offset: pageParam ?? 0,
            }),
        initialPageParam: 0,
        getNextPageParam: (lastPage, pages) => 
            (lastPage.hasMore && limit) ?  (pages.length * limit) : undefined
    })
}

function useAdminSearchInfiniteQuery(
    limit: number | null = null,
    searchParams?: AdminSearchParams,
) {
    return useInfiniteQuery({
        queryKey: ['products', { ...searchParams, limit }],
        queryFn: ({ pageParam }) => 
            getServer().products.adminSearch({
                searchParams: searchParams ?? null,
                limit: limit,
                offset: pageParam ?? 0,
            }),
        initialPageParam: 0,
        getNextPageParam: (lastPage, pages) => 
            (lastPage.hasMore && limit) ?  (pages.length * limit) : undefined
    })
}

function useFeaturedProductsQuery(
    limit: number
) {
    return useQuery ({
        queryKey: ["featuredProduct"],
        queryFn: () => getServer().products.retrieveFeatured({ limit }),
        select: data => data.products
    })
}

function usePopularProductsQuery(    
    limit: number,
) {
    return useQuery({
        queryKey: ['popularProducts', limit],
        queryFn: () => getServer().products.retrievePopular({ limit }),
        select: data => data.products
    })
}  

function useNewestProductsQuery(    
    limit: number,
) {
    return useQuery({
        queryKey: ['newestProducts', limit],
        queryFn: () => getServer().products.retrieveNewest({ limit }),
        select: data => data.products
    })
}  

function useTopProductsQuery() {
    return useQuery({
        queryKey: ['admin', 'dashboard', 'top-products'],
        queryFn: () => getServer().products.retrieveMostSoldProducts({ limit: 5 }),
        select: data => data.products
    })
}

function usePatchProductBulkMutation() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (req : Partial<{
            saleIds: number[]
            startAt: Date
            endAt: Date
            discountPercent: number 
        }>) => getServer().products.patch(req),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ['admin', 'products']
            })
            queryClient.invalidateQueries({
                queryKey: ['admin', 'product-analytics']
            })
        }
    })
}

function useImportProductsMutation() {
    const { invalidateQueries } = useQueryClient()
    return useMutation({
        mutationFn: (file: File) => 
            getServer().products.import({ file }),
        onSuccess: () => invalidateQueries({
            queryKey: ["products"],
        })
    })
}

function useExportProductsMutation() {
    return useMutation({
        mutationFn: () => 
            getServer().products.export(),
    })
}