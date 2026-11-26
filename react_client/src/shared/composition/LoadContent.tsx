import { type ReactNode } from "react"
import { 
    ChevronDownIcon,
} from "@/shared/presentation/icon"
import { classNames } from "@/utils/classNames"


export {
    LoadContent
}

function LoadContent({
    content,
    hasMore,
    onClick,
    className,
    iconClassName,
    iconButtonClassName,
}: { 
    content: ReactNode[],
    hasMore: boolean,
    onClick: () => void
    className?: string
    iconClassName?: string
    iconButtonClassName?: string
}) {
    return (
    <div className={classNames("shared-load-content", className)}>
        {content}
        {hasMore && (
        <ChevronDownIcon 
        ariaLabel="Load more content"
        className={iconClassName}
        buttonClassName={iconButtonClassName}
        onClick={onClick} 
        />
        )}
    </div>
    )
}
