import { type ReactNode, useState } from "react"
import { List } from "../composition"
import { Link } from "react-router-dom"


export { NavBar }

function NavBar({ items, path, render, onClick }: {
    items: any[],
    render: (item: any ) => ReactNode
    path: (item: any) => string
    onClick?: (item: any) => void
}) {
    const [current, setCurrent] = useState<number | null>(null)
    const className = (i: number) => [
        "px-4 py-2",
        i === current
            ? "border-b-2 font-semibold"
            : "text-gray-500"
    ].join(" ")
    return (
    <div className="flex border-b">
        <List
        items={items}
        render={(item, i) => 
            <Link
            className={className(i)}
            to={path(item)}
            onClick={() => {
                onClick?.(item)
                setCurrent(i)
            }}
            children={render(item)}
            />
        } />
    </div>
    )
}