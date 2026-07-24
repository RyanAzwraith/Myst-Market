import { ToggleComponent } from "@/shared/ToggleComponent"
import { 
    StarIcon as SolidStarIcon, 
} from "@heroicons/react/24/solid"
import { StarIcon as OutlineStarIcon } from "@heroicons/react/24/outline"

function RatingComponent(
    {rating}:
    {rating:number} 
) {
    return (
        <div>
            <span>{rating}/5</span>
        {Array.from({ length: 5 }, (_, i) =>
            <ToggleComponent 
            state={i+1 <= rating}
            onChild={<SolidStarIcon aria-label="solidstaricon" key={i} />}
            offChild={<OutlineStarIcon aria-label="outlinestaricon" key={i} />}
            />
        )}

        </div>
    )
}
export { RatingComponent}