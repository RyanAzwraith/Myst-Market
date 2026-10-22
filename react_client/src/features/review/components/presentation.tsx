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
    <div className="rating-format">
        <Span className="rating-value">
            {rating.toFixed(1)}/5
        </Span>
        <div className="rating-stars">
            <List
            items={Array.from({ length: 5 })}
            render={(_, n) => 
                n + 1 <= rating ? 
                <StarSolidIcon
                key={`rating-${n}`}
                className="rating-star-icon"
                buttonClassName="rating-star-button"
                onClick={() => onClick?.(n + 1)}
                /> 
                    : 
                <StarOutlineIcon
                key={`rating-${n}`}
                className="rating-star-icon"
                buttonClassName="rating-star-button"
                onClick={() => onClick?.(n + 1)}
                />
            }/>
        </div>
    </div>
    )
}
