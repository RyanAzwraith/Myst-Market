
import { Button } from "@/shared";

import { FormInputsForm } from "@/hooks/FormInputs";
import { useCreateForm, useUpdateForm } from "../hook";
import {
    type SaleAnalytics,
} from "../index"

import { 
    useDeleteMutation,
} from "../service"


export {
    CreateForm,
    UpdateForm,
    DeleteButton,
}


function CreateForm({
    onSuccess,
    className,
}: {
    onSuccess?: () => void
    className?: string
}) {
    const createForm = useCreateForm({onSuccess});
    return (
        <FormInputsForm
        formInputs={createForm}
        className={`sale-create-form ${className ?? ""}`}
        />
    )
}
function UpdateForm({sale, onSuccess, className}: {
    sale: SaleAnalytics, 
    onSuccess?: () => void
    className?: string
}) {
    const updateForm = useUpdateForm({sale, onSuccess});
    return (
        <FormInputsForm
        formInputs={updateForm}
        className={`sale-update-form ${className ?? ""}`}
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
        variant="danger"
        type="button"
        disabled={isPending}
        className="sale-delete-button"
        onClick={() => mutate()}
        >
            Delete sale
        </Button>
    )
}
