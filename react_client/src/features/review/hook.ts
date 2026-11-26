
import { 
    useFormInputs,
    kind,
} from "@/hooks/FormInputs"
import { useCreateMutation } from "./service"
import type { ReviewInput } from "../product"
import { isDemoEnvironment, mockFormData } from '@/app/formAutoFillData'


export { 
    useCreateForm 
}

const createFormFields = {
    rating: {
        kind: kind.number,
        label: "Rating",
        initial: isDemoEnvironment ? mockFormData.review.rating : undefined,
        validate: (value) => 
            value && 1 <= value && value <= 5 ? null : "Select Rating"
        
    },
    description: {
        kind: kind.text,
        label: "Description",
        placeholder: "Description",
        initial: isDemoEnvironment ? mockFormData.review.description : undefined,
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