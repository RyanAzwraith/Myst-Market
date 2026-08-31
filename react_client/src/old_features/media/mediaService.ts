import {
    useMutation,
    useQuery,
    useQueryClient,
} from "@tanstack/react-query"

import { authRequest } from "@/api"

import type {
    CsvImportRequest,
    CsvImportResponse,
    GetProductMediaResponse,
    GetSaleMediaResponse,
    RetrieveProductsMediaRequest,
    RetrieveProductsMediaResponse,
    RetrieveSalesMediaRequest,
    RetrieveSalesMediaResponse,
} from "./mediaSchema"

function useProductMediaQuery(productId: number) {
    return useQuery({
        queryKey: ["product-media", productId],
        queryFn: () => authRequest<GetProductMediaResponse>(
            `/products/${productId}/media`
        ),
        select: data => data.media,
    })
}

function usePostProductsMediaMutation() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (request: RetrieveProductsMediaRequest) =>
            authRequest<RetrieveProductsMediaResponse>("/products/media", {
                method: "POST",
                body: JSON.stringify(request),
            }),
        onSuccess: (_data, request) => {
            request.productIds.forEach(productId => {
                queryClient.invalidateQueries({
                    queryKey: ["product-media", productId],
                })
            })
        },
    })
}

function useSaleMediaQuery(saleId: number) {
    return useQuery({
        queryKey: ["sale-media", saleId],
        queryFn: () => authRequest<GetSaleMediaResponse>(
            `/sales/${saleId}/media`
        ),
        select: data => data.media,
    })
}

function usePostSalesMediaMutation() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (request: RetrieveSalesMediaRequest) =>
            authRequest<RetrieveSalesMediaResponse>("/sales/media", {
                method: "POST",
                body: JSON.stringify(request),
            }),
        onSuccess: (_data, request) => {
            request.saleIds.forEach(saleId => {
                queryClient.invalidateQueries({
                    queryKey: ["sale-media", saleId],
                })
            })
        },
    })
}

function useExportProductsMutation() {
    return useMutation({
        mutationFn: () => authRequest<Blob>("/products/export", {
            responseType: "blob",
        }),
    })
}

function useExportSalesMutation() {
    return useMutation({
        mutationFn: () => authRequest<Blob>("/sales/export", {
            responseType: "blob",
        }),
    })
}

function useImportProductsMutation() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ file }: CsvImportRequest) => {
            const body = new FormData()
            body.append("file", file, file.name)

            return authRequest<CsvImportResponse>("/products/import", {
                method: "POST",
                body,
            })
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["products"],
            })
            queryClient.invalidateQueries({
                queryKey: ["admin", "products"],
            })
        },
    })
}

function useImportSalesMutation() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ file }: CsvImportRequest) => {
            const body = new FormData()
            body.append("file", file, file.name)

            return authRequest<CsvImportResponse>("/sales/import", {
                method: "POST",
                body,
            })
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["sales"],
            })
            queryClient.invalidateQueries({
                queryKey: ["admin", "sales"],
            })
        },
    })
}

export {
    useProductMediaQuery,
    usePostProductsMediaMutation,
    useSaleMediaQuery,
    usePostSalesMediaMutation,
    useExportProductsMutation,
    useExportSalesMutation,
    useImportProductsMutation,
    useImportSalesMutation,
}
