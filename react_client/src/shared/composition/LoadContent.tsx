import { type ReactNode } from "react"
import { 
    ChevronDownIcon,
} from "@/shared/presentation/icon"


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
    <div className={className}>
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
