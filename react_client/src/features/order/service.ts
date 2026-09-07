import { 
    useQuery,
    useInfiniteQuery, 
    useMutation, 
    useQueryClient
} from "@tanstack/react-query"

import { 
    booleanFilter, 
    selectMultipleFilter, 
    selectOneFilter, 
    textFilter, 
    useQueryParams 
} from "@/utils/useQueryParams"

import { server } from "@/core/server"

import type {
    UserInput,
    ItemSummary,
    OrderSummary,
} from "./index"
import type { 
    Status,
    Address, 
    AdminSort,
    AdminSearchParams,
    Order,
} from "./schema"
import { 
    status,
    adminSort,
} from "./schema"
import { 
    booleanField,
    emailField,
    textField, 
    useFormFields 
} from "@/utils/useFormFields"
import { selectOneField, useSelectEdit } from "@/utils/useSelectEdit"


export {
    useCheckoutFormFields,
    useAdminSearchParams,
    useAdminSelectEdit,

    useCreateMutation,
    useGetByIdQuery,
    usePatchStatusMutation,
    useAdminSearchQuery,
    useGetRecentQuery,
    usePatchAllStatusMutation,
}
// Hooks

function useCheckoutFormFields() {
    return useFormFields({
        name: textField({
            label: "Name",
            validate: value => value ? null : "Name Required",
        }),
        email: emailField({
            label: "Email",
        }),
        isCreatingAccount: booleanField({
            label: "Would you like to create an account?",
        }),
        country_code: textField({
            label: "Country code",
            placeholder: "country code",
            validate: value => value ? null : "Country Code Required",
        }),
        postcode: textField({
            label: "Postcode",
            placeholder: "postcode",
            validate: value => value ? null : "Postcode Required",
        }),
        state: textField({
            label: "State",
            placeholder: "state",
            validate: value => value ? null : "State Required",
        }),
        city: textField({
            label: "City",
            placeholder: "city",
            validate: value => value ? null : "City Required",
        }),
        street: textField({
            label: "Street",
            placeholder: "street",
            validate: value => value ? null : "Street Required",
        }),
        deliveryNotes: textField({
            label: "Delivery note",
            placeholder: "delivery note",
        }),
    })
}

function useAdminSearchParams() {
    const filters = {
        sort: selectOneFilter<AdminSort>({
            label: "Sort By",
            defaultValue: 'createdAt' as AdminSort,
            options: adminSort
        }),   
        status: selectMultipleFilter<Status>({
            label: "Status",
            options: status
        }),
        searchName: textFilter({
            label: "Search by name",
            placeholder: "Search by name"
        }),
        isAscending: booleanFilter({
            label: "Ascending",
        }),
    }

    return useQueryParams(filters, '/admin/orders')
}

function useAdminSelectEdit({orders}: { 
    orders: OrderSummary[]
}) {
    const { mutate: patchAllStatus } = usePatchAllStatusMutation()

    const editFields = {
        status: selectOneField<Status>({
            label: 'Selected status',
            options: status,
        }),
    }

    return useSelectEdit({
        ids: new Set(orders.map(order => String(order.id))),
        FieldFactories: editFields,
        handleSubmit: (selectedIds, fieldValues) => {
            if (fieldValues.status === null) return
            patchAllStatus({
                orderIds: Array.from(selectedIds).map(Number),
                status: fieldValues.status,
            })
        },
    })
}

// Request
function useCreateMutation()  {
    return useMutation({
        mutationFn: (req : {
            items: ItemSummary[]
            address: Address
            deliveryNote: string
            user: UserInput | null
            isCreatingAccount: boolean  | null
        }) => server.order.create(req),
        onSuccess: (data) => { 
            window.location.href = data.stripeSessionUrl
        }
    })
}   

function useGetByIdQuery(id: number | undefined)  {
    return useQuery({
        queryKey: ['admin', 'order', id],
        enabled: !!id,
        queryFn: () => server.order.getById(id!),
    })
}

function usePatchStatusMutation(id: number)  {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (req : {
            status: Status  
        }) =>
            server.order.patchStatus(id, req), 
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ['admin', 'orders']
            })
            queryClient.invalidateQueries({
                queryKey: ['admin', 'order', id]
            })
        }
    })
} 

function useAdminSearchQuery(
    limit: number | null = null,
    params?: AdminSearchParams,
) {
    return useInfiniteQuery({
        queryKey: ['admin', 'orders', { ...params, limit }],
        queryFn: ({ pageParam }) => server.orders.adminSearch({
            searchParams: params ?? null,
            limit,
            offset: pageParam ?? 0
        }),
        initialPageParam: 0,
        getNextPageParam: (lastPage, pages) => 
            (lastPage.hasMore && limit) ?  (pages.length * limit) : undefined
    })
}

function useGetRecentQuery()  {
    return useQuery({
        queryKey: ['admin', 'recent'],
        queryFn: () => server.orders.getRecent(),
        select: data => data.orders,
    })
}

function usePatchAllStatusMutation() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (req : {
                orderIds: number[]
                status: Status
            }) => server.orders.patchStatus(req),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ['admin', 'orders']
            })
            queryClient.invalidateQueries({
                queryKey: ['admin', 'order']
            })
        }
    })
}

