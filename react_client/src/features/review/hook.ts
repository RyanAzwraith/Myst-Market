
import { 
    useFormInputs,
    kind,
} from "@/hooks/FormInputs"
import { useCreateMutation } from "./service"
import type { ReviewInput } from "../product"


export { 
    useCreateForm 
}

const createFormFields = {
    rating: {
        kind: kind.number,
        label: "Rating",
        validate: (value) => 
            value && 1 <= value && value <= 5 ? null : "Select Rating"
        
    },
    description: {
        kind: kind.text,
        label: "Description",
        placeholder: "Description"
    }
} 

const useCreateForm = ({ productId }: {
    productId: number
}) => {
    const createMutation = useCreateMutation(productId)
    return useFormInputs({
        fields: createFormFields,
        onSubmit: ({rating, description}) =>
            createMutation.mutate({ rating, description } as ReviewInput)
    })
}