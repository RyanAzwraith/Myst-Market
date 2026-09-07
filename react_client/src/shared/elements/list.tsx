
export {
    List
}

function List<T>({items, renderItem}: {
    items: T[],
    renderItem: (item: T, index: number) => React.ReactNode
}) {
    return (
        <div>
            {items.map((item, index) => renderItem(item, index))}
        </div>
    )
}