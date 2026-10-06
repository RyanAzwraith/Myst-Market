import { type ReactNode } from "react"
import { NavLink } from "react-router-dom"
import { twMerge } from "tailwind-merge"
import { List } from "../composition"

export { NavBar }

function NavBar<T>({
    items,
    path,
    render,
    onClick,
    className,
    linkClassName,
    activeClassName = "border-b-2 font-semibold",
    inactiveClassName = "text-gray-500",
}: {
    items: T[]
    render: (item: T) => ReactNode
    path: (item: T) => string
    onClick?: (item: T) => void
    className?: string
    linkClassName?: string
    activeClassName?: string
    inactiveClassName?: string
}) {
    return (
        <div className={twMerge("flex border-b", className)}>
            <List
                items={items}
                render={(item) => (
                    <NavLink
                        className={({ isActive }) => twMerge(
                            "px-4 py-2",
                            isActive ? activeClassName : inactiveClassName,
                            linkClassName,
                        )}
                        to={path(item)}
                        onClick={() => onClick?.(item)}
                    >
                        {render(item)}
                    </NavLink>
                )}
            />
        </div>
    )
}
