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
    <div className="flex items-center gap-2">
        <Span className="text-2xl font-semibold text-gray-700">
            {rating.toFixed(1)}/5
        </Span>
        <div className="flex items-center gap-0.5">
            <List
            items={Array.from({ length: 5 })}
            render={(_, n) => 
                n + 1 <= rating ? 
                <StarSolidIcon
                key={`rating-${n}`}
                className="h-5 w-5 text-amber-400"
                buttonClassName="transition hover:scale-110"
                onClick={() => onClick?.(n + 1)}
                /> 
                    : 
                <StarOutlineIcon
                key={`rating-${n}`}
                className="h-5 w-5 text-amber-400"
                buttonClassName="transition hover:scale-110"
                onClick={() => onClick?.(n + 1)}
                />
            }/>
        </div>
    </div>
    )
}
