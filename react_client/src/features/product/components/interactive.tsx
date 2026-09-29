
import {
    FormInputsForm,
} from "@/hooks/FormInputs";

import type { Product } from "../schema";
import { 
    useCreateFormFields, 
    useUpdateFormFields 
} from "../hook";

import { recordToList } from "@/utils/funcs"
import { List } from "@/shared"

import { useSearchParams } from "../hook"

import { 
    downloadCsv,
    ImportButton,
} from "../index"

import { 
    useDeleteMutation,
    useExportMutation,
    useImportMutation,
} from "../service";


export { 
    UpdateForm,
    CreateForm,
    
    CategoryBar,
    DeleteButton,    
    ImportProductsButton,
    ExportProductsButton,
};


function UpdateForm({ product, onSuccess }: { 
    product: Product,
    onSuccess?: () => void
}) {
    const form = useUpdateFormFields({product, onSuccess})
    return (
        <FormInputsForm
        formInputs={form}
        submitLabel="Update product"
        />
    )
}

function CreateForm({ onSuccess }: {
    onSuccess?: () => void,
}) {
    const form = useCreateFormFields({ onSuccess });
    return (
        <FormInputsForm
        formInputs={form}
        submitLabel="Create product"
        />
    )
}


function CategoryBar() {
    const { bindings: { categories } } = useSearchParams()
    return (
        <List
        items={recordToList(categories.options)}
        renderItem={([k, v]) =>
            <button 
            className="rounded border border-slate-300 px-2 py-1 text-sm"
            onClick={() => { 
                categories.set([v])
            }}>
                {categories.labels[k]}
            </button>
        } />
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
        <button
        type="button"
        disabled={isPending}
        onClick={handleClick}>
            Delete product
        </button>
    )
}

function ImportProductsButton() {
	const mutation = useImportMutation()
	return (
		<ImportButton
        label="Import Products"
        isPending={mutation.isPending}
        onFileSelected={(file: File) => mutation.mutate(file)}
		/>
	)
}

function ExportProductsButton() {
	const mutation = useExportMutation()

	return (
		<button
        type="button"
        disabled={mutation.isPending}
        onClick={() => void downloadCsv(
            mutation.mutateAsync,
            "products.csv",
        )}
		>
			{mutation.isPending ? "Exporting..." : "Export Products"}
		</button>
	)
}