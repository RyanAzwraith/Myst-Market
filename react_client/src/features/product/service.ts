import { listToRecord } from '@/utils/funcs';
import { 
    useInfiniteQuery, 
    useMutation, 
    useQuery, 
    useQueryClient 
} from '@tanstack/react-query';

import { server } from '@/core/server';

import type { MediaDetail } from './index';

import type { 
    SearchParams,
    AdminSearchParams,
} from './schema';


export {
    useProductQuery,
    useImageQuery,
    useMediasQuery,
    useAnalyticsQuery,
    useReviewsQuery,
    usePostMutation,
    usePatchMutation,
    useDeleteMutation,
    useSearchQuery,
    useAdminSearchQuery,
    useFeaturedQuery,
    usePopularQuery,
    useNewestQuery,
    useTopQuery,
    usePatchManyMutation,
    useImportMutation,
    useExportMutation,
}


// Queries
function useProductQuery(slug?: string)  {
    return useQuery({
        queryKey: ["product", slug],
        enabled: !!slug,
        queryFn: () => 
            server.product.getBySlug(slug!),
        select: data => data.product
    })
}

function useImageQuery(id: number)  {
    return useQuery({
        queryKey: ["product", "image", id],
        queryFn: () => 
            server.product.getImage(id),
        select: data => data.media
    })
}

function useMediasQuery(id: number)  {
    return useQuery({
        queryKey: ["product", "medias", id],
        queryFn: () => 
            server.product.getMedias(id),
        select: data => data.medias
    })
}

function useAnalyticsQuery(id?: number) {
    return useQuery({
        queryKey: ['admin', 'product-analytics', id],
        queryFn: () => server.product.getAnalytics(id!),
        enabled: !!id,
        select: data => data.product
    })
}

function useReviewsQuery(id: number) {
    return useQuery({
        queryKey: ['product', 'reviews', id],
        queryFn: () => server.product.getReviews(id),
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
            (lastPage.hasMore && limit) ?  (pages.length * limit) : undefined,
        select: (data) => ({
            ...data,
            products: data.pages.flatMap(page => page.products),
            images: listToRecord(
                data.pages.flatMap(page => page.images),
                (image: MediaDetail) => [image.entityId, image],
            ),
        })
    })
}

function useAdminSearchQuery(
    limit: number | null = null,
    searchParams?: AdminSearchParams,
) {
    return useInfiniteQuery({
        queryKey: ['products', "admin", { ...searchParams, limit }],
        queryFn: ({ pageParam }) => 
            server.products.adminSearch({
                searchParams: searchParams ?? null,
                limit: limit,
                offset: pageParam ?? 0,
            }),
        initialPageParam: 0,
        getNextPageParam: (lastPage, pages) => 
            (lastPage.hasMore && limit) ?  (pages.length * limit) : undefined,
        select: (data) => ({
            ...data,
            products: data.pages.flatMap(page => page.products),
        })
    })
}

function useFeaturedQuery(
    limit: number
) {
    return useQuery ({
        queryKey: ["featuredProduct"],
        queryFn: () => server.products.retrieveFeatured({ limit }),
        select: data => ({ 
            products: data.products,
            images: listToRecord(data.images, (item) => [item.entityId, item]),
        })
    })
}

function usePopularQuery(    
    limit: number,
) {
    return useQuery({
        queryKey: ['popularProducts'],
        queryFn: () => server.products.retrievePopular({ limit }),
        select: data => ({ 
            products: data.products,
            images: listToRecord(data.images, (item) => [item.entityId, item]),
        })
    })
}  

function useNewestQuery(    
    limit: number,
) {
    return useQuery({
        queryKey: ['newestProducts'],
        queryFn: () => server.products.retrieveNewest({ limit }),
        select: data => ({ 
            products: data.products,
            images: listToRecord(data.images, (item) => [item.entityId, item]),
        })
    })
}  

function useTopQuery(
    limit: number,
) {
    return useQuery({
        queryKey: ['admin', 'topProducts'],
        queryFn: () => server.products.retrieveMostSoldProducts({ limit }),
        select: data => ({ 
            products: data.products,
            images: listToRecord(data.images, (item) => [item.entityId, item]),
        })
    })
}

// Mutations
function usePostMutation() {
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

function usePatchMutation(id: number) {
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

function useDeleteMutation() {
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

function usePatchManyMutation() {
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
                queryKey: ['admin', 'productAnalytics']
            })
        }
    })
}

function useImportMutation() {
    const { invalidateQueries } = useQueryClient()
    return useMutation({
        mutationFn: (file: File) => 
            server.products.import({ file }),
        onSuccess: () => invalidateQueries({
            queryKey: ["products"],
        })
    })
}

function useExportMutation() {
    return useMutation({
        mutationFn: () => 
            server.products.export(),
    })
}