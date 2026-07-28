import { type ReactNode, useState } from "react"
import { 
    ChevronDownIcon,
    ChevronUpIcon,
} from "@heroicons/react/24/solid"

import { ToggleComponent } from "@/shared/ToggleComponent"

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
            
        { isExpandable && 
            <button
            onClick={() => setIsExpanded((current) => !current)}
            >
                <ToggleComponent 
                state={!isExpanded}
                onChild={<ChevronDownIcon aria-label="chevrondownicon" />}
                offChild={<ChevronUpIcon aria-label="chevronupicon" />}
                />
            </button>
        }

        </div>
    )
}

export {
    ExpandableContent
}