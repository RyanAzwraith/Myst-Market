import { labelizeRecord } from "@/utils/funcs"

import { 
    useFormInputs,
    kind as formInputsKind,
    type FieldDefs as FormInputsFieldDefs,
} from "@/hooks/FormInputs"
import { 
    kind as selectEditKind,
    useSelectEdit,
    type FieldDefs as SelectEditFieldDefs,
} from "@/hooks/SelectEdit"
import { 
    kind as queryParamsKind,
    useQueryParams,
    type FieldDefs as QueryParamsFieldDefs,
} from "@/hooks/QueryParams"

import type {
    OrderSummary,
    User,
    ItemSummary,
} from "./index"

import { 
    status,
    adminSort,
    type Order,
} from "./schema"
import {
    usePatchManyStatusMutation,
    useCreateMutation,
    usePatchStatusMutation,
} from "./service"
import { ServerException } from "@/core"
import { isDemoEnvironment, mockFormData } from '@/app/formAutoFillData'


export {
    useCheckoutFormFields,
    useAdminSearchParams,
    useAdminSelectEdit,
    useStatusForm,
}


function useCheckoutFormFields({ items, user,  }: { 
    items: ItemSummary[] | null
    user?: User,
}) {
    const fields = {
        name: {
            kind: formInputsKind.text,
            label: "Name",
            validate: value => value ? null : "Name Required",
            initial: user?.name ?? (isDemoEnvironment ? mockFormData.name : undefined),
        },
        email: {
            kind: formInputsKind.email,
            label: "Email",
            initial: user?.email ?? (isDemoEnvironment ? mockFormData.email : undefined),
        },
        isCreatingAccount: {
            kind: formInputsKind.boolean,
            label: "Would you like to create an account?",
            defaultValue: false,
            initial: !user && isDemoEnvironment,
        },
        country_code: {
            kind: formInputsKind.text,
            label: "Country code",
            placeholder: "country code",
            initial: isDemoEnvironment ? mockFormData.address.countryCode : undefined,
            validate: value => value ? null : "Country Code Required",
        },
        postcode: {
            kind: formInputsKind.text,
            label: "Postcode",
            placeholder: "postcode",
            initial: isDemoEnvironment ? mockFormData.address.postcode : undefined,
            validate: value => value ? null : "Postcode Required",
        },
        state: {
            kind: formInputsKind.text,
            label: "State",
            placeholder: "state",
            initial: isDemoEnvironment ? mockFormData.address.state : undefined,
            validate: value => value ? null : "State Required",
        },
        city: {
            kind: formInputsKind.text,
            label: "City",
            placeholder: "city",
            initial: isDemoEnvironment ? mockFormData.address.city : undefined,
            validate: value => value ? null : "City Required",
        },
        street: {
            kind: formInputsKind.text,
            label: "Street",
            placeholder: "street",
            initial: isDemoEnvironment ? mockFormData.address.street : undefined,
            validate: value => value ? null : "Street Required",
        },
        deliveryNotes: {
            kind: formInputsKind.text,
            label: "Delivery note",
            placeholder: "delivery note",
            initial: isDemoEnvironment ? mockFormData.address.deliveryNotes : undefined,
        }
    } satisfies FormInputsFieldDefs

    const { mutate } = useCreateMutation()

    return useFormInputs({
        fields,
        onValidate: () => !items ? "Missing Cart Items" : null,
        onSubmit: (values, setErrorMsg, reset) => {
            mutate({
                items: items!,
                address: {
                    countryCode: values.country_code!,
                    postcode: values.postcode!,
                    state: values.state!,
                    city: values.city!,
                    street: values.street!
                },
                deliveryNote: values.deliveryNotes ?? "",
                user: {
                    email: values.email!,
                    name: values.name!
                },
                isCreatingAccount: values.isCreatingAccount!
            }, {
                onError: (error) => {
                    if (error instanceof ServerException) setErrorMsg(error.message)
                },
                onSuccess: () => reset()
            })
        }
    })
}

function useAdminSearchParams() {
    const fields = {
        sort: {
            kind: queryParamsKind.selectOne,
            label: "Sort By",
            defaultValue: adminSort.createdAt,
            options: adminSort,
            labels: labelizeRecord(adminSort),
        },
        status: {
            kind: queryParamsKind.selectMultiple,
            label: "Status",
            options: status,
            labels: labelizeRecord(status),
        },
        searchName: {
            kind: queryParamsKind.text,
            label: "Search by name",
            placeholder: "Search by name"
        },
        isAscending: {
            kind: queryParamsKind.boolean,
            label: "Ascending",
        },
    } satisfies QueryParamsFieldDefs

    return useQueryParams(fields, '/admin/orders')
}

function useAdminSelectEdit({orders}: { 
    orders: OrderSummary[]
}) {
    const { mutate: patchAllStatus } = usePatchManyStatusMutation()

    const fields = {
        status: {
            kind: selectEditKind.selectOne,
            label: 'Selected status',
            options: status,
            labels: labelizeRecord(status),
        },
    } as SelectEditFieldDefs

    return useSelectEdit({
        ids: new Set(orders.map(order => order.id)),
        fields,
        handleSubmit: (ids, values) => {
            patchAllStatus({
                orderIds: Array.from(ids).map(Number),
                status: values.status,
            })
        },
    })
}

function useStatusForm({ order }: { 
    order: Order,
}) {
    const { mutate } = usePatchStatusMutation(order.id)

    const options = {...status, null: 'No Change'}
    const fields = {
        status: {
            kind: selectEditKind.selectOne,
            label: 'Order status',
            defaultValue: status.pending,
            options,
            labels: labelizeRecord(options),
            initial: order.status,
        },
    } as FormInputsFieldDefs

    return useFormInputs({
        fields,
        onSubmit: ({status}) =>  mutate({status})
    })
}
