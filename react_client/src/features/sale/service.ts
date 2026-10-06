import { 
    useInfiniteQuery, 
    useMutation, 
    useQuery, 
    useQueryClient 
} from "@tanstack/react-query"

import { server } from "@/core"

import type {
    AdminSearchParams,
    Sale,
} from "./schema"
import type { MediaDetail } from "../product"
import { listToRecord } from "@/utils/funcs"

 
export { 
    useSaleQuery,
    useImageQuery,
    useMediasQuery,
    useAnalyticsQuery,
    usePostMutation,
    usePatchMutation,
    usePatchManyMutation,
    useDeleteMutation,
    useAdminSearchQuery,
    useBiggestQuery,
    useImportMutation,
    useExportMutation,
}


// Infinite Queries
function useAdminSearchQuery(
    limit: number | null,
    searchParams?: AdminSearchParams
) {
    return useInfiniteQuery({
        queryKey: ['admin', 'sales', { ...searchParams, limit }],
        queryFn: ({ pageParam }) => {
            return server.sales.adminSearch({
                searchParams: searchParams ?? null,
                limit: limit,
                offset: pageParam ?? 0,
            })
        },
        initialPageParam: 0,
        getNextPageParam: (lastPage, pages) =>
            (lastPage.hasMore && limit) ? (pages.length * limit) : undefined,
        select: (data) => ({
            ...data,
            sales: data.pages.flatMap(page => page.sales),
        })
    })
}

// Queries
function useSaleQuery(slug: string | undefined) {
    return useQuery({
        queryKey: ["sale", slug],
        enabled: !!slug,
        queryFn: () => server.sale.getBySlug(slug!),
        select: data => data.sale
    })
}

function useImageQuery(saleId: number) {
    return useQuery({
        queryKey: ["sale-image", saleId],
        queryFn: () =>  server.sale.getImage(saleId),
        select: data => data.media,
    })
}
function useMediasQuery(saleId: number) {
    return useQuery({
        queryKey: ["sale-medias", saleId],
        queryFn: () => server.sale.getMedias(saleId),
        select: data => data.medias,
    })
}

function useAnalyticsQuery(saleId: number) {
    return useQuery({
        queryKey: ['admin', 'sale-analytics', saleId],
        queryFn: () => server.sale.getAnalytics(saleId),
        select: data => data.sale,
    })
}

function useBiggestQuery(    
    limit: number,
) {
    return useQuery({
        queryKey: ['biggestSales', limit],
        queryFn: () => server.sales.retrieveBiggest({ limit }),
        select: data => ({
            sales: data.sales,
            images: listToRecord(
                data.images, (item) => [item.entityId, item]
            ) as Record<number, MediaDetail>,
        })
    })
}  

// Mutations
function usePostMutation() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (req: Omit<Sale, 'id'>) => server.sale.create(req),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ['admin', 'sales']
            })
        }
    })
}

function usePatchMutation(id: number) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (req : Partial<Sale>) => server.sale.patch(id, req),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ['admin', 'sale-analytics', id]
            })
            queryClient.invalidateQueries({
                queryKey: ['admin', 'sales']
            })
        }
    })
}

function usePatchManyMutation() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (req: Partial<{
            ids: number[]
            startAt: Date | null
            endAt: Date | null
            discountPercent: number | null
        }>) => server.sales.patch(req),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ['admin', 'sales']
            })
            queryClient.invalidateQueries({
                queryKey: ['admin', 'sale-analytics']
            })
        }
    })
}

function useDeleteMutation({
    saleId, onSuccess
}: {
    saleId: number, 
    onSuccess?: () => void
}) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: () => server.sale.delete(saleId),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ['admin', 'sales']
            })
            onSuccess?.()
        }
    })
}



function useImportMutation() {
    const { invalidateQueries } = useQueryClient()
    return useMutation({
        mutationFn: (file: File) => 
            server.sales.import({ file }),
        onSuccess: () => invalidateQueries({
            queryKey: ["sales"],
        })
    })
}

function useExportMutation() {
    return useMutation({
        mutationFn: () => 
            server.sales.export(),
    })
}