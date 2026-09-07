import { 
    useInfiniteQuery, 
    useMutation, 
    useQuery, 
    useQueryClient 
} from "@tanstack/react-query"

import { 
    booleanFilter, 
    selectMultipleFilter, 
    selectOneFilter, 
    textFilter, 
    useQueryParams 
} from "@/utils/useQueryParams"
import { 
    numberField, 
    textField, 
    useSelectEdit 
} from "@/utils/useSelectEdit"

import { server } from "@/core"

import type {
    AdminSort,
    AdminSearchParams,
    Sale,
    SaleAnalytics,
} from "./schema"
import {
    activation,
    adminSort,
} from "./schema"
 
export { 
    useAdminSearchParams,
    useAdminSelectEdit,
    useSaleQuery,
    useSaleImageQuery,
    useSaleMediasQuery,
    useSaleAnalyticsQuery,
    usePostSaleMutation,
    usePatchSaleMutation,
    usePatchSalesMutation,
    useDeleteSaleMutation,
    useAdminSearchQuery,
    useBiggestSalesQuery,
    useImportSalesMutation,
    useExportSalesMutation,
}

// Hooks
function useAdminSearchParams() {

    const filters = {
        activation: selectMultipleFilter({
            label: "Activation Type",
            options: activation,
        }),
        sort: selectOneFilter({
            label: "Sort By",
            defaultValue: 'startAt' as AdminSort,
            options: adminSort
        }),
        search: textFilter({
            label: "Search",
            placeholder: "Search"
        }),
        isAscending: booleanFilter({
            label: "Ascending",
        }),
    }

    return useQueryParams(filters, '/admin/sales')
}

function useAdminSelectEdit(sales: SaleAnalytics[]) {
	const { mutate: patchSales } = usePatchSalesMutation();

    const editFields = {
		startAt: textField({ label: 'Start date' }),
		endAt: textField({ label: 'End date' }),
		discountPercent: numberField({
			label: 'Discount percent',
			step: 1,
		}),
	};
    
	const selectEdit = useSelectEdit({
		ids: new Set(sales.map(sale => String(sale.id))),
		FieldFactories: editFields,
		handleSubmit: (selectedIds, fieldValues) => {
			patchSales({
				ids: [...selectedIds].map(Number),
				startAt: fieldValues.startAt === null
					? null
					: new Date(fieldValues.startAt),
				endAt: fieldValues.endAt === null
					? null
					: new Date(fieldValues.endAt),
				discountPercent: fieldValues.discountPercent,
			});
		},
	});
    return selectEdit;
}


// Requests
function useSaleQuery(slug: string | undefined) {
    return useQuery({
        queryKey: ["sale", slug],
        enabled: !!slug,
        queryFn: () => server.sale.getBySlug(slug!),
        select: data => data.sale
    })
}

function useSaleImageQuery(saleId: number) {
    return useQuery({
        queryKey: ["sale-image", saleId],
        queryFn: () =>  server.sale.getImage(saleId),
        select: data => data.media,
    })
}
function useSaleMediasQuery(saleId: number) {
    return useQuery({
        queryKey: ["sale-medias", saleId],
        queryFn: () => server.sale.getMedias(saleId),
        select: data => data.medias,
    })
}

function useSaleAnalyticsQuery(saleId: number) {
    return useQuery({
        queryKey: ['admin', 'sale-analytics', saleId],
        queryFn: () => server.sale.getAnalytics(saleId),
        select: data => data.sale,
    })
}

function usePostSaleMutation() {
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

function usePatchSaleMutation(id: number) {
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

function usePatchSalesMutation() {
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

function useDeleteSaleMutation(saleId: number) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: () => server.sale.delete(saleId),
        onSuccess: () => 
            queryClient.invalidateQueries({
                queryKey: ['admin', 'sales']
            })
    })
}


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
            (lastPage.hasMore && limit) ? (pages.length * limit) : undefined
    })
}


function useBiggestSalesQuery(    
    limit: number,
) {
    return useQuery({
        queryKey: ['biggestSales', limit],
        queryFn: () => server.sales.retrieveBiggest({ limit }),
    })
}  

function useImportSalesMutation() {
    const { invalidateQueries } = useQueryClient()
    return useMutation({
        mutationFn: (file: File) => 
            server.sales.import({ file }),
        onSuccess: () => invalidateQueries({
            queryKey: ["sales"],
        })
    })
}

function useExportSalesMutation() {
    return useMutation({
        mutationFn: () => 
            server.sales.export(),
    })
}