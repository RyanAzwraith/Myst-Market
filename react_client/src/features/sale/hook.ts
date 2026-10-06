
import { labelizeRecord } from "@/utils/funcs"
import { today } from '@/utils/DateStr';

import { 
    useQueryParams,
    kind as queryParamsKind
} from "@/hooks/QueryParams"
import { 
    useSelectEdit,
    kind as selectEditKind
} from "@/hooks/SelectEdit"
import { 
    useFormInputs,
    kind as formInputsKind
} from "@/hooks/FormInputs"

import type {
    Sale,
    SaleAnalytics,
} from "./schema"
import {
    activation,
    adminSort,
} from "./schema"
import { 
    usePatchMutation, 
    usePatchManyMutation, 
    usePostMutation 
} from "./service"
 
export { 
    useUpdateForm,
    useCreateForm,
    useAdminSearchParams,
    useAdminSelectEdit,
}

const fields = (sale?: SaleAnalytics) => ({
    name: {
        kind: formInputsKind.text,
        label: 'Name',
        initialValue: sale?.name,
    },
    slug: {
        kind: formInputsKind.text,
        label: 'Slug',
        initialValue: sale?.slug,
    },
    description: {
        kind: formInputsKind.text,
        label: 'Description',
        initialValue: sale?.description,
    },
    startAt: { 
        kind: formInputsKind.text,
        label: 'Start date',
        initialValue: sale?.startAt || today(),
    },
    endAt: { 
        kind: formInputsKind.text,
        label: 'End date',
        initialValue: sale?.endAt,
    },
    discountPerc: {
        kind: formInputsKind.number,
        label: 'Discount percent',
        initialValue: sale?.discountPerc,
        validate: (value: number | null) => 
            value == null || (value >= 0 && value <= 100)
                ? null : "Discount percent must be between 0 and 100",
    },
})


function useUpdateForm({
    sale, onSuccess
}: {
    sale: SaleAnalytics, 
    onSuccess?: () => void
}) {
    const { mutate } = usePatchMutation(sale.id);
    return useFormInputs({
        fields: fields(sale),
        onSubmit: (values) => mutate(values as Partial<Sale>, { 
            onSuccess 
        })
    })
}

function useCreateForm({onSuccess}: {    
    onSuccess?: () => void
}) {
	const { mutate } = usePostMutation();
    return useFormInputs({
        fields: fields(),
        onSubmit: (values) => 
            mutate(values as Omit<Sale, 'id'>, { onSuccess })
    });
}

function useAdminSearchParams() {

    const fields = {
        activation: {
            kind: queryParamsKind.selectMultiple,
            label: "Activation Type",
            options: activation,
            labels: labelizeRecord(activation),
        },
        sort: {
            kind: queryParamsKind.selectOne,
            label: "Sort By",
            defaultValue: 'startAt',
            options: adminSort,
            labels: labelizeRecord(adminSort),

        },
        search: {
            kind: queryParamsKind.text,
            label: "Search",
            placeholder: "Search"
        },
        isAscending: {
            kind: queryParamsKind.boolean,
            label: "Ascending",
        },
    }
    return useQueryParams(fields, '/admin/sales')
}

function useAdminSelectEdit(sales: SaleAnalytics[]) {
	const { mutate: patchSales } = usePatchManyMutation();

    const editFields = {
		startAt: { 
            kind: selectEditKind.text,
            label: 'Start date' 
        },
		endAt: { 
            kind: selectEditKind.text,
            label: 'End date' 
        },
		discountPercent: {
            kind: selectEditKind.number,
			label: 'Discount percent',
		},
	};
    
	const selectEdit = useSelectEdit({
		ids: new Set(sales.map(sale => sale.id)),
		fields: editFields,
		handleSubmit: (ids, values) => {
			patchSales({
				ids: [...ids],
				startAt: values.startAt && new Date(values.startAt) || null,
				endAt: values.endAt && new Date(values.endAt) || null,
				discountPercent: values.discountPercent,
			});
		},
	});
    return selectEdit;
}
