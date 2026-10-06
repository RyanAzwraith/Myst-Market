
import { Button } from "@/shared";

import { FormInputsForm } from "@/hooks/FormInputs";
import { useCreateForm, useUpdateForm } from "../hook";
import {
    ImportButton,
    downloadCsv,
    type SaleAnalytics,
} from "../index"

import { 
    useDeleteMutation,
    useExportMutation,
    useImportMutation,
} from "../service"


export {
    CreateForm,
    UpdateForm,
    DeleteButton,
    ImportSalesButton,
    ExportSalesButton,
}


function CreateForm({onSuccess}: {onSuccess?: () => void}) {
    const createForm = useCreateForm({onSuccess});
    return (
        <FormInputsForm
        formInputs={createForm}
        />
    )
}
function UpdateForm({sale, onSuccess}: {
    sale: SaleAnalytics, 
    onSuccess?: () => void
}) {
    const updateForm = useUpdateForm({sale, onSuccess});
    return (
        <FormInputsForm
        formInputs={updateForm}
        />
    )
}

function DeleteButton({ saleId, onClick }: {
    saleId: number,
    onClick?: () => void,
}) {
    const {mutate, isPending} = useDeleteMutation({
        saleId, onSuccess: onClick
    });

    return (
        <Button
        type="button"
        disabled={isPending}
        onClick={() => mutate()}
        >
            Delete sale
        </Button>
    )
}

function ImportSalesButton() {
	const mutation = useImportMutation()

	return (
		<ImportButton
		label="Import Sales"
		isPending={mutation.isPending}
		onFileSelected={(file: File) => mutation.mutate(file)}
		/>
	)
}

function ExportSalesButton() {
	const mutation = useExportMutation()
	return (
		<Button
		type="button"
		disabled={mutation.isPending}
		onClick={() => void downloadCsv(
			mutation.mutateAsync,
			"sales.csv",
		)}
		>
			{mutation.isPending ? "Exporting..." : "Export Sales"}
		</Button>
	)
}