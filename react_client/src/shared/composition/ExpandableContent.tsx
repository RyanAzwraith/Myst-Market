import { type ReactNode, useState } from "react"
import { 
    ChevronDownIcon,
    ChevronUpIcon,
} from "@/shared/presentation/icon"


export {
    ExpandableContent
}

function ExpandableContent({
    content,
    limit = 3,
    iconClassName,
    iconButtonClassName,
}: { 
    content: ReactNode[],
    limit?: number
    className?: string
    iconClassName?: string
    iconButtonClassName?: string
}) {
    const [ isExpanded, setIsExpanded ] = useState(false)
    const shownChildren = isExpanded
        ? content
        : content.slice(0, limit);
    const isExpandable = content.length > limit

    return (
    <>
        {shownChildren}
            
        { isExpandable && isExpanded ? 
        <ChevronUpIcon 
        ariaLabel="Collapse content"
        className={iconClassName}
        buttonClassName={iconButtonClassName}
        onClick={() => setIsExpanded((current) => !current)}
        />
            : 
        <ChevronDownIcon 
        ariaLabel="Expand content"
        className={iconClassName}
        buttonClassName={iconButtonClassName}
        onClick={() => setIsExpanded((current) => !current)}
        />
        }
    </>
    )
}
