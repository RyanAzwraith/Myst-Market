
import {
    FormInputsForm,
} from "@/hooks/FormInputs";

import type { Product } from "../schema";
import { 
    useCreateFormFields, 
    useUpdateFormFields 
} from "../hook";

import { recordToList } from "@/utils/funcs"
import {
    Button,
    ChevronDownIcon,
    Inline,
    List,
    ModalTrigger,
} from "@/shared"

import { useSearchParams } from "../hook"

import { 
    useDeleteMutation,
} from "../service";


export { 
    UpdateForm,
    CreateForm,
    
    CategoryBar,
    DeleteButton,    
    CategoryMenuButton,
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
        className={`product-update-form ${className ?? ""}`}
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
        className={`product-create-form ${className ?? ""}`}
        />
    )
}


function CategoryBar() {
    const { bindings: { categories } } = useSearchParams()
    return (
    <Inline gap="none"     className="product-category-bar">
        <List
        items={recordToList(categories.options)}
        render={([k, v]) =>
            <Button 
            key={`category-${k}`}
            variant="secondary"
            className="product-category-button"
            onClick={() => { 
                categories.set([v])
            }}>
                {categories.labels[k]}
            </Button>
        } />
    </Inline>
    )
}

function CategoryMenuButton() {
    const { bindings: { categories } } = useSearchParams()

    return (
        <ModalTrigger
        dropdown
        wrapperClassName="app-bar-mobile-nav"
        modalClassName="app-bar-mobile-nav-dialog"
        dialogLabel="Product categories"
        button={
            <>
                <span>Categories</span>
                <ChevronDownIcon className="mobile-nav-trigger-icon" />
            </>
        }
        render={onClose => (
            <div className="mobile-nav-menu">
                <List
                items={recordToList(categories.options)}
                render={([k, v]) => (
                    <Button
                    key={`mobile-category-${k}`}
                    variant="secondary"
                    className="mobile-nav-menu-item"
                    onClick={() => {
                        categories.set([v])
                        onClose()
                    }}
                    >
                        {categories.labels[k]}
                    </Button>
                )}
                />
            </div>
        )}
        />
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
        className="product-delete-button"
        onClick={handleClick}>
            Delete product
        </Button>
    )
}
