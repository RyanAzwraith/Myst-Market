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
}: { 
    content: ReactNode[],
    limit?: number
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
        <ChevronDownIcon 
        onClick={() => setIsExpanded((current) => !current)}
        />
            : 
        <ChevronUpIcon 
        onClick={() => setIsExpanded((current) => !current)}
        />
        }
    </>
    )
}
