import { useState, type ReactNode } from "react"
import { 
    ChevronRightIcon,
    ChevronLeftIcon,
} from "@heroicons/react/24/solid"

function CarouselComponent(
    {children, limit}:
    {children: ReactNode[], limit: number} 
) {
    const [offset, setOffset] = useState(0) 
    const shownChildren = []

    for (let i = 0; i < Math.min(limit, children.length); i++) {
        shownChildren.push(children[(offset + i) % children.length])
    }
    return (
        <div
        className="flex items-center gap-4"
        >
            <button
            onClick={() => 
                setOffset(o => (o + 1) % children.length)
            }
            >
                <ChevronLeftIcon aria-label="chevronlefticon" />
            </button>

            {shownChildren}

            <button
            onClick={() => 
                setOffset(o => (o - 1 + children.length) % children.length)
            }
            >
                <ChevronRightIcon aria-label="chevronrighticon" />
            </button>
        </div>
    )
}

export {
    CarouselComponent
}