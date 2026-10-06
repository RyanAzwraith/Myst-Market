import { 
    XMarkIcon,
    ModalTrigger,
    Button,
    ErrorMsg,
    Heading,
} from "@/shared"

import {
    TextAreaField,
    FormInputsContainer,
} from "@/hooks/FormInputs"

import { 
    useDeleteMutation 
} from "../service"
import { useCreateForm } from "../hook"
import { RatingFormat } from "./presentation"

export { 
    CreateForm,
    DeleteButton
}


function CreateForm({ productId }:{ 
    productId: number
}) {
    const { 
        bindings: { rating, description }, 
        handleSubmit, 
        errorMsg
    } = useCreateForm({ productId })

    return (
    <FormInputsContainer submit={handleSubmit} >
        <RatingFormat 
        rating={rating.get() ?? 0} 
        onClick={(value) => rating.set(value)}
        />

        <TextAreaField binding={description} /> 

        <ErrorMsg errorMsg={errorMsg} />
        <Button type="submit">Submit</Button>
    </FormInputsContainer>
    )
}

function DeleteButton({ reviewId }:  { 
    reviewId: number 
}) {
    const deleteMutation = useDeleteMutation()

    return (  
    <ModalTrigger
    button={<XMarkIcon/>}
    render={onClose => <>
        <Heading level={2}>Are you sure you'd like to delete your Review?</Heading>
        
        <Button
        type="button"
        onClick={() => {
            deleteMutation.mutate(reviewId)
            onClose()
        }}>
            Yes
        </Button>

        <Button 
        type="button" 
        onClick={onClose}
        >
            No
        </Button>
    </>} />
    )
}