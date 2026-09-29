import { ToggleComponent } from "@/shared/ToggleComponent"
import { 
    StarIcon as SolidStarIcon, 
} from "@heroicons/react/24/solid"
import { StarIcon as OutlineStarIcon } from "@heroicons/react/24/outline"

export { RatingFormat }

function RatingFormat({ rating }: {
    rating:number 
} ) {
    return (
        <div>
            <span>{rating}/5</span>
        {Array.from({ length: 5 }, (_, i) =>
            <ToggleComponent 
            state={i+1 <= rating}
            onChild={<SolidStarIcon 
                aria-label="solidstaricon" key={i} className="h-6 w-6"  
            />}
            offChild={<OutlineStarIcon 
                aria-label="outlinestaricon" key={i} className="h-6 w-6" 
            />}
            />
        )}

        </div>
    )
}