import { 
    useState, 
    type ReactNode 
} from "react"
import { 
    ChevronLeftIcon,
    ChevronRightIcon,
} from "@/shared/presentation/icon"
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

    const shownContent = []
    for (let i = 0; i < Math.min(limit, content.length); i++) {
        shownContent.push(content[(offset + i) % content.length])
    }

    return (
    <Inline 
    justify="center"
    className={className}
    children={ 
    <>
        <ChevronLeftIcon 
        ariaLabel="Previous items"
        className={iconClassName}
        buttonClassName={iconButtonClassName}
        onClick={() => 
            setOffset(o => (o - 1 + content.length) % content.length)
        }/>

        {shownContent}

        <ChevronRightIcon
        ariaLabel="Next items"
        className={iconClassName}
        buttonClassName={iconButtonClassName}
        onClick={() => 
            setOffset(o => (o + 1) % content.length)
        }/>
    </> 
    } />
)}
