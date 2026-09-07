
import { XMarkIcon } from "@/shared/elements/icon"
import { PopUpModalComponent } from "@/shared/PopUpModalComponent"

import { useDeleteMutation } from "../service"

export { DeleteReviewButton }

function DeleteReviewButton({ reviewId }:  { 
    reviewId: number 
}) {
    const deleteMutation = useDeleteMutation()

    return (  
        <PopUpModalComponent
        content={onClose => <>
            <h2>Are you sure you'd like to delete your Review?</h2>
            <button 
            type="button"
            onClick={() => {
                deleteMutation.mutate(reviewId)
                onClose()
            }}>
                Yes
            </button>
            <button type="button" onClick={onClose}>No</button>
        </>}>
            <XMarkIcon/>
        </PopUpModalComponent>
    )
}