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
    <FormInputsContainer
    className="review-create-form"
    submit={handleSubmit}
    >
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
    wrapperClassName="review-delete-button"
    className="review-delete-trigger"
    modalClassName="review-delete-modal"
    button={<XMarkIcon/>}
    render={onClose =>
        <div
        className="review-delete-confirmation"
        onClick={event => event.stopPropagation()}
        >
            <Heading level={2} className="review-delete-confirmation-title">
                Are you sure you'd like to delete your Review?
            </Heading>
            <div className="review-delete-confirmation-actions">
                <Button
                type="button"
                variant="danger"
                onClick={() => {
                    deleteMutation.mutate(reviewId)
                    onClose()
                }}>
                    Yes, delete
                </Button>

                <Button
                type="button"
                variant="secondary"
                onClick={onClose}
                >
                    Cancel
                </Button>
            </div>
        </div>
    } />
    )
}