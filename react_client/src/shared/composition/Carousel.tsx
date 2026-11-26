import { 
    useState, 
    type ReactNode 
} from "react"
import { 
    ChevronLeftIcon,
    ChevronRightIcon,
} from "@/shared/presentation/icon"
import { classNames } from "@/utils/classNames"
import { Inline } from "../composition"

export {
    Carousel
}


function Carousel({
    content,
    limit = 3,
    className,
    iconClassName,
    iconButtonClassName,
    }: {
    content: ReactNode[], 
    limit?: number
    className?: string
    iconClassName?: string
    iconButtonClassName?: string
} ) {
    const [offset, setOffset] = useState(0) 

    if (content.length === 0) return null

    const visibleCount = Math.min(limit, content.length)
    const maxOffset = content.length - visibleCount
    const hasNavigation = content.length > visibleCount
    const shownContent = []
    for (let i = 0; i < visibleCount; i++) {
        shownContent.push(content[(offset + i) % content.length])
    }

    return (
    <Inline 
    justify="center"
    className={classNames(
        "shared-carousel",
        !hasNavigation && "shared-carousel-no-navigation",
        className,
    )}
    children={ 
    <>
        {hasNavigation && (
            <ChevronLeftIcon 
            ariaLabel="Previous items"
            className={iconClassName}
            buttonClassName={iconButtonClassName}
            onClick={() => 
                setOffset(o => o === 0 ? maxOffset : o - 1)
            }/>
        )}

        <div
        key={offset}
        className="shared-carousel-items"
        >
            {shownContent}
        </div>

        {hasNavigation && (
            <ChevronRightIcon
            ariaLabel="Next items"
            className={iconClassName}
            buttonClassName={iconButtonClassName}
            onClick={() => 
                setOffset(o => o === maxOffset ? 0 : o + 1)
            }/>
        )}
    </> 
    } />
)}
