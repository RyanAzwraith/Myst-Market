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
import {
  numberField,
  selectOneField,
  useSelectEdit,
} from '@/utils/useSelectEdit';

import { server } from '@/core/server';

import type { 
    Sort, 
    SearchParams,
    AdminSort,
    AdminSearchParams,
    ProductAnalytics,
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
    useAdminSelectEdit,
    
    useProductQuery,
    useProductImageQuery,
    useProductMediasQuery,
    useProductAnalyticsQuery,
    useReviewsQuery,
    usePostProductMutation,
    usePatchProductMutation,
    useDeleteProductMutation,
    useSearchQuery,
    useAdminSearchQuery,
    useFeaturedProductsQuery,
    usePopularProductsQuery,
    useNewestProductsQuery,
    useTopProductsQuery,
    usePatchProductsMutation,
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
        sort: selectOneFilter<Sort>({
            label: "sort By",
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
        sort: selectOneFilter<AdminSort>({
            label: "Sort By",
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

function useAdminSelectEdit(products: ProductAnalytics[]) {
    const { mutate: patchProducts } = usePatchProductsMutation();
    const editFields = {
        categoryName: selectOneField({
            label: 'Category',
            options: categories,
        }),
        rarityName: selectOneField({
            label: 'Rarity',
            options: rarities,
        }),
        priceAudCent: numberField({
            label: 'Price (cents)',
            step: 1,
        }),
            stock: numberField({
            label: 'Stock',
            step: 1,
        }),
    };

    return useSelectEdit({
        ids: new Set(products.map(product => String(product.id))),
        FieldFactories: editFields,
        handleSubmit: (selectedIds, fieldValues) => {
        patchProducts({
            productIds: [...selectedIds].map(Number),
            ...fieldValues,
        });
        },
    });
}


// Requests
function useProductQuery(slug?: string)  {
    return useQuery({
        queryKey: ["product", slug],
        enabled: !!slug,
        queryFn: () => 
            server.product.getBySlug(slug!),
        select: data => data.product
    })
}

function useProductImageQuery(id: number)  {
    return useQuery({
        queryKey: ["product", id],
        queryFn: () => 
            server.product.getImage(id),
        select: data => data.media
    })
}

function useProductMediasQuery(id: number)  {
    return useQuery({
        queryKey: ["product", id],
        queryFn: () => 
            server.product.getMedias(id),
        select: data => data.medias
    })
}

function useProductAnalyticsQuery(id?: number) {
    return useQuery({
        queryKey: ['admin', 'product-analytics', id],
        queryFn: () => server.product.getAnalytics(id!),
        enabled: !!id,
    })
}

function useReviewsQuery(id: number) {
    return useQuery({
        queryKey: ['product', 'reviews', id],
        queryFn: () => server.product.getReviews(id),
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
        }) => server.product.create(req),
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
        }>) => server.product.patch(id, req),
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
        mutationFn: (id: number) => server.product.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ['admin', 'products']
            })
        }
    })
}

function useSearchQuery(
    limit: number | null = null,
    searchParams?: SearchParams,
) {
    return useInfiniteQuery({
        queryKey: ['products', { ...searchParams, limit }],
        queryFn: ({ pageParam }) => 
            server.products.search({
                searchParams: searchParams ?? null,
                limit: limit,
                offset: pageParam ?? 0,
            }),
        initialPageParam: 0,
        getNextPageParam: (lastPage, pages) => 
            (lastPage.hasMore && limit) ?  (pages.length * limit) : undefined
    })
}

function useAdminSearchQuery(
    limit: number | null = null,
    searchParams?: AdminSearchParams,
) {
    return useInfiniteQuery({
        queryKey: ['products', { ...searchParams, limit }],
        queryFn: ({ pageParam }) => 
            server.products.adminSearch({
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
        queryFn: () => server.products.retrieveFeatured({ limit }),
    })
}

function usePopularProductsQuery(    
    limit: number,
) {
    return useQuery({
        queryKey: ['popularProducts', limit],
        queryFn: () => server.products.retrievePopular({ limit }),
    })
}  

function useNewestProductsQuery(    
    limit: number,
) {
    return useQuery({
        queryKey: ['newestProducts', limit],
        queryFn: () => server.products.retrieveNewest({ limit }),
    })
}  

function useTopProductsQuery() {
    return useQuery({
        queryKey: ['admin', 'dashboard', 'top-products'],
        queryFn: () => server.products.retrieveMostSoldProducts({ limit: 5 }),
    })
}

function usePatchProductsMutation() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (req : Partial<{
            productIds: number[] 
            categoryName: string | null 
            rarityName: string | null 
            priceAudCent: number | null
            stock: number | null;
        }>) => server.products.patch(req),
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
            server.products.import({ file }),
        onSuccess: () => invalidateQueries({
            queryKey: ["products"],
        })
    })
}

function useExportProductsMutation() {
    return useMutation({
        mutationFn: () => 
            server.products.export(),
    })
}