import { labelizeRecord } from "@/utils/funcs"

import { 
    useFormInputs, 
    kind as formInputsKind, 
    type FieldDefs as FormFieldDefs
} from "@/hooks/FormInputs"
import { 
    useQueryParams,
    type FieldDefs as QueryParamsFieldDefs, 
    kind as queryParamsKind
} from '@/hooks/QueryParams';
import {
    useSelectEdit,
    kind as selectEditKind
} from '@/hooks/SelectEdit';

import type { 
    Product,
    ProductAnalytics,
    ProductFields,
} from './schema';
import { 
    categories,
    rarities,
    sort,
    adminSort,
} from './schema';
import { 
    usePatchMutation,
    usePatchManyMutation, 
    usePostMutation
} from './service';


export {
    updateFormFields,
    queryParamFields,
    adminQueryParamFields,
    adminSelectEditFields,

    useUpdateFormFields,
    useCreateFormFields,
    useSearchParams,
    useAdminSearchParams,
    useAdminSelectEdit,
}

// FormInputs
const updateFormFields = (product?: ProductFields) => ({
    name: { 
        kind: formInputsKind.text,
        label: "Name", 
        initial: product?.name,
    },
    categoryName: { 
        kind: formInputsKind.text,
        label: "Category",
        initial: product?.categoryName,
    },
    rarityName: {
        kind: formInputsKind.text,
        label: "Rarity",
        initial: product?.rarityName,
    },
    priceAudCent: {
        kind: formInputsKind.number,
        label: "Price (cents)",
        initial: product?.priceAudCent,
    },
    slug: {
        kind: formInputsKind.text,
        label: "Slug",
        initial: product?.slug,
    },
    description: {
        kind: formInputsKind.text,
        label: "Description",
        initial: product?.description,
    },
    stock: {
        kind: formInputsKind.number,
        label: "Stock",
        initial: product?.stock,
    }
} as FormFieldDefs)

function useUpdateFormFields({ 
    product, onSuccess
}: { 
    product: Product,
    onSuccess?: () => void,
}) {
    const { mutate } = usePatchMutation(product.id);

    return useFormInputs({
        fields: updateFormFields(product), 
        onSubmit (values, _, reset) {
            mutate(values, {
                onSuccess() {
                    reset(values);
                    onSuccess?.();
                }
            }
        )},
    })
}

function useCreateFormFields({ 
    onSuccess
}: { 
    onSuccess?: () => void,
}) {
    const { mutate } = usePostMutation();

    return useFormInputs({
        fields: updateFormFields(), 
        onSubmit (values) {
            mutate(values as ProductFields, {
                onSuccess() {
                    onSuccess?.();
                }
            }
        )},
    })
}


// QueryParams
const queryParamFields = {
    categories: {
        kind: queryParamsKind.selectMultiple,
        label: "Category",
        options: categories,
        labels: labelizeRecord(categories),
    },
    rarities: {
        kind: queryParamsKind.selectMultiple,
        label: "Rarity",
        options: rarities,
        labels: labelizeRecord(rarities),
    },
    sort: {
        kind: queryParamsKind.selectOne,
        label: "sort By",
        defaultValue: sort.popularity,
        options: sort,
        labels: labelizeRecord(sort),
    },        
    isAscending: {
        kind: queryParamsKind.boolean,
        label: "Ascending",
    },
    search: {
        kind: queryParamsKind.text,
        label: "Search",
        placeholder: "Search products..."
    },

} satisfies QueryParamsFieldDefs;

function useSearchParams() {
    return useQueryParams(queryParamFields, '/shop');
}


const adminQueryParamFields = {
    sort: {
        kind: queryParamsKind.selectOne,
        label: "Sort By",
        defaultValue: adminSort.newest,
        options: adminSort,
        labels: labelizeRecord(adminSort),
    },
    categories: {
        kind: queryParamsKind.selectMultiple,
        label: 'Categories',
        options: categories,
        labels: labelizeRecord(categories),
    },
    rarities: {
        kind: queryParamsKind.selectMultiple,
        label: 'Rarities',
        options: rarities,
        labels: labelizeRecord(rarities),
    },
    search: {
        kind: queryParamsKind.text,
        label: "Search",
        placeholder: "Search products..."
    },

    isDiscontinued: {
        kind: queryParamsKind.boolean,
        label: "Discontinued",
    },
    isAscending: {
        kind: queryParamsKind.boolean,
        label: "Ascending",
    },
} satisfies QueryParamsFieldDefs;

function useAdminSearchParams() {
    return useQueryParams(adminQueryParamFields, '/product');
}


// SelectEdits
const adminSelectEditFields = {
        categoryName: {
            kind: selectEditKind.selectOne,
            label: 'Category',
            options: categories,
            labels: labelizeRecord(categories),
        },
        rarityName: {
            kind: selectEditKind.selectOne,
            label: 'Rarity',
            options: rarities,
            labels: labelizeRecord(rarities),
        },
        priceAudCent: {
            kind: selectEditKind.number,
            label: 'Price',
        },
        stock: {
            kind: selectEditKind.number,
            label: 'Stock',
        },
    };

function useAdminSelectEdit(products: ProductAnalytics[]) {
    const { mutate } = usePatchManyMutation();
    return useSelectEdit({
        ids: new Set(products.map(product => product.id)),
        fields: adminSelectEditFields,
        handleSubmit (selectedIds, fieldValues) {
            mutate({
                productIds: [...selectedIds],
                ...fieldValues,
            });
        },
    });
}