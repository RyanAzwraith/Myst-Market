import { type ReactNode } from "react"
import { 
    ChevronDownIcon,
} from "@/shared/presentation/icon"


export {
    LoadContent
}

function LoadContent({
    content, hasMore, onClick, 
}: { 
    content: ReactNode[],
    hasMore: boolean,
    onClick: () => void
}) {
    return (
    <>
        {content}
        {hasMore && (
        <ChevronDownIcon 
        onClick={onClick} 
        />
        )}
    </>
    )
}
