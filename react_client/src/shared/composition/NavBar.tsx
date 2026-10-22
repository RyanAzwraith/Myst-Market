import { type ReactNode } from "react"
import { NavLink } from "react-router-dom"
import { classNames } from "@/utils/classNames"
import { List } from "../composition"

export { NavBar }

function NavBar<T>({
    items,
    path,
    render,
    onClick,
    className,
    linkClassName,
    activeClassName = "shared-nav-link-active",
    inactiveClassName = "shared-nav-link-inactive",
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
        <div className={classNames("shared-nav-bar", className)}>
            <List
                items={items}
                render={(item) => (
                    <NavLink
                        className={({ isActive }) => classNames(
                            "shared-nav-link",
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
