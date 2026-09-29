import { type ReactNode, useState } from "react"
import { 
    ChevronDownIcon,
    ChevronUpIcon,
} from "@/shared/presentation/icon"


export {
    ExpandableContent
}

function ExpandableContent(
    {children}:
    {children: ReactNode[]} 
) {
    const [ isExpanded, setIsExpanded ] = useState(false)
    const shownChildren = isExpanded
        ? children
        : children.slice(0, 3);
    const isExpandable = children.length > 3

    return (
    <div>
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
    </div>
    )
}
