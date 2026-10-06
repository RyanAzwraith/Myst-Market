
export {
    OnSaleDiv,
}

function OnSaleDiv({
    onSale, children
}: {
    onSale: boolean,
    children: React.ReactNode
}) {
    return (
    <div className={onSale ? "bg-red-200" : ""}>
        {children}
    </div>
    )
}