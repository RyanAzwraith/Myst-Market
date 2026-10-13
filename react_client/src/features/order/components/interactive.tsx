
import { FormInputsForm } from "@/hooks/FormInputs"
import type { Order } from "../schema"
import { useStatusForm } from "../hook"


export { StatusForm }


function StatusForm({ order, className } : {
    order: Order
    className?: string
}) {
    const statusForm = useStatusForm({ order })
    return (
        <FormInputsForm
        formInputs={statusForm}
        className={className}
        />
    )
}