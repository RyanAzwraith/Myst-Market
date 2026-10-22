
import {
    FormInputsForm,
} from "@/hooks/FormInputs";

import type { Product } from "../schema";
import { 
    useCreateFormFields, 
    useUpdateFormFields 
} from "../hook";

import { recordToList } from "@/utils/funcs"
import { Button, List, Inline } from "@/shared"

import { useSearchParams } from "../hook"

import { 
    useDeleteMutation,
} from "../service";


export { 
    UpdateForm,
    CreateForm,
    
    CategoryBar,
    DeleteButton,    
};


function UpdateForm({ product, onSuccess, className }: { 
    product: Product,
    onSuccess?: () => void
    className?: string
}) {
    const form = useUpdateFormFields({product, onSuccess})
    return (
        <FormInputsForm
        formInputs={form}
        submitLabel="Update product"
        className={className}
        />
    )
}

function CreateForm({ onSuccess, className }: {
    onSuccess?: () => void,
    className?: string,
}) {
    const form = useCreateFormFields({ onSuccess });
    return (
        <FormInputsForm
        formInputs={form}
        submitLabel="Create product"
        className={className}
        />
    )
}


function CategoryBar() {
    const { bindings: { categories } } = useSearchParams()
    return (
    <Inline gap="none">
        <List
        items={recordToList(categories.options)}
        render={([k, v]) =>
            <Button 
            key={`category-${k}`}
            variant="secondary"
            className="bg-slate-400 text-slate-900 border border-black 
                rounded-t-md border-b-0 rounded-b-none"  
            onClick={() => { 
                categories.set([v])
            }}>
                {categories.labels[k]}
            </Button>
        } />
    </Inline>
    )
}

function DeleteButton({ productId, onClick }: {
    productId: number,
    onClick?: () => void,
}) {
    const {mutate, isPending} = useDeleteMutation();

    const handleClick = () => mutate( productId, { 
        onSuccess: () => onClick?.() 
    })

    return (
        <Button
        variant="danger"
        type="button"
        disabled={isPending}
        onClick={handleClick}>
            Delete product
        </Button>
    )
}
