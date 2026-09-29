import { useState } from "react"
import { 
    StarIcon as SolidStarIcon, 
} from "@heroicons/react/24/solid"
import { StarIcon as OutlineStarIcon } from "@heroicons/react/24/outline"


import { InputLabelComponent } from "@/shared/InputLableComponent"
import { ToggleComponent } from "@/shared/ToggleComponent"

import {
    useCreateMutation,
} from "../service"


export { CreateReviewComponent }


function CreateReviewComponent({ productId }:{ 
    productId: number
}) {
    const createReviewMutation = useCreateMutation(productId)
    const [ rating, setRating ] = useState(0)
    const [ description, setDescription ] = useState('')

    function handleSubmit (e: React.SubmitEvent<HTMLFormElement>) {
        e.preventDefault()
        if (!rating) return
        createReviewMutation.mutate({
            rating, description
        })
    }

    return (
        <form onSubmit={handleSubmit} aria-label="review-form">
            <CreateReviewStarIcon value={1} rating={rating} setRating={setRating}/>
            <CreateReviewStarIcon value={2} rating={rating} setRating={setRating}/>
            <CreateReviewStarIcon value={3} rating={rating} setRating={setRating}/>
            <CreateReviewStarIcon value={4} rating={rating} setRating={setRating}/>
            <CreateReviewStarIcon value={5} rating={rating} setRating={setRating}/>

            <InputLabelComponent name="description">
                <textarea
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="description"
                />
            </InputLabelComponent>

            <button type="submit">Submit</button>
        </form>
    )
}

function CreateReviewStarIcon(
    {value, rating, setRating}:
    {   
        value: number,
        rating: number,
        setRating: (rating: number) => void,
    } 
) {
    return (
        <button
        type="button"
        onClick={() => setRating(value)}
        >
            <ToggleComponent 
            state={value <= rating}
            onChild={<SolidStarIcon 
                aria-label="solidstaricon" className="h-6 w-6" 
            />}
            offChild={<OutlineStarIcon 
                aria-label="outlinestaricon" className="h-6 w-6" 
            />}
            />
        </button>
    )
    
}