import { 
    StarSolidIcon, 
    StarOutlineIcon,
    List,
    Span,
} from "@/shared"


export { RatingFormat }


function RatingFormat({ rating, onClick }: {
    rating: number,
    onClick?: (value: number) => void
} ) {
    return (
    <div>
        <Span>{rating}/5</Span>
        <List
        items={Array.from({ length: 5 })}
        render={(_, n) => 
            n + 1 <= rating ? 
            <StarSolidIcon key={`rating-${n}`} onClick={() => onClick?.(n + 1)}/> 
                : 
            <StarOutlineIcon key={`rating-${n}`} onClick={() => onClick?.(n + 1)}/>
        }/>
    </div>
    )
}
